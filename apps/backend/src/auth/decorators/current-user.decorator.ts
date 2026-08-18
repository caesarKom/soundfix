import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    // We guarantee to TypeScript that we return a string using an assertion or default value
    return (request.user?.id as string) || '';
  }
);
