import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { User } from 'src/generated/prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(pass: string, email?: string, username?: string): Promise<any> {
    let user: User | null = null;

    if (email) {
        user = await this.usersService.findOneByEmail(email);
    } else if (username) {
        user = await this.usersService.findOneByUsername(username);
    }
    
    if (!user || !(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.id, email: user.email, username: user.username };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async register(email: string, password: string, username: string): Promise<any> {
    const user = await this.usersService.create({
      email,
      password: await bcrypt.hash(password, 10),
      username,
      color: "#000000"
    });

    const payload = { sub: user.id, email: user.email, username: user.username };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}