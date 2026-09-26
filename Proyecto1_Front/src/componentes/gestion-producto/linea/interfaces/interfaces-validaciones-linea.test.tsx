import { describe, expect, it } from 'vitest';
import { schema, transformData } from './interfaces-validaciones-linea';

describe('validación de formulario de Línea', () => {
  it('acepta una Línea válida con SuperLínea activa y stock mínimo', async () => {
    const values = await schema(true).validate({ superlineaId: 3, denominacion: '  Bebidas Frías  ',
      observacion: null, utilizaStockMinimo: true, stockMinimo: 0 });
    expect(values.superlineaId).toBe(3);
    expect(values.denominacion).toBe('bebidas frías');
    expect(values.stockMinimo).toBe(0);
  });

  it.each([undefined, 0, -1, 1.5])('rechaza SuperLínea ausente o inválida: %p', async (superlineaId) => {
    await expect(schema(false).validate({ superlineaId, denominacion: 'Bebidas', utilizaStockMinimo: false }))
      .rejects.toThrow('Debe seleccionar una SuperLínea para la línea');
  });

  it.each(['', '   ', 'Bebidas@', 'a'.repeat(256)])('rechaza denominaciones inválidas: %p', async (denominacion) => {
    await expect(schema(false).validate({ superlineaId: 1, denominacion, utilizaStockMinimo: false }))
      .rejects.toThrow();
  });

  it('exige stock mínimo cuando la opción está activa y no acepta negativos', async () => {
    await expect(schema(true).validate({ superlineaId: 1, denominacion: 'Bebidas', utilizaStockMinimo: true }))
      .rejects.toThrow('El stock mínimo es obligatorio.');
    await expect(schema(false).validate({ superlineaId: 1, denominacion: 'Bebidas', utilizaStockMinimo: false, stockMinimo: -1 }))
      .rejects.toThrow('El stock mínimo no puede ser negativo.');
  });

  it('transforma correctamente una Línea existente para la edición', () => {
    const result = transformData({ id: 2, superlineaId: 8, denominacion: 'Bebidas', observacion: null,
      stockMinimo: 6, utilizaStockMinimo: true } as any);
    expect(result).toEqual({ superlineaId: 8, denominacion: 'Bebidas', observacion: null, stockMinimo: 6, utilizaStockMinimo: true });
  });
});
