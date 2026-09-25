import { ArgumentsHost } from '@nestjs/common';
import { SuperlineaDomainFilter } from './superlinea-domain.filter';
import { SuperlineaInvalidaError } from '../../domain/entities/superlinea-invalida.error';

describe('SuperlineaDomainFilter', () => {
  it('traduce SuperlineaInvalidaError a una respuesta HTTP 400 con el mensaje', () => {
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const host = {
      switchToHttp: () => ({ getResponse: () => ({ status }) }),
    } as unknown as ArgumentsHost;

    new SuperlineaDomainFilter().catch(new SuperlineaInvalidaError('La denominación es obligatoria.'), host);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ statusCode: 400, message: 'La denominación es obligatoria.' });
  });
});
