import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { json, urlencoded } from 'express';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from './config/env.schema';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefixs /v1
  app.setGlobalPrefix('/v1');

  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.use(cookieParser());

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // CORS config
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ): void => {
      if (!origin) return callback(null, true); // Mobile apps
      if (origin.match(/https?:\/\/([\w-]+\.)?iscode\.eu(:\d+)?$/))
        return callback(null, true);
      if (
        origin.startsWith('http://localhost') ||
        origin.startsWith('http://127.0.0.1') ||
        origin.startsWith('http://173.249.31.149')
      ) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-otp-token', 'token'],
  });

  const configService = app.get<ConfigService<EnvConfig, true>>(ConfigService);
  const port = configService.get<number>('PORT');

  await app.listen(port);

  Logger.log(`🚀 Server running on port ${port}`, 'Bootstrap');
}

bootstrap().catch((err) => {
  Logger.error('💥 Server failed to start', err, 'Bootstrap');
});
