import { DomainException } from 'src/modules/common/exceptions/domain.exception';
import { CostoInvalidoException } from './costo-invalido.exception';
import { DenominacionRequeridaException } from './denominacion-requerida.exception';
import { MargenInvalidoException } from './margen-invalido.exception';
import { MotivoRequeridoException } from './motivo-requerido.exception';
import { PrecioInvalidoException } from './precio-invalido.exception';
import { PresentacionRequeridaException } from './presentacion-requerida.exception';
import { StockInvalidoException } from './stock-invalido.exception';

describe('Excepciones de dominio de Producto', () => {
  it.each([
    ['CostoInvalidoException', new CostoInvalidoException(-5), "Costo con valor '-5 inválido. Regla: Costo > 0'"],
    ['MargenInvalidoException', new MargenInvalidoException(1.5), "Margen con valor '1.5 inválido. Regla: 0 <= Margen <= 1'"],
    ['PrecioInvalidoException', new PrecioInvalidoException(0), "Precio con valor '0 inválido. Regla: Precio > 0'"],
    ['StockInvalidoException', new StockInvalidoException(-3), "Valor de stock '-3' inválido. Regla: Stock >= 0"],
    ['DenominacionRequeridaException', new DenominacionRequeridaException(), 'La denominación es obligatoria'],
    ['MotivoRequeridoException', new MotivoRequeridoException(), 'El motivo es obligatorio para ajustar el stock'],
    [
      'PresentacionRequeridaException',
      new PresentacionRequeridaException(),
      'No se puede generar la denominación automática: falta asignar una Presentación al producto.',
    ],
  ])('%s es una DomainException con el mensaje esperado', (_nombre, excepcion, mensaje) => {
    expect(excepcion).toBeInstanceOf(DomainException);
    expect(excepcion).toBeInstanceOf(Error);
    expect(excepcion.message).toBe(mensaje);
  });

  it('se pueden distinguir entre sí al capturarlas', () => {
    const lanzar = () => {
      throw new StockInvalidoException(-1);
    };

    expect(lanzar).toThrow(StockInvalidoException);
    expect(lanzar).not.toThrow(CostoInvalidoException);
  });
});
