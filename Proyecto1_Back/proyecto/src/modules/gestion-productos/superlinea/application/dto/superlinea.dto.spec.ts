import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SaveSuperlineaDto } from './superlinea.dto';

describe('SaveSuperlineaDto', () => {
  const validar = async (payload: Record<string, unknown>) => {
    const dto = plainToInstance(SaveSuperlineaDto, payload);
    const errores = await validate(dto);
    return { dto, mensajes: errores.flatMap((e) => Object.values(e.constraints ?? {})) };
  };

  it('acepta una denominación válida sin observación', async () => {
    const { mensajes } = await validar({ denominacion: 'Bebidas' });
    expect(mensajes).toEqual([]);
  });

  it('acepta observación nula o texto', async () => {
    expect((await validar({ denominacion: 'Bebidas', observacion: null })).mensajes).toEqual([]);
    expect((await validar({ denominacion: 'Bebidas', observacion: 'algo' })).mensajes).toEqual([]);
  });

  it('recorta los espacios de la denominación', async () => {
    const { dto } = await validar({ denominacion: '  Bebidas  ' });
    expect(dto.denominacion).toBe('Bebidas');
  });

  it('rechaza una denominación ausente', async () => {
    const { mensajes } = await validar({});
    expect(mensajes).toEqual(
      expect.arrayContaining(['La denominación es obligatoria.', 'La denominación debe ser texto.']),
    );
  });

  it('rechaza una denominación que queda vacía después del trim', async () => {
    const { mensajes } = await validar({ denominacion: '    ' });
    expect(mensajes).toContain('La denominación es obligatoria.');
  });

  it('rechaza una denominación que no es texto (sin intentar recortarla)', async () => {
    const { dto, mensajes } = await validar({ denominacion: 123 });
    expect(dto.denominacion).toBe(123);
    expect(mensajes).toContain('La denominación debe ser texto.');
  });

  it('rechaza más de 255 caracteres', async () => {
    const { mensajes } = await validar({ denominacion: 'a'.repeat(256) });
    expect(mensajes).toContain('La denominación admite hasta 255 caracteres.');
  });

  it('rechaza una observación que no es texto', async () => {
    const { mensajes } = await validar({ denominacion: 'Bebidas', observacion: 10 });
    expect(mensajes).toHaveLength(1);
  });
});
