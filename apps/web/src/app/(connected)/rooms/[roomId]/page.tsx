"use client";

import { useState, useEffect, useRef  } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { apiGet, apiPost } from "@/lib/api.client";
import { Room, Member, Message, Reaction } from "./types";
import RoomHeader from "./_components/RoomHeader";
import RoomMembers from "./_components/RoomMembers";
import MessageList from "./_components/MessageList";
import MessageInput from "./_components/MessageInput";

import { socket } from "@/lib/socket";
import GeneralRoom from "./_components/GeneralRoom";
import { useRouter } from "next/navigation";

export default function RoomPage() {
    const router = useRouter();
    const { roomId } = useParams() as { roomId: string };
    const { data: session } = useSession();
    const [room, setRoom] = useState<Room | null>(null);
    const [members, setMembers] = useState<Member[]>([]);

    const [messages, setMessages] = useState<Message[]>([]);
    const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!session?.accessToken) return;

        socket.auth = { token: session.accessToken };
        socket.connect();

        socket.on('connect', () => {
            console.log('🔗 Connecté :', socket.id);
        });

        socket.on('ready', () => {
            console.log('✅ Prêt, on rejoint la room');
            socket.emit('joinRoom', roomId);
        });

        socket.on("messageHistory", (history: Message[]) => {
            console.log("📦 history reçu:", history);
            setMessages(history);
        });

        socket.on('newMessage', (message: Message) => {
            setMessages((prev) => [...prev, message]);
        });

        socket.on('reactionUpdated', ({ messageId, reactions }: { messageId: string; reactions: Reaction[] }) => {
            setMessages((prev) =>
                prev.map((m) => m.id === messageId ? { ...m, reactions } : m)
            );
        });

        socket.on('userTyping', ({ userId, username }: { userId: string; username: string }) => {
            setTypingUsers((prev) => ({ ...prev, [userId]: username }));
        });

        socket.on('userStopTyping', ({ userId }: { userId: string }) => {
            setTypingUsers((prev) => {
                const next = { ...prev };
                delete next[userId];
                return next;
            });
        });

        return () => {
            socket.emit('leaveRoom', roomId);
            socket.off('connect');
            socket.off('ready');
            socket.off('messageHistory');
            socket.off('newMessage');
            socket.off('reactionUpdated');
            socket.off('userTyping');
            socket.off('userStopTyping');
            socket.disconnect();
        };
    }, [session, roomId]);


    useEffect(() => {
        if (!session?.accessToken) return;
        apiGet<Room>(`/rooms/${roomId}`, session.accessToken).then(setRoom);
        apiGet<Member[]>(`/rooms/${roomId}/members`, session.accessToken).then(setMembers);
    }, [roomId, session?.accessToken]);

    useEffect(() => {
        function handleProfileUpdated(e: CustomEvent<{ username: string; color: string; id: string }>) {
            const { username, color, id } = e.detail;

            setMessages((prev) =>
                prev.map((m) =>
                    m.author.id === id
                        ? { ...m, author: { ...m.author, username, color } }
                        : m
                )
            );

            setMembers((prev) =>
                prev.map((m) =>
                    m.user.id === id
                        ? { ...m, user: { ...m.user, username, color } }
                        : m
                )
            );
        }

        window.addEventListener("profileUpdated", handleProfileUpdated as EventListener);
        return () => window.removeEventListener("profileUpdated", handleProfileUpdated as EventListener);
    }, []);

    function handleSendMessage(content: string) {
        socket.emit('sendMessage', { roomId, content });
        socket.emit('markAsRead', roomId);
    }

    function handleReaction(messageId: string, emoji: string) {
        socket.emit('addReaction', { messageId, emoji, roomId });
    }

    async function handleDirectMessage(targetUserId: string) {
        if (!session?.accessToken) return;
        const directRoom = await apiPost<Room>(
            `/rooms/direct/${targetUserId}`,
            {},
            session.accessToken
        );

        window.dispatchEvent(new CustomEvent("roomCreated", {
            detail: directRoom
        }));
        
        router.push(`/rooms/${directRoom.id}`);
    }

    if (!room) return <div className="p-4 text-muted-foreground">Chargement...</div>;

    if (room.isGeneral) {
        return <GeneralRoom room={room} />;
    }

    return (
        <div className="flex h-full">
            <div className="flex flex-col flex-1 overflow-hidden">
                <RoomHeader
                    room={room}
                    onMemberAdded={(newMember) => setMembers((prev) => [...prev, newMember])}
                />
                <MessageList
                    messages={messages}
                    currentUserId={session?.user?.id ?? ""}
                    onReaction={handleReaction}
                    typingUsers={typingUsers}
                />
                <MessageInput
                    onSend={handleSendMessage}
                    onTyping={() => socket.emit('typing', roomId)}
                    onStopTyping={() => socket.emit('stopTyping', roomId)}
                />
            </div>
            <RoomMembers
                room={room}
                members={members}
                onMemberRemoved={(memberId) => setMembers((prev) => prev.filter((m) => m.id !== memberId))}
                onDirectMessage={handleDirectMessage}
            />
        </div>
    );
}