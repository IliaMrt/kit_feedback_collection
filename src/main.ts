import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Kit Feedback Collection API documentation.')
    .setDescription('The application for collection feedback from teachers for KIT school')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.use(cookieParser());

  app.enableCors({ credentials: true, origin: true });
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
  console.log(
    `Application started on ${process.env.APP_PORT} at ${new Date()}.`,
  );
}
bootstrap();
