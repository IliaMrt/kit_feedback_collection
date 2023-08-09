import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

import { ValidationPipe } from '@nestjs/common';
import { open } from 'fs/promises';
import * as process from 'process';
import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Kit Feedback Collection API documentation.')
    .setDescription(
      'The application for collection feedback from teachers for KIT school',
    )
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.use(cookieParser());

  app.enableCors({ credentials: true, origin: true });
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.APP_PORT);
  console.log(
    `Application started on ${process.env.APP_PORT} at ${new Date()}.`,
  );
  await readSettings();
}
bootstrap();

async function readSettings() {
  const file = await open(`${__dirname}/../config.files/main.config.json`, 'r');
  let temp = (await file.read()).buffer.toString();
  temp = temp.slice(0, (await file.stat()).size);
  await file.close();
  const data = JSON.parse(temp);
  process.env.GOOGLE_PRIVATE_KEY = data.private_key;
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = data.client_email;
  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const doc = new GoogleSpreadsheet(data.settings_url, serviceAccountAuth);
  await doc.loadInfo();
  const sheet = await doc.sheetsByTitle[data.settings_page];
  const rows = await sheet.getRows();
  for (const row of rows) {
    process.env[row.get('name')] = row.get('value');
  }
}
