import { NestFactory } from '@nestjs/core';
import { ConfigService, ConfigType } from '@nestjs/config';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import baseConfig from './shared/common/configs/base.config';
import swaggerConfig from './shared/common/configs/swagger.config';
import { ValidationPipe } from '@nestjs/common';
import corsConfig from './shared/common/configs/cors.config';
import { Transport } from '@nestjs/microservices';
import kafkaConfig from './shared/common/configs/kafka.config';

async function bootstrap(): Promise<void> {
  global.__basedir = __dirname.slice(0, -9);
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === 'production'
        ? ['log', 'error', 'warn']
        : ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const base = configService.get<ConfigType<typeof baseConfig>>('base');
  const swagger =
    configService.get<ConfigType<typeof swaggerConfig>>('swagger');
  const cors = configService.get<ConfigType<typeof corsConfig>>('cors');
  const kafka = configService.get<ConfigType<typeof kafkaConfig>>('kafka');

  // Kafka
  app.connectMicroservice({
    transport: Transport.KAFKA,
    options: {
      client: {
        ssl: kafka.sslEnabled,
        clientId: kafka.clientId,
        brokers: kafka.brokers,
      },
      deserializer: kafka.deserializer,
    },
  });

  // Cors
  if (cors.enabled) {
    app.enableCors({
      origin: cors.origins,
      methods: cors.methods,
      credentials: cors.credentials,
    });
  }

  // Default
  app.setGlobalPrefix('/api/v1/contracts', { exclude: ['health'] });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  // Swagger Api
  if (swagger.enabled) {
    const options = new DocumentBuilder()
      .setTitle(swagger.title)
      .setDescription(swagger.description)
      .setVersion(swagger.version)
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, options);

    SwaggerModule.setup(swagger.path, app, document);
  }

  await app.startAllMicroservices();
  await app.listen(base.port || 3000);
}

bootstrap();
