"use client";

import { useEffect, useRef } from "react";
import { Message as MessageType } from "../types";
import Message from "./Message";
import TypingIndicator from "./TypingIndicator";

export default function MessageList({
    messages,
    currentUserId,
    onReaction,
    typingUsers
}: {
    messages: MessageType[];
    currentUserId: string;
    onReaction: (messageId: string, emoji: string) => void;
    typingUsers: Record<string, string>;
}) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.length === 0 && (
                <p className="text-muted-foreground text-sm text-center mt-8">
                    Aucun message pour l'instant. Soyez le premier à écrire !
                </p>
            )}
            {messages.map((message) => (
                <Message
                    key={message.id}
                    message={message}
                    isMe={message.author.id === currentUserId}
                    onReaction={onReaction}
                />
            ))}
            <TypingIndicator typingUsers={typingUsers} />
            <div ref={bottomRef} />
        </div>
    );
}