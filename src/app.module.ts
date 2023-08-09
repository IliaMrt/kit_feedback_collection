import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbConnectorModule } from './db.connector/db.connector.module';
import { DbConnectorService } from './db.connector/db.connector.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { TokenModule } from './token/token.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from './token/token.entity';
import { AuthService } from './auth/auth.service';

@Module({
  imports: [
    DbConnectorModule,
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),
    AuthModule,
    TokenModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [Token],
      synchronize: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, DbConnectorService, AuthService],
})
export class AppModule {}
