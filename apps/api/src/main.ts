import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── Global prefix ────────────────────────────────────────────
  app.setGlobalPrefix('api');

  // ── Cookie parser (for JWT in httpOnly cookies) ───────────────
  app.use(cookieParser());

  // ── CORS ──────────────────────────────────────────────────────
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    credentials: true, // required for cookies
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ── Global validation pipe ────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // strip unknown fields
      forbidNonWhitelisted: true, // reject unknown fields
      transform: true,           // auto-transform payloads to DTO types
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ── Global exception filter ───────────────────────────────────
  app.useGlobalFilters(new HttpExceptionFilter());

  // ── Global response interceptor ───────────────────────────────
  app.useGlobalInterceptors(new ResponseInterceptor());

  const port = process.env.API_PORT ?? 3002;
  await app.listen(port);
  console.log(`🚀 KOC API running on http://localhost:${port}/api`);
}

bootstrap();
