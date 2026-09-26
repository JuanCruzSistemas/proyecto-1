import { describe, expect, it } from 'vitest';
import { schema, transformData } from './interfaces-validaciones-presentacion';

describe('validación de formulario de Presentación', () => {
  it('acepta y normaliza una denominación válida', async () => {
    const result = await schema.validate({ denominacion: '  Pack 6  ', observacion: null });
    expect(result.denominacion).toBe('pack 6');
  });

  it.each(['', '   ', 'pack-x6', 'a'.repeat(256)])('rechaza denominaciones no válidas: %p', async (denominacion) => {
    await expect(schema.validate({ denominacion })).rejects.toThrow();
  });

  it('conserva observación nula y datos de edición', () => {
    expect(transformData({ id: 4, denominacion: '1L', observacion: null } as any))
      .toEqual({ denominacion: '1L', observacion: null });
  });
});
