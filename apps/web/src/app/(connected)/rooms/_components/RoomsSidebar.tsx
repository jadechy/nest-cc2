"use client";

import { apiGet, apiPatch, apiPost } from "@/lib/api.client";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Check, Settings } from "lucide-react";
import RoomsList from "./RoomsList";
import { useParams, useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Room, RoomMember } from "../[roomId]/types";

export default function RoomsSidebar() {
    const { data: session } = useSession();
    const [rooms, setRooms] = useState<Room[]>([]);

    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [newRoomName, setNewRoomName] = useState("");
    const [creating, setCreating] = useState(false);

    const [openProfile, setOpenProfile] = useState(false);
    const [username, setUsername] = useState(session?.user?.username ?? "");
    const [color, setColor] = useState("#000000");
    const [savingProfile, setSavingProfile] = useState(false);

    useEffect(() => {
        if (!session?.accessToken) return;
        apiGet<RoomMember[]>("/rooms/me", session.accessToken)
            .then((members) => setRooms(members.map((m) => m.room)));
        apiGet<{ color: string; username: string }>("/users/me", session.accessToken)
            .then((user) => {
                setColor(user.color);
                setUsername(user.username);
            });
    }, [session?.accessToken]);

    useEffect(() => {
        function handleRoomCreated(e: CustomEvent<Room>) {
            setRooms((prev) => {
                if (prev.find((r) => r.id === e.detail.id)) return prev;
                return [...prev, e.detail];
            });
        }

        window.addEventListener("roomCreated", handleRoomCreated as EventListener);
        return () => window.removeEventListener("roomCreated", handleRoomCreated as EventListener);
    }, []);

    async function handleCreate() {
        if (!newRoomName.trim() || !session?.accessToken) return;
        setCreating(true);
        try {
            const room = await apiPost<Room>("/rooms", { name: newRoomName.trim() }, session.accessToken);
            setRooms((prev) => [...prev, room]);
            window.dispatchEvent(new CustomEvent("roomCreated", { detail: room }));
            setNewRoomName("");
            setOpen(false);
            router.push(`/rooms/${room.id}`);
        } finally {
            setCreating(false);
        }
    }

    async function handleSaveProfile() {
        if (!session?.accessToken) return;
        setSavingProfile(true);
        try {
            await apiPatch("/users/me", { username, color }, session.accessToken);
            window.dispatchEvent(new CustomEvent("profileUpdated", {
                detail: { username, color, id: session.user.id }
            }));
            setOpenProfile(false);
        } finally {
            setSavingProfile(false);
        }
    }

    return (
        <>
            <aside className="w-64 bg-gray-900 text-white flex flex-col h-full">
                <div className="p-3 border-t border-gray-700">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpen(true)}
                        className="w-full justify-start text-gray-400"
                    >
                        <Plus />
                        Nouvelle conversation
                    </Button>
                </div>
                <RoomsList rooms={rooms}/>
                <div className="p-3 border-t border-gray-700">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpenProfile(true)}
                        className="w-full justify-start text-gray-400"
                    >
                        <Settings />
                        Voir le profil
                    </Button>
                </div>
                
            </aside>

            <Dialog open={open} onOpenChange={(v) => { setOpen(v); setNewRoomName(""); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Créer un nouveau salon de discussion</DialogTitle>
                    </DialogHeader>

                    <div className="py-2">
                        <Input
                            autoFocus
                            placeholder="Nom du salon de la discussion..."
                            value={newRoomName}
                            onChange={(e) => setNewRoomName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                        />
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => { setOpen(false); setNewRoomName(""); }}
                        >
                            Annuler
                        </Button>
                        <Button
                            disabled={creating || !newRoomName.trim()}
                            onClick={handleCreate}
                        >
                            {creating ? "Création..." : "Créer"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={openProfile} onOpenChange={setOpenProfile}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Mon profil</DialogTitle>
                    </DialogHeader>

                    <div className="py-2 flex flex-col gap-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                            <div
                                className="size-10 rounded-full shrink-0"
                                style={{ backgroundColor: color }}
                            />
                            <span className="font-medium">{username || "..."}</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">Nom d'utilisateur</label>
                            <Input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Ton username..."
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">Couleur</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="size-10 rounded cursor-pointer border border-input"
                                />
                                <span className="text-sm text-muted-foreground">{color}</span>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setOpenProfile(false)}>
                            Annuler
                        </Button>
                        <Button
                            disabled={savingProfile || !username.trim()}
                            onClick={handleSaveProfile}
                        >
                            {savingProfile ? "Sauvegarde..." : "Sauvegarder"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}