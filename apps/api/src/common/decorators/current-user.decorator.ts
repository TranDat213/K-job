import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client';

/**
 * Custom decorator to extract the authenticated user from the request.
 *
 * Usage in controller:
 *   @Get('me')
 *   getMe(@CurrentUser() user: User) { ... }
 *
 * The user object is populated by JwtStrategy after token validation.
 * It contains: id, email, name (never passwordHash).
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Partial<User> => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
