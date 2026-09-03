import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { AppModule } from './app.module';
import { PrismaClientExceptionFilter } from './prisma/prisma-client-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  const defaultOrigins = [
    'http://localhost:3000',
    'https://queue-q-frontend.vercel.app',
    'https://frontend-two-phi-66.vercel.app',
  ];

  const configuredOrigins = (process.env.FRONTEND_URL ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const frontendOrigins = [
    ...new Set([...defaultOrigins, ...configuredOrigins]),
  ];

  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      if (
        !origin ||
        frontendOrigins.includes(origin) ||
        /^https:\/\/[\w-]+\.vercel\.app$/.test(origin) ||
        /^http:\/\/localhost(:\d+)?$/.test(origin) ||
        /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin) ||
        /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(origin) ||
        /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(origin)
      ) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    credentials: true,
  };

  app.enableCors(corsOptions);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new PrismaClientExceptionFilter());

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port, '0.0.0.0');
}
bootstrap();
