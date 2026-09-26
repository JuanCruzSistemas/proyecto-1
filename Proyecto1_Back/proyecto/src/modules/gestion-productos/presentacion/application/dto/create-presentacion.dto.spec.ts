import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreatePresentacionDto } from './create-presentacion.dto';

describe('CreatePresentacionDto', () => {
  it('acepta un objeto válido', async () => {
    const plain = {
      denominacion: 'Caja x 12',
      observacion: 'Presentación estándar',
      usuarioCreatedId: 1,
    };

    const dto = plainToInstance(CreatePresentacionDto, plain);
    const errores = await validate(dto);

    expect(errores.length).toBe(0);
    expect(dto.denominacion).toBe('caja x 12'); 
  });

  it('transforma la denominación a minúsculas y elimina espacios', async () => {
    const plain = {
      denominacion: '  BOTELLA 500ML  ',
      usuarioCreatedId: 1,
    };

    const dto = plainToInstance(CreatePresentacionDto, plain);
    const errores = await validate(dto);

    expect(errores.length).toBe(0);
    expect(dto.denominacion).toBe('botella 500ml');
  });

  it('rechaza denominación vacía', async () => {
    const plain = {
      denominacion: '',
      usuarioCreatedId: 1,
    };

    const dto = plainToInstance(CreatePresentacionDto, plain);
    const errores = await validate(dto);

    expect(errores.length).toBeGreaterThan(0);
    expect(errores[0].property).toBe('denominacion');
  });

  it('rechaza denominación con caracteres especiales', async () => {
    const plain = {
      denominacion: 'Caja@#$',
      usuarioCreatedId: 1,
    };

    const dto = plainToInstance(CreatePresentacionDto, plain);
    const errores = await validate(dto);

    expect(errores.length).toBeGreaterThan(0);
    expect(errores[0].constraints?.matches).toBeDefined();
  });

  it('rechaza si usuarioCreatedId no es un número entero', async () => {
    const plain = {
      denominacion: 'Sobre',
      usuarioCreatedId: 'texto',
    };

    const dto = plainToInstance(CreatePresentacionDto, plain);
    const errores = await validate(dto);

    expect(errores.length).toBeGreaterThan(0);
    const errorUsuario = errores.find((e) => e.property === 'usuarioCreatedId');
    expect(errorUsuario).toBeDefined();
  });

  it('acepta observacion opcional', async () => {
    const plain = {
      denominacion: 'Lata',
      usuarioCreatedId: 1,
    };

    const dto = plainToInstance(CreatePresentacionDto, plain);
    const errores = await validate(dto);

    expect(errores.length).toBe(0);
    expect(dto.observacion).toBeUndefined();
  });

  it('acepta denominación con espacios y caracteres acentuados', async () => {
    const plain = {
      denominacion: 'Paquete número 5',
      usuarioCreatedId: 1,
    };

    const dto = plainToInstance(CreatePresentacionDto, plain);
    const errores = await validate(dto);

    expect(errores.length).toBe(0);
    expect(dto.denominacion).toBe('paquete número 5');
  });
});
