import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BrandsModule } from './brands/brands.module';
import { JobsModule } from './jobs/jobs.module';
import { JobTasksModule } from './job-tasks/job-tasks.module';
import { JobTemplatesModule } from './job-templates/job-templates.module';
import { PaymentsModule } from './payments/payments.module';

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
    BrandsModule,
    JobsModule,
    JobTasksModule,
    JobTemplatesModule,
    PaymentsModule,

    // Future modules (add as implemented):
    // ContentsModule,
    // NotificationsModule,
    // TikTokModule,
  ],
})
export class AppModule {}
