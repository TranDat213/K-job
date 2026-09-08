import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from './auth.repository';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

const BCRYPT_ROUNDS = 12;
const COOKIE_NAME = 'koc_token';

export type SafeUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  async register(dto: RegisterDto): Promise<{ message: string, token: string }> {
    const existing = await this.authRepository.findUserByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email này đã tồn tại');
    }
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.authRepository.createUser({
      email: dto.email,
      passwordHash,
      name: dto.name,
      phone: dto.phone,
    });

    const safeUser = this.stripSensitiveFields(user);
    const token = this.signToken(safeUser);

    this.logger.log(`New user registered: ${user.email}`);

    return { message: "Đăng ký tài khoản thành công", token };
  }

  async login(dto: LoginDto): Promise<{ message: string; token: string }> {
    const user = await this.authRepository.findUserByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }
    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const safeUser = this.stripSensitiveFields(user);
    const token = this.signToken(safeUser);

    this.logger.log(`User logged in: ${user.email}`);

    return { message: "Đăng nhập tài khoản thành công", token };
  }

  private signToken(user: SafeUser): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };
    return this.jwtService.sign(payload);
  }

  getCookieOptions(): Record<string, unknown> {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    };
  }

  getCookieName(): string {
    return COOKIE_NAME;
  }

  private stripSensitiveFields(user: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    phone: string | null;
    createdAt: Date;
    updatedAt: Date;
    passwordHash: string;
    deletedAt: Date | null;
  }): SafeUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
