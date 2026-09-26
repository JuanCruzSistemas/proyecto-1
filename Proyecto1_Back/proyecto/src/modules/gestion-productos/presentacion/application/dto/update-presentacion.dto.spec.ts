import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdatePresentacionDto } from './update-presentacion.dto';

describe('UpdatePresentacionDto', () => {
  it('acepta un objeto válido', async () => {
    const plain = {
      denominacion: 'Caja x 24',
      observacion: 'Actualizado',
      usuarioUpdatedId: 2,
    };

    const dto = plainToInstance(UpdatePresentacionDto, plain);
    const errores = await validate(dto);

    expect(errores.length).toBe(0);
    expect(dto.denominacion).toBe('caja x 24');
    expect(dto.usuarioUpdatedId).toBe(2);
  });

  it('rechaza si usuarioUpdatedId no está presente', async () => {
    const plain = {
      denominacion: 'Botella',
    };

    const dto = plainToInstance(UpdatePresentacionDto, plain);
    const errores = await validate(dto);

    expect(errores.length).toBeGreaterThan(0);
    const errorUsuario = errores.find((e) => e.property === 'usuarioUpdatedId');
    expect(errorUsuario).toBeDefined();
  });

  it('permite actualizar solo observacion', async () => {
    const plain = {
      observacion: 'Nueva observación',
      usuarioUpdatedId: 1,
    };

    const dto = plainToInstance(UpdatePresentacionDto, plain);
    const errores = await validate(dto);

    expect(errores.length).toBe(0);
    expect(dto.observacion).toBe('Nueva observación');
  });

  it('hereda validaciones de CreatePresentacionDto', async () => {
    const plain = {
      denominacion: 'Caja@#$', 
      usuarioUpdatedId: 1,
    };

    const dto = plainToInstance(UpdatePresentacionDto, plain);
    const errores = await validate(dto);

    expect(errores.length).toBeGreaterThan(0);
    expect(errores[0].property).toBe('denominacion');
  });

  it('transforma denominación a minúsculas', async () => {
    const plain = {
      denominacion: '  SOBRE GRANDE  ',
      usuarioUpdatedId: 1,
    };

    const dto = plainToInstance(UpdatePresentacionDto, plain);
    const errores = await validate(dto);

    expect(errores.length).toBe(0);
    expect(dto.denominacion).toBe('sobre grande');
  });
});
