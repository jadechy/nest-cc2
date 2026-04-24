"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { apiDelete } from "@/lib/api.client";
import { MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Room, Member } from "../types";

export default function RoomMember({
    room,
    members,
    onMemberRemoved,
    onDirectMessage
}: {
    room: Room;
    members: Member[];
    onMemberRemoved: (memberId: string) => void;
    onDirectMessage: (targetUserId: string) => void;
}) {
    const { data: session } = useSession();

    const isCreator = session?.user?.id === room.createdById;

    const [selectedMember, setSelectedMember] = useState<Member | null>(null);

    async function handleRemoveUser(userId: string){
        if(!session?.accessToken) return;
        await apiDelete(`/rooms/${room.id}/users/${userId}`, session.accessToken);
    }

    return (
        <>
            <aside className="w-64 border-l flex flex-col h-full">
                <div className="p-4 border-b">
                    <span className="font-semibold text-sm">Membres</span>
                </div>
                <div className="flex-1 overflow-y-auto p-3">
                    { members.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center mt-4">
                            Aucun membre
                        </p>
                    ) : (
                        <ul className="flex flex-col gap-1">
                            {members.map((member) => {
                                const isMemberCreator = member.user.id === room.createdById;
                                return (
                                    <li
                                        key={member.id}
                                        className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted"
                                    >
                                        <div
                                            className="size-6 rounded-full shrink-0"
                                            style={{ backgroundColor: member.user.color }}
                                        />
                                        <span className="text-sm truncate flex-1">
                                            {member.user.username}
                                        </span>
                                        {!room.isDirect && member.user.id !== session?.user?.id &&(
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => onDirectMessage(member.user.id)}
                                            >
                                                <MessageSquare />
                                            </Button>
                                        )}
                                        {isMemberCreator && (
                                            <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full shrink-0">
                                                Créateur
                                            </span>
                                        )}
                                        {isCreator && !isMemberCreator && (
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => setSelectedMember(member)}
                                            >
                                                <X/>
                                            </Button>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </aside>

            <Dialog open={!!selectedMember}
                onOpenChange={(v) => { if (!v) setSelectedMember(null); }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Confirmer la suppression</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Voulez-vous retirer <span className="font-medium text-foreground">{selectedMember?.user.username}</span> de la room ?
                    </p>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setSelectedMember(null)}>
                            Annuler
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={async () => {
                                if (!selectedMember) return;
                                await handleRemoveUser(selectedMember.user.id);
                                onMemberRemoved(selectedMember.id);
                                setSelectedMember(null);
                            }}
                        >
                            Supprimer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}