"use client";

export default function TypingIndicator({
    typingUsers,
}: {
    typingUsers: Record<string, string>;
}) {
    const users = Object.values(typingUsers);
    if (users.length === 0) return null;

    const text = users.length === 1
        ? `${users[0]} est en train d'écrire...`
        : "Plusieurs personnes sont en train d'écrire...";

    return (
        <div className="px-4 pb-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex gap-0.5">
                <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
            </span>
            {text}
        </div>
    );
}