import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
// import {
// FastifyAdapter,
// NestFastifyApplication,
// } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './Exception/HttpExceptionFilter';
import * as passport from 'passport';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  // const app = await NestFactory.create<NestFastifyApplication>(
  //   AppModule,
  //   new FastifyAdapter(),
  // );
  const configService = new ConfigService();

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  // Initialize Passport middleware for authentication
  app.use(passport.initialize());
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors();
  app.use(passport.initialize());
  await app.listen(configService.get('PORT') || 3000);
}
bootstrap();
