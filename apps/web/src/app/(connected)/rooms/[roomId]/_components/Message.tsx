"use client";

import { Message as MessageType } from "../types";
import MessageReactions from "./MessageReactions";

export default function Message({
    message,
    isMe,
    onReaction,
}: {
    message: MessageType;
    isMe: boolean;
    onReaction: (messageId: string, emoji: string) => void;
}) {
    return (
        <div className={`flex gap-2 group ${isMe ? "flex-row-reverse" : ""}`}>
            <div
                className="size-8 rounded-full shrink-0 mt-1"
                style={{ backgroundColor: message.author.color }}
            />

            <div className={`flex flex-col gap-1 max-w-[70%] ${isMe ? "items-end" : ""}`}>
                <div className={`flex items-baseline gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                    <span className="text-xs font-medium">{message.author.username}</span>
                    <span className="text-xs text-muted-foreground">
                        {new Date(message.createdAt).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </span>
                </div>

                <div className={`px-3 py-2 rounded-lg text-sm ${isMe
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}>
                    {message.content}
                </div>

                <MessageReactions
                    messageId={message.id}
                    reactions={message.reactions}
                    onReaction={onReaction}
                />
            </div>
        </div>
    );
}