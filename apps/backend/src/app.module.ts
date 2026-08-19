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
