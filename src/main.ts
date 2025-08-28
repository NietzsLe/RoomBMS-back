import { NestApplication, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import rateLimit from 'express-rate-limit';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NextFunction, Request, Response } from 'express';
// import * as fs from 'fs';

async function bootstrap() {
  // const httpsOptions = {
  //   key: fs.readFileSync('C:/Users/thanh/Downloads/RoomBMS/cert.key'),
  //   cert: fs.readFileSync('C:/Users/thanh/Downloads/RoomBMS/cert.crt'),
  // };
  const app = await NestFactory.create<NestApplication>(AppModule, {
    // httpsOptions,
  });

  // const myService = app.get(Appointment); // 👈 Lấy injectable từ DI container

  // const bot = new Telegraf(process.env.BOT_TOKEN!);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      stopAtFirstError: true,
      forbidNonWhitelisted: true,
      enableDebugMessages: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.enableCors({
    credentials: true,
    exposedHeaders: ['set-cookie'],
    origin: (process.env.CORS_ORIGIN ?? '').split(','),
  });

  const shortStaticLimiter = rateLimit({
    windowMs: 30 * 1000, // 30 seconds
    limit: 200,
  });
  app.use('/images/rooms', shortStaticLimiter);
  app.use(
    '/images/rooms',
    (req: Request, res: Response, next: NextFunction) => {
      res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
      next();
    },
  );
  app.useStaticAssets(
    process.env.FILE_SYSTEM_PATH ?? join(__dirname, '..', 'image-storage'),
    {
      prefix: process.env.IMAGE_LINK_PREFIX,
    },
  );
  const config = new DocumentBuilder()
    .setTitle('RoomBMS')
    .setDescription('The RoomBMS API description')
    .setVersion('1.0')
    .addTag('RoomBMS')
    .addCookieAuth(
      process.env.NODE_ENV == 'dev' ? 'Authorization' : 'accessToken',
      process.env.NODE_ENV == 'dev'
        ? {
            type: 'apiKey',
            in: 'header',
          }
        : {
            type: 'apiKey',
            in: 'cookie',
          },
      'JWTAuth',
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api', app, documentFactory, {
    swaggerOptions: {
      withCredentials: true,
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
