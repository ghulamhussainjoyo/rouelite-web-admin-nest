import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
// import {
// FastifyAdapter,
// NestFastifyApplication,
// } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './Exception/HttpExceptionFilter';

async function bootstrap() {
  // const app = await NestFactory.create<NestFastifyApplication>(
  //   AppModule,
  //   new FastifyAdapter(),
  // );

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
