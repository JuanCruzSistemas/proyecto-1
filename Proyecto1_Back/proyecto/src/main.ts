import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './modules/common/filters/global-exception.filters';
import { DomainExceptionFilter } from './modules/common/filters/domain-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Convierte el cuerpo a la clase del DTO
      whitelist: true, // Elimina propiedades no declaradas en el DTO
      forbidNonWhitelisted: true, // Lanza error si se reciben propiedades no permitidas
      /*
      transformOptions: {
        enableImplicitConversion: true,
      },*/
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Gestión Base - Distribuidora')
    .setDescription('La descripción de las  API  de la distribuidora')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  // Configurar prefijo para endpoints
  app.setGlobalPrefix('api');

  // Configurar filtro global de excepciones.
  // Nest evalúa los filtros globales del último al primero: GlobalExceptionFilter (@Catch() de todo)
  // va primero para que DomainExceptionFilter quede por delante y las DomainException respondan 422.
  app.useGlobalFilters(new GlobalExceptionFilter(), new DomainExceptionFilter());

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
