import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/api/uploads/',
  });

  // Security headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // Cookie parser BEFORE CORS
  app.use(cookieParser());

  // Trust proxy untuk detect HTTPS di balik nginx
  const isProduction = configService.get('NODE_ENV') === 'production';
  if (isProduction) {
    app.set('trust proxy', 1);
  }

  // CORS Configuration
  const frontendUrl =
    configService.get('FRONTEND_URL') || 'http://localhost:3001';

  // Allow multiple origins untuk production + XENDIT
  const allowedOrigins = isProduction
    ? [
        'https://daylightapp.asia',
        'https://api.xendit.co',
      ]
    : [
        frontendUrl,
        'http://127.0.0.1:3001',
        'https://api.xendit.co',
      ];

  app.enableCors({
    origin: (origin, callback) => {
      // ⭐ Allow requests with no origin (Xendit webhooks, Postman, mobile apps)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('❌ Blocked by CORS:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'x-callback-token', 
    ],
    exposedHeaders: ['Set-Cookie'],
    maxAge: 86400,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  app.setGlobalPrefix('api');
  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const formattedErrors = errors.map((error) => {
          const constraints = error.constraints || {};
          const childErrors =
            error.children?.flatMap((child) => {
              const childConstraints = child.constraints || {};
              return Object.values(childConstraints);
            }) || [];

          return {
            field: error.property,
            message: [...Object.values(constraints), ...childErrors].join(
              '.  ',
            ),
            constraints: constraints,
          };
        });

        return new BadRequestException({
          message: 'Validation failed',
          errors: formattedErrors,
        });
      },
    }),
  );

  const port = configService.get('PORT') || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Application is running on: http://localhost:${port}/api`);
  console.log(`🌐 CORS enabled for: ${allowedOrigins.join(', ')}`);
  console.log(`🍪 Cookie domain: ${configService.get('COOKIE_DOMAIN')}`);
  console.log(`🔒 Trust Proxy: ${isProduction ? 'enabled' : 'disabled'}`);
  console.log(`🌍 Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  console.log(
    `🪝 Xendit Webhook: ${configService.get('XENDIT_WEBHOOK_TOKEN') ? '✅ Configured' : '❌ Not configured'}`,
  );
}
bootstrap();
