import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '../../config/env.schema';
import { PrismaService } from '../../prisma/prisma.service';
import type { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService<EnvConfig, true>,
    private readonly prisma: PrismaService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: Request) => (req?.query?.token as string) ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_ACCESS_TOKEN', { infer: true }),
      passReqToCallback: true, // <- to access req in validate()
    });
  }

  // Whatever you return from this method will go to req.user in the controller
  async validate(req: Request, payload: { sub: string; scope?: string }) {
    const isStreamEndpoint = req.path.startsWith('/v1/music/stream/');

    if (payload.scope === 'stream') {
      // media token can ONLY be used on stream
      if (!isStreamEndpoint) {
        throw new UnauthorizedException('Token not valid for this endpoint');
      }
    } else if (isStreamEndpoint && req.query.token) {
      // regular access token cannot stream via query param
      throw new UnauthorizedException('Use a media token for streaming');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return { id: user.id, role: user.role }; // req.user = { id: '...' }
  }
}
