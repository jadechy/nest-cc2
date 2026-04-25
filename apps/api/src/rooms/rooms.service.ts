import { Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoomsService {
    constructor(private readonly prisma: PrismaService) {}

    async create(createRoomDto: CreateRoomDto, createdById: string){
        const room = await this.prisma.room.create({
            data: {
            name: createRoomDto.name,
            createdById: createdById,
            },
        });

        await this.prisma.roomMember.create({
            data: {
            roomId: room.id,
            userId: createdById,
            hasHistoryAccess: true,
            },
        });

        return room;
    }

    createGeneralRoom(createdById: string) {
        return this.prisma.room.create({
            data: {
                name: 'Général',
                createdById: createdById,
                isGeneral: true,
                members: {
                    create: {
                        userId: createdById,
                        hasHistoryAccess: true,
                    },
                },
            },
        });
    }

    findAll() {
        return this.prisma.room.findMany({
            select: {
                id: true,
                name: true,
                isGeneral: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    findOne(id: string) {
        return this.prisma.room.findUnique({
            where: { id },
        });
    }

    update(id: string, updateRoomDto: UpdateRoomDto) {
        return this.prisma.room.update({
            where: {id: id},
            data: updateRoomDto,
        })
    }

    addUserToRoom(userId: string, roomId: string, hasHistoryAccess = true) {
        return this.prisma.roomMember.create({
            data: {
                userId,
                roomId,
                hasHistoryAccess,
            },
            include: {
                user: {
                    select: {
                    id: true,
                    username: true,
                    color: true,
                    },
                },
            },
        });
    }

    removeUserFromRoom(userId: string, roomId: string) {
        return this.prisma.roomMember.delete({
            where: {
                userId_roomId: {
                    userId,
                    roomId,
                },
            },
        });
    }

    getRoomMembers(roomId: string) {
        return this.prisma.roomMember.findMany({
            where: { roomId },
            include: {
                user: {
                    select: {
                    id: true,
                    username: true,
                    color: true,
                    },
                },
            },
        });
    }

    getUsersRoom(userId: string) {
        return this.prisma.roomMember.findMany({
            where: { userId },
            include: {
                room: true,
            },
        });
    }

    updateHistoryAccess(roomId: string, userId: string, hasHistoryAccess: boolean) {
        return this.prisma.roomMember.update({
            where: { userId_roomId: { userId, roomId } },
            data: { hasHistoryAccess },
        });
    }

    async getOrCreateDirectRoom(userId: string, targetUserId: string) {
        const existing = await this.prisma.room.findFirst({
            where: {
                isDirect: true,
                members: { some: { userId } },
                AND: { members: { some: { userId: targetUserId } } },
            },
        });

        if (existing) return existing;

        const [user, target] = await Promise.all([
            this.prisma.user.findUnique({ where: { id: userId } }),
            this.prisma.user.findUnique({ where: { id: targetUserId } }),
        ]);

        const room = await this.prisma.room.create({
            data: {
                name: `${target!.username}`,
                isDirect: true,
                createdById: userId,
                members: {
                    create: [
                        { userId, hasHistoryAccess: true },
                        { userId: targetUserId, hasHistoryAccess: true },
                    ],
                },
            },
        });

        return room;
    }
}