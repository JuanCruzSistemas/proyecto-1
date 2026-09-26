import { PoliticaEliminacionLinea } from './politica-eliminacion-linea.service';

describe('PoliticaEliminacionLinea', () => {
  it('consulta al repositorio de productos si hay productos activos para la Línea', async () => {
    const productos = { existsProductosActivosByLinea: jest.fn().mockResolvedValue(true) };
    const politica = new PoliticaEliminacionLinea(productos as any);
    await expect(politica.tieneProductosActivosParaLinea(12)).resolves.toBe(true);
    expect(productos.existsProductosActivosByLinea).toHaveBeenCalledWith(12);
  });
});
