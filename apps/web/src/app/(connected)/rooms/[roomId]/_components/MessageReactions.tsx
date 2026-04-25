"use client";

import { useState } from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { Reaction } from "../types";
import { Smile } from "lucide-react";

export default function MessageReactions({
    messageId,
    reactions,
    onReaction,
}: {
    messageId: string;
    reactions: Reaction[];
    onReaction: (messageId: string, emoji: string) => void;
}) {
    const [showPicker, setShowPicker] = useState(false);

    const grouped = reactions.reduce((acc, r) => {
        acc[r.emoji] = (acc[r.emoji] ?? 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="flex flex-wrap items-center gap-1">
            {Object.entries(grouped).map(([emoji, count]) => (
                <button
                    key={emoji}
                    onClick={() => onReaction(messageId, emoji)}
                    className="text-xs bg-muted px-1.5 py-0.5 rounded-full hover:bg-muted/80 transition"
                >
                    {emoji} {count}
                </button>
            ))}

            <button
                onClick={() => setShowPicker((v) => !v)}
                className="hidden group-hover:flex items-center justify-center size-6 rounded-full hover:bg-muted transition text-muted-foreground"
            >
                <Smile className="size-3.5" />
            </button>

            {showPicker && (
                <div className="absolute bottom-8 z-50">
                    <Picker
                        data={data}
                        locale="fr"
                        onEmojiSelect={(emoji: { native: string }) => {
                            onReaction(messageId, emoji.native);
                            setShowPicker(false);
                        }}
                        onClickOutside={() => setShowPicker(false)}
                        previewPosition="none"
                        skinTonePosition="none"
                    />
                </div>
            )}
        </div>
    );
}