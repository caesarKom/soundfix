import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from './config/env.schema';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.use(cookieParser());

  const configService = app.get<ConfigService<EnvConfig, true>>(ConfigService);
  const port = configService.get<number>('PORT');

  await app.listen(port);

  Logger.log(`🚀 Server running on port ${port}`, 'Bootstrap');
}

bootstrap().catch((err) => {
  Logger.error('💥 Server failed to start', err, 'Bootstrap');
});
