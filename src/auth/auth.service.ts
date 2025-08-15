import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dtos/register.dto';
import bcrypt from 'node_modules/bcryptjs';
import { LoginDto } from './dtos/login.dto';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<any> {
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    console.log('Password hashed, creating user in DB...');

    const user = await this.prisma.user.create({
      data: { ...registerDto, password: hashedPassword },
    });

    console.log('User created:', user);
    return { id: user.id, username: user.email, email: user.email };
  }

  async login(loginDto: LoginDto, res: Response): Promise<{}> {
    const { email, password } = loginDto;
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) throw new UnauthorizedException('Invalid Email!');

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches)
      throw new UnauthorizedException("Password doesn't match!");

    // Generation of token starts here...
    const payload = { sub: user.id, email: user.email };

    // access token!
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
    });

    // const refresh token!
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    // sending into cookies!

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken };
  }

  async refreshAccessToken(user: any, res: Response) {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
    });
    return { accessToken };
  }
}
