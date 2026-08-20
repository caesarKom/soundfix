import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { envSchema } from './config/env.schema';
import { MailModule } from './mail/mail.module';
import { MusicModule } from './music/music.module';
import { PlaylistModule } from './playlist/playlist.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { existsSync } from 'fs';

// 1. Determine base path by traversing from runtime working directory
const getUploadsPath = (): string => {
  const rootWorkspacePath = join(process.cwd(), 'uploads');
  const backendLocalPath = join(process.cwd(), '..', '..', 'uploads');

  // Verify which folder physically exists on the disk
  if (existsSync(rootWorkspacePath)) {
    return rootWorkspacePath;
  }
  return backendLocalPath;
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => {
        const res = envSchema.safeParse(config);
        if (!res.success) {
          console.error(
            '❌ Invalid environment variables:',
            res.error.flatten()
          );
          throw new Error('Invalid environment variables');
        }
        return res.data as Record<string, unknown>;
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: getUploadsPath(),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    UserModule,
    AuthModule,
    MailModule,
    MusicModule,
    PlaylistModule,
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
