// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors({
    origin: configService.get<string[]>('cors.origin'),
    credentials: configService.get<boolean>('cors.credentials'),
  });

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle(configService.get<string>('app.name') ?? 'Application API')
    .setDescription(
      configService.get<string>('app.description') ?? 'API Documentation',
    )
    .setVersion(configService.get<string>('app.version') ?? '1.0')
    .addTag('health', 'Health check endpoints')
    .addTag('detections', 'Detection management')
    .addTag('cameras', 'Camera management')
    .addTag('violations', 'Violation tracking')
    .addTag('ngsi-ld', 'NGSI-LD entities')
    .addTag('statistics', 'Statistics and reports')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Start server
  const port = configService.get<number>('port');
  await app.listen(port || 8080);

  logger.log(`🚀 Backend running on http://localhost:${port}`);
  logger.log(`📚 API Docs: http://localhost:${port}/api/docs`);
  logger.log(`🌍 Environment: ${configService.get('nodeEnv')}`);
}

void bootstrap();
