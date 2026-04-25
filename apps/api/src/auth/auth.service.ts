import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';

import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { JwtPayload } from './types/jwt';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RegisterDto } from './dto/register.dto';
import { SignInDto } from './dto/sign-in.dto';
import { RoomsService } from '../rooms/rooms.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private roomsService: RoomsService,
    private jwtService: JwtService,
    private mailerService: MailService,
  ) {}

  private generateOtp(): string {
    return randomInt(100000, 999999).toString();
  }

  async signIn({password, email}: SignInDto): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    
    if(!user) throw new UnauthorizedException();
    if (!user.isVerifiedEmail) throw new UnauthorizedException();
    
    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException();
    }

    const otpCode = this.generateOtp();
    const min = 5;
    const expiry = new Date(Date.now() + min * 60 * 1000);

    await this.usersService.saveOtp(user.email, otpCode, expiry);
    await this.mailerService.sendOtp(user.email, otpCode, min);
    return { message: 'Code envoyé par mail' };
  }

  async verifyOtp({ otp, email }: VerifyOtpDto): Promise<any> {
    const user = await this.usersService.findOtp(otp);
    if (!user || !user.otpExpiredAt) throw new UnauthorizedException();
    const now = new Date();
    if (now > user.otpExpiredAt || user.email !== email)
      throw new UnauthorizedException();
    const payload = {
      id: user.id,
      email: user.email,
      username: user.username
    };
    await this.usersService.deleteOtp(user.id);
    return {
      access_token: await this.jwtService.signAsync(payload, {}),
      refresh_token: await this.jwtService.signAsync(payload, {}),
      user: {
        id: payload.id,
        email: payload.email,
        username: payload.username,
      },
    };
  }

  async register({email, password, confirmPassword, username}: RegisterDto): Promise<any> {
    if (password !== confirmPassword) throw new UnauthorizedException();

    const user = await this.usersService.findOneByEmail(email);
    if (user) throw new UnauthorizedException();

    const newUser = await this.usersService.create({
        email,
        password: await bcrypt.hash(password, 10),
        username,
        color: "#000000"
    });

    await this.roomsService.createGeneralRoom(newUser.id);

    const payload = { email };
    const token = await this.jwtService.signAsync(payload);
    await this.mailerService.sendVerificationEmail(email, token);
    return { message: 'Email de vérification envoyé' };
  }

  async verifyEmail({ token }: VerifyEmailDto) {
    const { email } = await this.jwtService.verifyAsync<JwtPayload>(token);
    if (!email) throw new UnauthorizedException();

    const user = await this.usersService.findOneByEmail(email);
    if (!user) throw new UnauthorizedException();

    await this.usersService.verifyEmail({ email });
    return { message: 'Inscription validée' };
  }
}