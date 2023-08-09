import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import jwtDecode from 'jwt-decode';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const bearerIndex =
      request.rawHeaders.findIndex((v) => v === 'Authorization') + 1;
    const token = (request.rawHeaders[bearerIndex].split(' ')[0] = 'Bearer'
      ? request.rawHeaders[bearerIndex].split(' ')[1]
      : request.rawHeaders[bearerIndex]);
    return jwtDecode(token);
  },
);
