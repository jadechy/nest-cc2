export type User = { 
    id: string; 
    username: string; 
    color: string 
}

export type Reaction = {
    id: string;
    emoji: string;
    user: { id: string; username: string };
};

export type Message = {
    id: string;
    content: string;
    createdAt: string;
    author: User;
    reactions: Reaction[];
};

export type Room = {
    id: string;
    name: string;
    isGeneral: boolean;
    createdById: string;
    isDirect: boolean
};

export type RoomMember = { room: Room };

export type Member = {
    id: string;
    user: User;
    hasHistoryAccess: boolean;
};