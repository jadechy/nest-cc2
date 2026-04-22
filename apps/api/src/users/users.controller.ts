import { Body, Controller, HttpCode, HttpStatus, Post, Patch, Param, Delete, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../auth/auth.guard';

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

    @Get('profil/:id')
    profil(@Param('id') id: string) {
        return this.usersService.findOne(id)
    }

    @Patch('update/:id')
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(id, updateUserDto)
    }

    @Delete('delete/:id')
    remove(@Param('id') id: string) {
        return this.usersService.remove(id)
    }
}
