import { Body, Controller, HttpCode, HttpStatus, Post, Get, Query } from '@nestjs/common';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { SignInDto } from './dto/sign-in.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn({ ...signInDto });
  }

  @Post('verify')
  verify(@Body() verifyInDto: VerifyOtpDto) {
    return this.authService.verifyOtp({ ...verifyInDto });
  }

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register({ ...registerDto });
  }

  @Get('verify-email')
  verifyEmail(@Query() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail({ token: verifyEmailDto.token });
  }
}