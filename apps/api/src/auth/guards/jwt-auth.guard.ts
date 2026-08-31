import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JwtAuthGuard protects routes that require authentication.
 *
 * Usage:
 *   @UseGuards(JwtAuthGuard)
 *   @Get('me')
 *   getProfile(@CurrentUser() user: SafeUser) { ... }
 *
 * On failure returns 401 Unauthorized automatically.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
