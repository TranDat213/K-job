import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
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
  ) {}

  // ─────────────────────────────────────────────────────────────────
  // REGISTER
  // ─────────────────────────────────────────────────────────────────

  async register(dto: RegisterDto): Promise<{ user: SafeUser; token: string }> {
    // Check if email already taken (among active users)
    const existing = await this.authRepository.findUserByEmail(dto.email);
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    // Create user
    const user = await this.authRepository.createUser({
      email: dto.email,
      passwordHash,
      name: dto.name,
      phone: dto.phone,
    });

    const safeUser = this.stripSensitiveFields(user);
    const token = this.signToken(safeUser);

    this.logger.log(`New user registered: ${user.email}`);

    return { user: safeUser, token };
  }

  // ─────────────────────────────────────────────────────────────────
  // LOGIN
  // ─────────────────────────────────────────────────────────────────

  async login(dto: LoginDto): Promise<{ user: SafeUser; token: string }> {
    // Find active user
    const user = await this.authRepository.findUserByEmail(dto.email);
    if (!user) {
      // Use generic message to prevent email enumeration
      throw new UnauthorizedException('Invalid email or password');
    }

    // Compare password
    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const safeUser = this.stripSensitiveFields(user);
    const token = this.signToken(safeUser);

    this.logger.log(`User logged in: ${user.email}`);

    return { user: safeUser, token };
  }

  // ─────────────────────────────────────────────────────────────────
  // JWT HELPERS
  // ─────────────────────────────────────────────────────────────────

  private signToken(user: SafeUser): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };
    return this.jwtService.sign(payload);
  }

  /**
   * Build cookie options — httpOnly prevents JS access (XSS protection).
   */
  getCookieOptions(): Record<string, unknown> {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    return {
      httpOnly: true,
      secure: isProduction,           // HTTPS only in production
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
      path: '/',
    };
  }

  getCookieName(): string {
    return COOKIE_NAME;
  }

  // ─────────────────────────────────────────────────────────────────
  // PRIVATE
  // ─────────────────────────────────────────────────────────────────

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
    // Explicitly omit passwordHash and deletedAt — never sent to client
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
