import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    return user;
  }

	async login(dto: LoginDto) {
		const user = await this.prisma.user.findUnique({ where: {email: dto.email}});
		if(!user) throw new UnauthorizedException('Invalid credentials');

		const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
		if(!isMatch) throw new UnauthorizedException('Invalid credentials');
		
		const access_token = await this.jwtService.signAsync({
			sub: user.id,
			email: user.email,
		});

		return {
			access_token,
		};
	}
}
