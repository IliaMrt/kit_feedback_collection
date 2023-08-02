import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigService } from '@nestjs/config';
import { DbConnectorService } from '../db.connector/db.connector.service';
import { TokenService } from '../token/token.service';
import { TokenModule } from '../token/token.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from '../token/token.entity';

@Module({
  providers: [AuthService, ConfigService, DbConnectorService, TokenService],
  controllers: [AuthController],
  imports: [TokenModule, TypeOrmModule.forFeature([Token])],
  exports: [AuthService],
})
export class AuthModule {}
