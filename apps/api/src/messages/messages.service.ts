import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
    constructor(private readonly prisma: PrismaService, private jwtService: JwtService) {}

    async getUserFromSocket(client: Socket) {
        const token =
            client.handshake.auth?.token ||
            client.handshake.headers?.authorization?.split(' ')[1];
        if (!token) return null;
        try {
            const payload = this.jwtService.verify(token);
            return this.prisma.user.findUnique({ where: { id: payload.id } });
        } catch {
            return null;
        }
    }

    isRoomMember(userId: string, roomId: string) {
        const member = this.prisma.roomMember.findUnique({
            where: {userId_roomId: {userId, roomId}}
        });
        return !!member;
    }

    async getMessages(userId: string, roomId: string) {
        const member = await this.prisma.roomMember.findUnique({
            where: { userId_roomId: { userId, roomId}}
        });

        return this.prisma.message.findMany({
            where: {
                roomId,
                ...(member?.hasHistoryAccess === false
                ? { createdAt: { gte: member.joinedAt } }
                : {}),
            },
            include: {
                author: { select: { id: true, username: true, color: true } },
                reactions: {
                    include: { user: { select: { id: true, username: true } } },
                },
            },
            orderBy: { createdAt: 'asc' },
            take: 50,
        });
    }

    async createMessage(authorId: string, roomId: string, content: string) {
        return this.prisma.message.create({
            data: { content, authorId, roomId },
            include: {
                author: { select: { id: true, username: true, color: true } },
                reactions: true,
            },
        });
    }

    async toggleReaction(userId: string, messageId: string, emoji: string) {
        const existing = await this.prisma.reaction.findUnique({
            where: { messageId_userId_emoji: { messageId, userId, emoji } },
        });

        if (existing) {
            await this.prisma.reaction.delete({ where: { id: existing.id } });
        } else {
            await this.prisma.reaction.create({ data: { userId, messageId, emoji } });
        }

        return this.prisma.reaction.findMany({
            where: { messageId },
            include: { user: { select: { id: true, username: true } } },
        });
    }
}