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
  const allowedOrigins = [
    process.env.CORS_ORIGIN,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
  ].filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:')
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in local development
    },
    credentials: true, // required for httpOnly cookies
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
      'Range',
      'Origin',
    ],
    exposedHeaders: ['Content-Disposition', 'Content-Length', 'Content-Range'],
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
