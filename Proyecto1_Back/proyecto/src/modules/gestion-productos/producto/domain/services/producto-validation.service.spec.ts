import { BadRequestException } from '@nestjs/common';
import { ProductoValidationService } from './producto-validation.service';
import { Linea } from 'src/modules/gestion-productos/linea/domain/entities/linea.entity';
import { Marca } from 'src/modules/gestion-productos/marca/domain/entities/marca.entity';

describe('ProductoValidationService', () => {
  const service = new ProductoValidationService();

  const marca = (sistema: number) =>
    Marca.reconstitute({
      id: 3,
      denominacion: 'Marca',
      observacion: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      usuarioCreatedId: 1,
      usuarioUpdatedId: null,
      usuarioDeletedId: null,
      sistema,
    });

  const linea = (sistema: number) =>
    Linea.reconstitute({
      id: 8,
      denominacion: 'Línea',
      superlineaId: 1,
      observacion: null,
      utilizaStockMinimo: false,
      stockMinimo: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      usuarioCreatedId: 1,
      usuarioUpdatedId: null,
      usuarioDeletedId: null,
      sistema,
    });

  it('acepta marca y línea que no son del sistema', () => {
    expect(() => service.validarEntidadesRelacionadas(marca(0), linea(0))).not.toThrow();
  });

  it('rechaza una marca del sistema indicando su id', () => {
    expect(() => service.validarEntidadesRelacionadas(marca(1), linea(0))).toThrow(
      new BadRequestException('Marca 3 está marcada como del sistema y no puede usarse'),
    );
  });

  it('rechaza una línea del sistema indicando su id', () => {
    expect(() => service.validarEntidadesRelacionadas(marca(0), linea(1))).toThrow(
      new BadRequestException('Línea 8 está marcada como del sistema y no puede usarse'),
    );
  });

  it('si ambas son del sistema informa primero la marca', () => {
    expect(() => service.validarEntidadesRelacionadas(marca(1), linea(1))).toThrow(/^Marca 3/);
  });
});
