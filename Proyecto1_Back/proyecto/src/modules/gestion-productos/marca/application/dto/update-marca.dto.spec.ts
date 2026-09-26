import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateMarcaDto } from './update-marca.dto';

describe('UpdateMarcaDto', () => {
  it('acepta un objeto válido', async () => {
    const plain = {
      denominacion: 'Mazda',
      observacion: 'Actualizado',
      usuarioUpdatedId: 2,
    };

    const dto = plainToInstance(UpdateMarcaDto, plain);
    const errores = await validate(dto);

    expect(errores.length).toBe(0);
    expect(dto.denominacion).toBe('mazda');
    expect(dto.usuarioUpdatedId).toBe(2);
  });

  it('rechaza si usuarioUpdatedId no está presente', async () => {
    const plain = {
      denominacion: 'Mazda',
    };

    const dto = plainToInstance(UpdateMarcaDto, plain);
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

    const dto = plainToInstance(UpdateMarcaDto, plain);
    const errores = await validate(dto);

    expect(errores.length).toBe(0);
    expect(dto.observacion).toBe('Nueva observación');
  });

  it('hereda validaciones de CreateMarcaDto', async () => {
    const plain = {
      denominacion: 'Marca@#$', // Caracteres inválidos
      usuarioUpdatedId: 1,
    };

    const dto = plainToInstance(UpdateMarcaDto, plain);
    const errores = await validate(dto);

    expect(errores.length).toBeGreaterThan(0);
    expect(errores[0].property).toBe('denominacion');
  });

  it('transforma denominación a minúsculas', async () => {
    const plain = {
      denominacion: '  SUBARU  ',
      usuarioUpdatedId: 1,
    };

    const dto = plainToInstance(UpdateMarcaDto, plain);
    const errores = await validate(dto);

    expect(errores.length).toBe(0);
    expect(dto.denominacion).toBe('subaru');
  });
});
