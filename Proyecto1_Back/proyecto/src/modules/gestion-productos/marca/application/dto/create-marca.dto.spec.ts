import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateMarcaDto } from './create-marca.dto';

describe('CreateMarcaDto', () => {
  it('acepta un objeto válido', async () => {
    const plain = {
      denominacion: 'Toyota',
      observacion: 'Marca japonesa',
      usuarioCreatedId: 1,
    };

    const dto = plainToInstance(CreateMarcaDto, plain);
    const errores = await validate(dto);

    expect(errores.length).toBe(0);
    expect(dto.denominacion).toBe('toyota'); // Se transforma a minúsculas
  });

  it('transforma la denominación a minúsculas y elimina espacios', async () => {
    const plain = {
      denominacion: '  FORD  ',
      usuarioCreatedId: 1,
    };

    const dto = plainToInstance(CreateMarcaDto, plain);
    const errores = await validate(dto);

    expect(errores.length).toBe(0);
    expect(dto.denominacion).toBe('ford');
  });

  it('rechaza denominación vacía', async () => {
    const plain = {
      denominacion: '',
      usuarioCreatedId: 1,
    };

    const dto = plainToInstance(CreateMarcaDto, plain);
    const errores = await validate(dto);

    expect(errores.length).toBeGreaterThan(0);
    expect(errores[0].property).toBe('denominacion');
  });

  it('rechaza denominación con caracteres especiales', async () => {
    const plain = {
      denominacion: 'Marca@#$',
      usuarioCreatedId: 1,
    };

    const dto = plainToInstance(CreateMarcaDto, plain);
    const errores = await validate(dto);

    expect(errores.length).toBeGreaterThan(0);
    expect(errores[0].constraints?.matches).toBeDefined();
  });

  it('rechaza si usuarioCreatedId no es un número entero', async () => {
    const plain = {
      denominacion: 'Honda',
      usuarioCreatedId: 'texto',
    };

    const dto = plainToInstance(CreateMarcaDto, plain);
    const errores = await validate(dto);

    expect(errores.length).toBeGreaterThan(0);
    const errorUsuario = errores.find((e) => e.property === 'usuarioCreatedId');
    expect(errorUsuario).toBeDefined();
  });

  it('acepta observacion opcional', async () => {
    const plain = {
      denominacion: 'Nissan',
      usuarioCreatedId: 1,
    };

    const dto = plainToInstance(CreateMarcaDto, plain);
    const errores = await validate(dto);

    expect(errores.length).toBe(0);
    expect(dto.observacion).toBeUndefined();
  });

  it('acepta denominación con espacios y caracteres acentuados', async () => {
    const plain = {
      denominacion: 'Citroën España',
      usuarioCreatedId: 1,
    };

    const dto = plainToInstance(CreateMarcaDto, plain);
    const errores = await validate(dto);

    expect(errores.length).toBe(0);
    expect(dto.denominacion).toBe('citroën españa');
  });
});
