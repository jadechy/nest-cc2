"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

export default function MessageInput({
    onSend,
    onTyping,
    onStopTyping,
}: {
    onSend: (content: string) => void;
    onTyping: () => void;
    onStopTyping: () => void;
}) {
    const [content, setContent] = useState("");
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    function handleSend() {
        if (!content.trim()) return;
        onSend(content.trim());
        setContent("");
        onStopTyping();
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setContent(e.target.value);
        onTyping();

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            onStopTyping();
        }, 2000);
    }

    return (
        <div className="p-4 border-t flex gap-2">
            <Input
                placeholder="Écrire un message..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1"
            />
            <Button size="icon" onClick={handleSend} disabled={!content.trim()}>
                <Send />
            </Button>
        </div>
    );
}