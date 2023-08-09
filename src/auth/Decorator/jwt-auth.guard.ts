import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    try {
      const authHeader = req.headers.authorization;
      const bearer = authHeader.split(' ')[0];
      const token = authHeader.split(' ')[1];

      if (bearer !== 'Bearer' || !token)
        throw new UnauthorizedException({
          message: 'Ошибка авторизации',
        });
      req.user = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET_KEY'),
      });

      return true;
    } catch (e) {
      throw new UnauthorizedException({
        message: 'Пользователь не авторизован.',
        error: e,
      });
    }
  }
}
