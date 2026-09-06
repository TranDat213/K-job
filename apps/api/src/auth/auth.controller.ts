import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SafeUser } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { message, token } = await this.authService.register(dto);
    return {
      message,
      data: { accessToken: token },
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { message, token } = await this.authService.login(dto);
    res.cookie(
      this.authService.getCookieName(),
      token,
      this.authService.getCookieOptions(),
    );
    return {
      message,
      data: { accessToken: token },
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  logout(@Res({ passthrough: true }) res: Response) {
    // Clear the cookie
    res.clearCookie(this.authService.getCookieName(), {
      httpOnly: true,
      path: '/',
    });

    return {
      data: null,
      message: 'Đăng xuất thành công',
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: SafeUser) {
    return {
      message: 'Lấy thông tin người dùng thành công',
      data: { user },
    };
  }
}
