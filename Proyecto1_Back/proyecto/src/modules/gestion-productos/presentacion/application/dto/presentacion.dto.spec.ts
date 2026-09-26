import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { PresentacionDto } from './presentacion.dto';

describe('PresentacionDto', () => {
  it('acepta un objeto válido completo', async () => {
    const plain = {
      id: 123,
      denominacion: 'CAJA X 12',
      observacion: 'Presentación estándar',
      deletedAt: null,
    };

    const dto = plainToInstance(PresentacionDto, plain);
    const errores = await validate(dto);

    expect(errores.length).toBe(0);
    expect(dto.id).toBe(123);
    expect(dto.denominacion).toBe('CAJA X 12');
  });

  it('acepta deletedAt como string o null', async () => {
    const plain1 = {
      id: 1,
      denominacion: 'Test',
      observacion: '',
      deletedAt: '2024-01-01T00:00:00.000Z',
    };

    const dto1 = plainToInstance(PresentacionDto, plain1);
    const errores1 = await validate(dto1);

    expect(errores1.length).toBe(0);
    expect(dto1.deletedAt).toBe('2024-01-01T00:00:00.000Z');

    const plain2 = {
      id: 2,
      denominacion: 'Test2',
      observacion: '',
      deletedAt: null,
    };

    const dto2 = plainToInstance(PresentacionDto, plain2);
    const errores2 = await validate(dto2);

    expect(errores2.length).toBe(0);
    expect(dto2.deletedAt).toBeNull();
  });

  it('transforma id a número', async () => {
    const plain = {
      id: '456',
      denominacion: 'Botella',
      observacion: '',
      deletedAt: null,
    };

    const dto = plainToInstance(PresentacionDto, plain);
    const errores = await validate(dto);

    expect(errores.length).toBe(0);
    expect(dto.id).toBe(456);
    expect(typeof dto.id).toBe('number');
  });

  it('rechaza si falta un campo requerido', async () => {
    const plain = {
      id: 1,
      observacion: 'Test',
      deletedAt: null,
    };

    const dto = plainToInstance(PresentacionDto, plain);
    const errores = await validate(dto);

    expect(errores.length).toBeGreaterThan(0);
    const errorDenominacion = errores.find((e) => e.property === 'denominacion');
    expect(errorDenominacion).toBeDefined();
  });
});
