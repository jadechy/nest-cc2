"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, UserPlus, Users } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiGet, apiPatch, apiPost } from "@/lib/api.client";
import { Room, Member, User } from "../types";

export default function RoomHeader({
    room,
    onMemberAdded,
}: {
    room: Room;
    onMemberAdded: (member: Member) => void;
}) {
    const { data: session } = useSession();
    const [open, setOpen] = useState(false);

    const [query, setQuery] = useState("");
    const [results, setResults] = useState<User[]>([]);

    const [adding, setAdding] = useState<string | null>(null);
    const [added, setAdded] = useState<Set<string>>(new Set());

    const [openSettings, setOpenSettings] = useState(false);
    const [roomName, setRoomName] = useState(room.name);
    const [saving, setSaving] = useState(false);

    const [members, setMembers] = useState<Member[]>([]);
    const [historyChanged, setHistoryChanged] = useState(false);

    const isCreator = session?.user?.id === room.createdById;

    async function handleSearch(q: string) {
        setQuery(q);
        if (!q.trim() || !session?.accessToken) {
            setResults([]);
            return;
        }
        const users = await apiGet<User[]>(`/users/search?q=${q}`, session.accessToken);
        setResults(users);
    }

    async function handleAddUser(user: User){
        if(!session?.accessToken) return;
        setAdding(user.id);
        try {
            const newMember = await apiPost<Member>(`/rooms/${room.id}/join`, { userId: user.id }, session.accessToken) as Member;
            onMemberAdded(newMember);
            setAdded((prev) => new Set(prev).add(user.id));
        } finally {
            setAdding(null);
        }
    }

    async function handleOpenSettings() {
        setOpenSettings(true);
        if (!session?.accessToken) return;
        const data = await apiGet<Member[]>(`/rooms/${room.id}/members`, session.accessToken);
        setMembers(data);
    }

    async function handleSaveSettings() {
        if (!roomName.trim() || !session?.accessToken) return;
        setSaving(true);
        try {
            await apiPatch(`/rooms/update/${room.id}`, { name: roomName.trim() }, session.accessToken);
            setHistoryChanged(false);
            setOpenSettings(false);
        } finally {
            setSaving(false);
        }
    }

    async function handleToggleHistory(member: Member) {
        if (!session?.accessToken) return;
        const newValue = !member.hasHistoryAccess;
        
        setMembers((prev) =>
            prev.map((m) => m.id === member.id ? { ...m, hasHistoryAccess: newValue } : m)
        );
        setHistoryChanged(true);

        await apiPatch(
            `/rooms/${room.id}/members/${member.user.id}/history`,
            { hasHistoryAccess: newValue },
            session.accessToken
        );
    }

    return (
        <>
            <header className="flex items-center justify-between p-4 border-b">
                <span className="font-semibold text-lg"># {room.name}</span>
                <div>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setOpen(true)}
                    >
                        <UserPlus />
                    </Button>
                    {isCreator && (
                       <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={handleOpenSettings}
                        >
                            <Settings />
                        </Button>                 
                    )}
                </div>
            </header>

            <Dialog open={open} onOpenChange={(v) => { setOpen(v); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Ajouter des membres</DialogTitle>
                    </DialogHeader>

                    <div className="py-2">
                        <Input
                            autoFocus
                            placeholder="Rechercher un utilisateur..."
                            value={query}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>

                    {results.length === 0 && query.trim() && (
                        <li className="text-sm text-muted-foreground text-center py-4">
                            Aucun utilisateur trouvé
                        </li>
                    )}
                    {results.map((user) => (
                        <li key={user.id} className="flex items-center justify-between px-2 py-2 rounded hover:bg-muted">
                            <div className="flex items-center gap-2">
                                <div
                                    className="size-6 rounded-full"
                                    style={{ backgroundColor: user.color }}
                                />
                                <span className="text-sm">{user.username}</span>
                            </div>
                            <Button
                                size="xs"
                                variant={added.has(user.id) ? "secondary" : "default"}
                                disabled={adding === user.id || added.has(user.id)}
                                onClick={() => handleAddUser(user)}
                            >
                                {added.has(user.id) ? "Ajouté ✓" : adding === user.id ? "..." : "Ajouter"}
                            </Button>
                        </li>
                    ))}
                </DialogContent>
            </Dialog>

            <Dialog open={openSettings} onOpenChange={setOpenSettings}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Paramètres du salon</DialogTitle>
                    </DialogHeader>

                    <div className="py-2 flex flex-col gap-2">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">Nom du salon</label>
                            <Input
                                autoFocus
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSaveSettings()}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">Accès à l'historique</label>
                            <ul className="flex flex-col gap-2">
                                {members.map((member) => {
                                    const isMemberCreator = member.user.id === room.createdById;
                                    return (
                                        <li key={member.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="size-6 rounded-full shrink-0"
                                                    style={{ backgroundColor: member.user.color }}
                                                />
                                                <span className="text-sm">{member.user.username}</span>
                                                {isMemberCreator && (
                                                    <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                                                        Créateur
                                                    </span>
                                                )}
                                            </div>

                                            {isCreator && !isMemberCreator && (
                                                <button
                                                    onClick={() => handleToggleHistory(member)}
                                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                                        member.hasHistoryAccess ? "bg-primary" : "bg-muted"
                                                    }`}
                                                >
                                                    <span className={`inline-block size-3.5 rounded-full bg-white transition-transform ${
                                                        member.hasHistoryAccess ? "translate-x-4" : "translate-x-1"
                                                    }`} />
                                                </button>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setOpenSettings(false)}>
                            Annuler
                        </Button>
                        <Button
                            disabled={saving || !roomName.trim() || (roomName === room.name && !historyChanged)}
                            onClick={handleSaveSettings}
                        >
                            {saving ? "Sauvegarde..." : "Sauvegarder"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}