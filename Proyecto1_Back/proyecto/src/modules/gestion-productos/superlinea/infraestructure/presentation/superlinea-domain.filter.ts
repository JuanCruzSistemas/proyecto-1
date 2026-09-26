import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { SuperlineaInvalidaError } from '../../domain/entities/superlinea-invalida.error';

@Catch(SuperlineaInvalidaError)
export class SuperlineaDomainFilter implements ExceptionFilter {
  catch(error: SuperlineaInvalidaError, host: ArgumentsHost) {
    host.switchToHttp().getResponse<Response>().status(400).json({
      statusCode: 400, message: error.message,
    });
  }
}
