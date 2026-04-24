import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { MessagesService } from './messages.service';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true
  },
  namespace: '/message',
})

// @WebSocketGateway({
//   cors: { origin: process.env.FRONTEND_URL, credentials: true },
//   namespace: '/message',
// })

export class MessagesGateway{
    @WebSocketServer()
    server!: Server;

    constructor(private readonly messagesService: MessagesService) {}

    async handleConnection(client: Socket) {
        const user = await this.messagesService.getUserFromSocket(client);
        
        if (!user) {
            client.disconnect();
            return;
        }

        client.data.user = user;
        
        client.emit('ready');
    }

    @SubscribeMessage('joinRoom')
    async handleJoinRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() roomId: string,
    ) {
        const user = client.data.user;

        if (!user) {
            return;
        }

        const userId = user.id;

        const isMember = this.messagesService.isRoomMember(userId, roomId);
        if (!isMember) return;

        client.join(roomId);

        const messages = await this.messagesService.getMessages(userId, roomId);
        client.emit('messageHistory', messages);
    }

    @SubscribeMessage('leaveRoom')
    handleLeaveRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() roomId: string,
    ) {
        client.leave(roomId);
    }

    @SubscribeMessage('sendMessage')
    async handleMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() dto: { roomId: string; content: string },
    ) {
        if (!client.data.user) {
            return;
        }

        const userId = client.data.user.id;
        const message = await this.messagesService.createMessage(
            userId,
            dto.roomId,
            dto.content,
        );

        this.server.to(dto.roomId).emit('newMessage', message);
    }

    @SubscribeMessage('addReaction')
    async handleReaction(
        @ConnectedSocket() client: Socket,
        @MessageBody() dto: { messageId: string; emoji: string; roomId: string },
    ) {
        if (!client.data.user) {
            return;
        }

        const userId = client.data.user.id;
        const reaction = await this.messagesService.toggleReaction(
            userId,
            dto.messageId,
            dto.emoji,
        );

        this.server.to(dto.roomId).emit('reactionUpdated', {
            messageId: dto.messageId,
            reactions: reaction,
        });
    }

    @SubscribeMessage('typing')
    handleTyping(
        @ConnectedSocket() client: Socket,
        @MessageBody() roomId: string,
    ) {
        if (!client.data.user) {
            return;
        }
        const user = client.data.user;
        if (!user) return;

        client.to(roomId).emit('userTyping', {
            userId: user.id,
            username: user.username,
        });
    }

    @SubscribeMessage('stopTyping')
    handleStopTyping(
        @ConnectedSocket() client: Socket,
        @MessageBody() roomId: string,
    ) {
        if (!client.data.user) {
            return;
        }
        const user = client.data.user;
        if (!user) return;

        client.to(roomId).emit('userStopTyping', {
            userId: user.id,
        });
    }
}