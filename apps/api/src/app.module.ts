import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // ── Config (loads .env) ──────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),

    // ── Database ─────────────────────────────────────────────────
    PrismaModule,

    // ── Feature modules ──────────────────────────────────────────
    AuthModule,
    UsersModule,

    // Future modules (add as implemented):
    // BrandsModule,
    // JobTemplatesModule,
    // JobsModule,
    // JobTasksModule,
    // ContentsModule,
    // PaymentsModule,
    // NotificationsModule,
    // TikTokModule,
  ],
})
export class AppModule {}
