"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiGet, apiPost } from "@/lib/api.client";
import { MessageSquarePlus, Search } from "lucide-react";
import { Room, User } from "../types";

export default function GeneralRoom({ room }: { room: Room }) {
    const { data: session } = useSession();
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const [roomName, setRoomName] = useState("");
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [creating, setCreating] = useState(false);

    async function handleSearch(q: string) {
        setQuery(q);
        if (!q.trim() || !session?.accessToken) { setResults([]); return; }
        const users = await apiGet<User[]>(`/users/search?q=${q}`, session.accessToken);
        setResults(users);
    }

    function toggleUser(user: User) {
        setSelectedUsers((prev) =>
            prev.find((u) => u.id === user.id)
                ? prev.filter((u) => u.id !== user.id)
                : [...prev, user]
        );
    }

    async function handleCreate() {
        if (!roomName.trim() || !session?.accessToken) return;
        setCreating(true);
        try {
            const newRoom = await apiPost<Room>("/rooms", { name: roomName.trim() }, session.accessToken);

            await Promise.all(
                selectedUsers.map((user) =>
                    apiPost(`/rooms/${newRoom.id}/join`, { userId: user.id }, session.accessToken!)
                )
            );

            setOpen(false);
            router.push(`/rooms/${newRoom.id}`);
            router.refresh();
        } finally {
            setCreating(false);
        }
    }

    return (
        <>
            <div className="flex flex-col items-center justify-center h-full gap-6 p-8 text-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="size-16 rounded-full bg-muted flex items-center justify-center">
                        <MessageSquarePlus className="size-8 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-semibold">Bienvenue sur {room.name}</h2>
                    <p className="text-muted-foreground text-sm max-w-sm">
                        Ceci est votre espace général. Créez une nouvelle discussion pour commencer à échanger avec d'autres membres.
                    </p>
                </div>

                <Button onClick={() => setOpen(true)}>
                    <MessageSquarePlus />
                    Nouvelle discussion
                </Button>
            </div>

            <Dialog open={open} onOpenChange={(v) => { setOpen(v); setQuery(""); setResults([]); setSelectedUsers([]); setRoomName(""); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Nouvelle discussion</DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col gap-4 py-2">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">Nom de la discussion</label>
                            <Input
                                autoFocus
                                placeholder="Nom..."
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">Ajouter des membres</label>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher un utilisateur..."
                                    value={query}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>

                        {results.length > 0 && (
                            <ul className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                                {results.map((user) => {
                                    const isSelected = selectedUsers.some((u) => u.id === user.id);
                                    return (
                                        <li
                                            key={user.id}
                                            className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-muted ${isSelected ? "bg-muted" : ""}`}
                                            onClick={() => toggleUser(user)}
                                        >
                                            <div className="size-6 rounded-full shrink-0" style={{ backgroundColor: user.color }} />
                                            <span className="text-sm flex-1">{user.username}</span>
                                            {isSelected && <span className="text-xs text-primary">✓</span>}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}

                        {selectedUsers.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {selectedUsers.map((user) => (
                                    <span
                                        key={user.id}
                                        className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full cursor-pointer"
                                        onClick={() => toggleUser(user)}
                                    >
                                        {user.username} ✕
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            Annuler
                        </Button>
                        <Button
                            disabled={creating || !roomName.trim()}
                            onClick={handleCreate}
                        >
                            {creating ? "Création..." : "Créer"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}