import { Body, Controller, HttpCode, HttpStatus, Post, Patch, Param, Delete, Get, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../auth/auth.guard';
import { GetMe } from '../auth/decorators/get-me.decorator';
import { type User } from '../generated/prisma/client';

@Controller('users')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class UsersController {
    constructor(private usersService: UsersService) {}

    @HttpCode(HttpStatus.OK)
    @Post('create')
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto)
    }

    @Get('search')
    search(@Query('q') q: string) {
        return this.usersService.search(q);
    }

    @Get('profil/:id')
    profil(@Param('id') id: string) {
        return this.usersService.findOne(id)
    }

    @Get('me')
    getMe(@GetMe() user: User) {
        return this.usersService.findOne(user.id);
    }

    @Patch('me')
    updateMe(@GetMe() user: User, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(user.id, updateUserDto);
    }

    @Delete('delete/:id')
    remove(@Param('id') id: string) {
        return this.usersService.remove(id)
    }
}
