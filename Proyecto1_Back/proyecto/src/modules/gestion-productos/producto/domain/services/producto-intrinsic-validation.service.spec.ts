import { BadRequestException } from '@nestjs/common';
import { ProductoIntrinsicValidationService } from './producto-intrinsic-validation.service';

describe('ProductoIntrinsicValidationService', () => {
  const service = new ProductoIntrinsicValidationService();

  type Datos = Parameters<ProductoIntrinsicValidationService['validarDatosBasicos']>[0];
  const datos = (overrides: Partial<Datos> = {}): Datos => ({
    denominacion: 'Producto válido',
    marcaId: 1,
    lineaId: 2,
    ...overrides,
  });

  const esperarError = (d: Datos, mensaje: string) => {
    expect(() => service.validarDatosBasicos(d)).toThrow(BadRequestException);
    expect(() => service.validarDatosBasicos(d)).toThrow(mensaje);
  };

  it('acepta datos mínimos válidos', () => {
    expect(() => service.validarDatosBasicos(datos())).not.toThrow();
  });

  describe('denominación', () => {
    it('es opcional (se autogenera)', () => {
      expect(() => service.validarDatosBasicos(datos({ denominacion: undefined }))).not.toThrow();
    });

    it('acepta exactamente 200 caracteres', () => {
      expect(() => service.validarDatosBasicos(datos({ denominacion: 'a'.repeat(200) }))).not.toThrow();
    });

    it('rechaza más de 200 caracteres', () => {
      esperarError(datos({ denominacion: 'a'.repeat(201) }), 'La denominación no puede superar 200 caracteres');
    });
  });

  describe('ids de marca y línea', () => {
    it.each([0, -1, undefined, null])('rechaza marcaId %p', (marcaId) => {
      esperarError(datos({ marcaId: marcaId as number }), 'Marca ID es requerido y debe ser válido');
    });

    it.each([0, -5, undefined, null])('rechaza lineaId %p', (lineaId) => {
      esperarError(datos({ lineaId: lineaId as number }), 'Línea ID es requerido y debe ser válido');
    });

    it('valida la marca antes que la línea', () => {
      esperarError(datos({ marcaId: 0, lineaId: 0 }), 'Marca ID');
    });
  });

  describe('precios', () => {
    it('acepta la jerarquía Mayorista <= Cliente <= Ocasional', () => {
      expect(() =>
        service.validarDatosBasicos(datos({ precioMayorista: 80, precioCliente: 100, precioOcasional: 120 })),
      ).not.toThrow();
    });

    it('acepta precios iguales entre sí', () => {
      expect(() =>
        service.validarDatosBasicos(datos({ precioMayorista: 100, precioCliente: 100, precioOcasional: 100 })),
      ).not.toThrow();
    });

    it('acepta precios en 0 (no participan de la jerarquía)', () => {
      expect(() =>
        service.validarDatosBasicos(datos({ precioMayorista: 0, precioCliente: 50, precioOcasional: 0 })),
      ).not.toThrow();
    });

    it('rechaza precio mayorista negativo', () => {
      esperarError(datos({ precioMayorista: -1 }), 'El precio mayorista no puede ser negativo');
    });

    it('rechaza precio cliente negativo', () => {
      esperarError(datos({ precioCliente: -1 }), 'El precio cliente no puede ser negativo');
    });

    it('rechaza precio ocasional negativo', () => {
      esperarError(datos({ precioOcasional: -1 }), 'El precio ocasional no puede ser negativo');
    });

    it('rechaza Mayorista > Cliente', () => {
      esperarError(
        datos({ precioMayorista: 150, precioCliente: 100 }),
        'El precio Mayorista no puede superar el precio Cliente',
      );
    });

    it('rechaza Cliente > Ocasional', () => {
      esperarError(
        datos({ precioCliente: 200, precioOcasional: 150 }),
        'El precio Cliente no puede superar el precio Ocasional',
      );
    });

    it('rechaza Mayorista > Ocasional aunque no haya precio cliente', () => {
      esperarError(
        datos({ precioMayorista: 300, precioOcasional: 150 }),
        'El precio Mayorista no puede superar el precio Ocasional',
      );
    });
  });
});
