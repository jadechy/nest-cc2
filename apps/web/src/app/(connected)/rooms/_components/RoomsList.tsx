"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Room, } from "../[roomId]/types";

export default function RoomsList({
    rooms,
}: {
    rooms: Room[];
}) {
  const params = useParams();
  const roomId = params?.roomId as string | undefined;

  return (
    <nav className="flex-1 overflow-y-auto p-2">
      {rooms.map((room) => (
        <Link
            key={room.id}
            href={`/rooms/${room.id}`}
            className={`flex items-center gap-2 px-3 py-2 rounded-md mb-1 hover:bg-gray-700 transition
                ${roomId === room.id ? "bg-gray-700 font-semibold" : ""}`}
        >
            <span className="text-gray-400">
                {room.isDirect ? "@" : "#"}
            </span>
            {room.name}
            {room.isGeneral && (
                <span className="ml-auto text-xs text-gray-500">Général</span>
            )}
        </Link>
    ))}
    </nav>
  );
}