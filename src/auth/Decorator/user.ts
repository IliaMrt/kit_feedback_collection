import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import jwtDecode from 'jwt-decode';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return jwtDecode(request.rawHeaders[1]);
  },
);