import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { ConfigModule } from '@nestjs/config';
import { Token } from './token.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [TokenService],
  imports: [
    JwtModule.register({
      secret: process.env.PRIVATE_KEY || 'SECRET',
      signOptions: {
        expiresIn: '1h',
      },
    }),
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),

    TypeOrmModule.forFeature([Token]),
  ],
  exports: [JwtModule, TokenService],
})
export class TokenModule {}
