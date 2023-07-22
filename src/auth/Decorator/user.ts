import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import jwtDecode from 'jwt-decode';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const bearerIndex =
      request.rawHeaders.findIndex((v) => v === 'Authorization') + 1;
    return jwtDecode(request.rawHeaders[bearerIndex]);
  },
);
