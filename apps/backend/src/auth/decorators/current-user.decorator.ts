import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface UserPayload {
  id: string;
  role: string;
  email: string;
  name: string;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    // We guarantee to TypeScript that we return a string using an assertion or default value
    return (request.user?.id as string) || '';
  },
);

export const ObjectUser = createParamDecorator(
  (data: keyof UserPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as UserPayload | undefined;

    // If a specific key is passed (e.g. 'role'), return this property
    if (data && user) {
      return user[data];
    }

    // Otherwise, return the entire user object.
    return user;
  },
);
