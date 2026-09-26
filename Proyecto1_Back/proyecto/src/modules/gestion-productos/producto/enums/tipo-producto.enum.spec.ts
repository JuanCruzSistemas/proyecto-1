import { TipoProducto } from './tipo-producto.enum';

describe('TipoProducto', () => {
  it('mantiene los valores numéricos que se persisten', () => {
    expect(TipoProducto.NACIONAL).toBe(0);
    expect(TipoProducto.IMPORTADO).toBe(1);
  });

  it('permite obtener el nombre a partir del valor (enum numérico)', () => {
    expect(TipoProducto[0]).toBe('NACIONAL');
    expect(TipoProducto[1]).toBe('IMPORTADO');
  });
});
