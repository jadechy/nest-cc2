import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { User } from '../generated/prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        color: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  findOneByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  findOneByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id: id },
      data: updateUserDto,
    });
  }

  remove(id: string) {
    return this.prisma.user.delete({
      where: {id: id}
    });
  }

  saveOtp(
    email: User['email'],
    otpCode: User['otpCode'],
    expiredAt: User['otpExpiredAt'],
  ) {
    return this.prisma.user.update({
      where: { email },
      data: { otpCode, otpExpiredAt: expiredAt },
    });
  }
  deleteOtp(id: User['id']) {
    return this.prisma.user.update({
      where: { id },
      data: { otpCode: null, otpExpiredAt: null },
    });
  }
  findOtp(otpCode: User['otpCode']) {
    return this.prisma.user.findFirst({
      where: { otpCode },
    });
  }

  verifyEmail({ email }: Pick<User, 'email'>) {
    return this.prisma.user.update({
      where: { email },
      data: { isVerifiedEmail: true },
    });
  }
}