import { Body, Controller, HttpCode, HttpStatus, Post, Patch, Param, Delete, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RoomsService } from "./rooms.service";
import { UpdateRoomDto } from './dto/update-room.dto';
import { AuthGuard } from '../auth/auth.guard';
import { type User } from '../generated/prisma/client';
import { GetMe } from '../auth/decorators/get-me.decorator';
import { CreateRoomDto } from './dto/create-room.dto';

@Controller('rooms')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class RoomsController {
    constructor(private roomsService: RoomsService) {}

    @HttpCode(HttpStatus.OK)
    @Get()
    findAll(){
        return this.roomsService.findAll()
    }

    @Post()
    create(@Body() createRoomDto: CreateRoomDto, @GetMe() user: User) {
        return this.roomsService.create(createRoomDto, user.id);
    }

    @Get('me')
    getUsersRoom(@GetMe() user: User) {
        return this.roomsService.getUsersRoom(user.id);
    }

    @Get(':id')
    findOne(@Param('id') id: string){
        return this.roomsService.findOne(id)
    }

    @Patch('update/:id')
    update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
        return this.roomsService.update(id, updateRoomDto)
    }

    @Post('direct/:targetUserId')
    getOrCreateDirectRoom(
        @Param('targetUserId') targetUserId: string,
        @GetMe() user: User,
    ) {
        return this.roomsService.getOrCreateDirectRoom(user.id, targetUserId);
    }

    @Post(':roomId/join')
    addUserToRoom(
        @Param('roomId') roomId: string,
        @Body('userId') userId: string,
        @Body('hasHistoryAccess') hasHistoryAccess: boolean = false,
    ) {
        return this.roomsService.addUserToRoom(userId, roomId, hasHistoryAccess);
    }

    @Get(':roomId/members')
    getRoomMembers(@Param('roomId') roomId: string) {
        return this.roomsService.getRoomMembers(roomId);
    }

    @Patch(':roomId/members/:userId/history')
    updateHistoryAccess(
        @Param('roomId') roomId: string,
        @Param('userId') userId: string,
        @Body('hasHistoryAccess') hasHistoryAccess: boolean,
    ) {
        return this.roomsService.updateHistoryAccess(roomId, userId, hasHistoryAccess);
    }

    @Delete(':roomId/users/:userId')
    removeUserFromRoom(
        @Param('roomId') roomId: string,
        @Param('userId') userId: string,
    ) {
        return this.roomsService.removeUserFromRoom(userId, roomId);
    }
}