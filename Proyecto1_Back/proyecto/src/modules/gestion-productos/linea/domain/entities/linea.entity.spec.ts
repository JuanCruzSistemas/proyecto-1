import { Linea } from './linea.entity';
import { DenominacionRequeridaException } from '../exceptions/denominacion-requerida.exception';
import { StockMinimoInvalidoException } from '../exceptions/stock-minimo-invalido.exception';

const crearLinea = (extra: Partial<Parameters<typeof Linea.create>[0]> = {}) =>
  Linea.create({ superlineaId: 10, denominacion: 'Bebidas', observacion: null,
    utilizaStockMinimo: false, stockMinimo: 0, usuarioCreatedId: 1, ...extra });

describe('Linea (dominio)', () => {
  it('crea una Línea válida asociada a una SuperLínea', () => {
    const linea = crearLinea({ superlineaId: 7, utilizaStockMinimo: true, stockMinimo: 8 });
    expect(linea.getId()).toBeNull();
    expect(linea.getSuperlineaId()).toBe(7);
    expect(linea.getDenominacion()).toBe('Bebidas');
    expect(linea.getStockMinimo()).toBe(8);
  });

  it.each(['', '   '])('rechaza una denominación vacía o de espacios: %p', (denominacion) => {
    expect(() => crearLinea({ denominacion })).toThrow(DenominacionRequeridaException);
  });

  it.each([-1, -10])('rechaza stock mínimo negativo aunque no esté habilitado: %i', (stockMinimo) => {
    expect(() => crearLinea({ stockMinimo, utilizaStockMinimo: false })).toThrow(StockMinimoInvalidoException);
  });

  it('acepta stock mínimo cero', () => expect(crearLinea({ stockMinimo: 0 }).getStockMinimo()).toBe(0));

  it('actualiza todos los atributos de negocio, incluida la SuperLínea', () => {
    const linea = crearLinea();
    linea.actualizarDatos({ superlineaId: 20, denominacion: 'Bebidas frías', observacion: 'sector A',
      utilizaStockMinimo: true, stockMinimo: 12, usuarioUpdatedId: 2 });
    expect(linea.getSuperlineaId()).toBe(20);
    expect(linea.getDenominacion()).toBe('Bebidas frías');
    expect(linea.getObservacion()).toBe('sector A');
    expect(linea.getUsuarioUpdatedId()).toBe(2);
  });

  it('conserva el estado anterior si la actualización es inválida', () => {
    const linea = crearLinea({ denominacion: 'Limpieza', superlineaId: 5, stockMinimo: 3 });
    expect(() => linea.actualizarDatos({ superlineaId: 8, denominacion: '   ', observacion: null,
      utilizaStockMinimo: true, stockMinimo: 9, usuarioUpdatedId: 2 })).toThrow(DenominacionRequeridaException);
    expect(linea.getDenominacion()).toBe('Limpieza');
    expect(linea.getSuperlineaId()).toBe(5);
    expect(linea.getStockMinimo()).toBe(3);
  });

  it('conserva el estado anterior ante stock mínimo negativo', () => {
    const linea = crearLinea({ stockMinimo: 3 });
    expect(() => linea.actualizarDatos({ superlineaId: 10, denominacion: 'Bebidas', observacion: null,
      utilizaStockMinimo: true, stockMinimo: -1, usuarioUpdatedId: 2 })).toThrow(StockMinimoInvalidoException);
    expect(linea.getStockMinimo()).toBe(3);
  });

  it('rehidrata una Línea persistida conservando ID, baja y asociación', () => {
    const fecha = new Date('2026-01-01T00:00:00.000Z');
    const linea = Linea.reconstitute({ id: 42, superlineaId: 9, denominacion: 'Persistida', observacion: null,
      utilizaStockMinimo: true, stockMinimo: 2, createdAt: fecha, updatedAt: fecha, deletedAt: null,
      usuarioCreatedId: 1, usuarioUpdatedId: null, usuarioDeletedId: null, sistema: 0 });
    expect(linea.getId()).toBe(42);
    expect(linea.getSuperlineaId()).toBe(9);
    expect(linea.getCreatedAt()).toBe(fecha);
  });

  it('marca la baja lógica con fecha y usuario', () => {
    const linea = crearLinea();
    linea.marcarComoEliminado(3);
    expect(linea.getDeletedAt()).toBeInstanceOf(Date);
    expect(linea.getUsuarioDeletedId()).toBe(3);
  });
});
