import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from './token.entity';
import { Injectable } from '@nestjs/common';
import * as process from 'process';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly jwtService: JwtService,
  ) {}
  generateTokens(payload) {
    console.log('KIT - Token Service - generate token at', new Date());

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_ACCESS_EXPIRATION,
      secret: process.env.JWT_SECRET_KEY,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_REFRESH_EXPIRATION,
      secret: process.env.JWT_REFRESH_SECRET,
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  validateAccessToken(token) {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
    } catch (e) {
      return null;
    }
  }

  validateRefreshToken(token) {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch (e) {
      return null;
    }
  }

  async saveToken(email: string, refreshToken: string) {
    const tokenData = await this.tokenRepository.findOneBy({
      userEmail: email,
    });
    if (tokenData) {
      tokenData.refreshToken = refreshToken;
      return this.tokenRepository.save(tokenData);
    }
    return await this.tokenRepository.insert({
      userEmail: email,
      refreshToken,
    });
  }

  async removeToken(refreshToken) {
    return await this.tokenRepository.delete({ refreshToken });
  }

  async findToken(refreshToken) {
    return await this.tokenRepository.findOneBy({ refreshToken });
  }
}
