import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../generated/prisma/client';

export const CurrentUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user:User = request.user;

    // If a specific key is passed (e.g. 'role'), return this property
    if (data && user) {
      return user[data];
    }

    // Otherwise, return the entire user object.
    return user;
  },
);