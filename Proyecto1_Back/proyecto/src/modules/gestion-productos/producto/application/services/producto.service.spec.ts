import { Test, TestingModule } from '@nestjs/testing';
import { ProductoService } from './producto.service';
import { IProductoRepository, PRODUCTO_REPOSITORY_TOKEN } from '../../domain/repositories/producto.repository.interface';
import { LineaService } from 'src/modules/gestion-productos/linea/application/services/linea.service';
import { MarcaService } from 'src/modules/gestion-productos/marca/application/services/marca.service';
import { PresentacionService } from 'src/modules/gestion-productos/presentacion/application/services/presentacion.service';
import { ProductoFactory } from '../../domain/factories/producto.factory';
import { Linea } from 'src/modules/gestion-productos/linea/domain/entities/linea.entity';
import { Marca } from 'src/modules/gestion-productos/marca/domain/entities/marca.entity';
import { Usuario } from 'src/modules/gestion-usuario/usuario/domain/entities/usuario.entity';
import { CreateProductoUseCase } from '../use-cases/create-producto.use-case';
import { UpdateProductoUseCase } from '../use-cases/update-producto.use-case';
import { FindByProductoUseCase } from '../use-cases/find-by-producto.use-case';
import { FindByIdConAuditoria } from '../use-cases/find-by-id-auditoria.use-case';
import { FindDtoByIdUseCase } from '../use-cases/find-dto-by-id.use-case';
import { FindEntityByIdUseCase } from '../use-cases/find-entity-by-id.use-case';
import { RemoveProductoUseCase } from '../use-cases/remove-producto.use-case';
import { FindByDenominacionUseCase } from '../use-cases/find-by-denominiacion.use-case';

describe('ProductoService', () => {
  let service: ProductoService;
  let repository: jest.Mocked<IProductoRepository>;
  let createProductoUseCase: jest.Mocked<Pick<CreateProductoUseCase, 'execute'>>;
  let updateProductoUseCase: jest.Mocked<Pick<UpdateProductoUseCase, 'execute'>>;
  let findByProductoUseCase: jest.Mocked<Pick<FindByProductoUseCase, 'findByRapido' | 'findBy'>>;
  let findByIdConAuditoriaUseCase: jest.Mocked<Pick<FindByIdConAuditoria, 'execute'>>;
  let findDtoByIdUseCase: jest.Mocked<Pick<FindDtoByIdUseCase, 'execute'>>;
  let findEntityByIdUseCase: jest.Mocked<Pick<FindEntityByIdUseCase, 'execute'>>;
  let removeProductoUseCase: jest.Mocked<Pick<RemoveProductoUseCase, 'execute'>>;
  let findByDenominacionUseCase: jest.Mocked<Pick<FindByDenominacionUseCase, 'execute'>>;
  let lineaService: jest.Mocked<Pick<LineaService, 'findEntityById' | 'findAllFor'>>;
  let marcaService: jest.Mocked<Pick<MarcaService, 'findEntityById' | 'findAllFor'>>;
  let presentacionService: jest.Mocked<Pick<PresentacionService, 'findAllFor'>>;

  const usuario = { id: 1 } as Usuario;
  const linea = Linea.create({
    superlineaId: 1,
    denominacion: 'Aceites',
    observacion: null,
    utilizaStockMinimo: false,
    stockMinimo: 0,
    usuarioCreatedId: 1,
  });
  const marca = Marca.create({
    denominacion: 'Genérica',
    observacion: null,
    usuarioCreatedId: 1,
  });

  const crearProducto = (stock = 10) =>
    ProductoFactory.create({
      denominacion: 'Producto de prueba',
      codigoBarra: null,
      proveedor: null,
      codigoProveedor: null,
      stock,
      utilizaStockMinimo: false,
      utilizaStockMinimoPorEmpresa: false,
      stockMinimo: 2,
      costo: 100,
      margen: 0.2,
      destacado: false,
      envioGratis: false,
      observacion: null,
      usuarioCreated: usuario,
      linea,
      marca,
      presentacion: null,
      utilizaPack: false,
      cantidadPorPack: null,
      imagen: null,
      ubicacion: null,
      codigoReferencia: null,
    });

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      findOne: jest.fn(),
      findByIdConAuditoria: jest.fn(),
      findByDenominacion: jest.fn(),
      findBy: jest.fn(),
      findByRapido: jest.fn(),
      findByIdWithoutRelations: jest.fn(),
      update: jest.fn(),
      updateEntity: jest.fn(),
      remove: jest.fn(),
      isCodigoProveedorDuplicado: jest.fn(),
      findByDenominacionCodigoProveedorFiltered: jest.fn(),
      existsByDenominacion: jest.fn().mockResolvedValue(false),
      existsByCodigoProveedor: jest.fn().mockResolvedValue(false),
      existsProductosActivosByMarca: jest.fn(),
      existsProductosActivosByLinea: jest.fn(),
      existsProductosActivosByPresentacion: jest.fn(),
      findByIds: jest.fn(),
    };

    createProductoUseCase = { execute: jest.fn() };
    updateProductoUseCase = { execute: jest.fn() };
    findByProductoUseCase = { findByRapido: jest.fn(), findBy: jest.fn() };
    findByIdConAuditoriaUseCase = { execute: jest.fn() };
    findDtoByIdUseCase = { execute: jest.fn() };
    findEntityByIdUseCase = { execute: jest.fn() };
    removeProductoUseCase = { execute: jest.fn() };
    findByDenominacionUseCase = { execute: jest.fn() };
    lineaService = { findEntityById: jest.fn(), findAllFor: jest.fn() };
    marcaService = { findEntityById: jest.fn(), findAllFor: jest.fn() };
    presentacionService = { findAllFor: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductoService,
        { provide: PRODUCTO_REPOSITORY_TOKEN, useValue: repository },
        { provide: CreateProductoUseCase, useValue: createProductoUseCase },
        { provide: UpdateProductoUseCase, useValue: updateProductoUseCase },
        { provide: FindByProductoUseCase, useValue: findByProductoUseCase },
        { provide: FindByIdConAuditoria, useValue: findByIdConAuditoriaUseCase },
        { provide: FindDtoByIdUseCase, useValue: findDtoByIdUseCase },
        { provide: FindEntityByIdUseCase, useValue: findEntityByIdUseCase },
        { provide: RemoveProductoUseCase, useValue: removeProductoUseCase },
        { provide: FindByDenominacionUseCase, useValue: findByDenominacionUseCase },
        { provide: LineaService, useValue: lineaService },
        { provide: MarcaService, useValue: marcaService },
        { provide: PresentacionService, useValue: presentacionService },
      ],
    }).compile();

    service = module.get<ProductoService>(ProductoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('delegación a casos de uso', () => {
    it('create() delega en CreateProductoUseCase', async () => {
      const dto = { denominacion: 'x' } as any;
      createProductoUseCase.execute.mockResolvedValue('ok' as any);

      const resultado = await service.create(dto);

      expect(createProductoUseCase.execute).toHaveBeenCalledWith(dto);
      expect(resultado).toBe('ok');
    });

    it('update() delega en UpdateProductoUseCase', async () => {
      const dto = { denominacion: 'x' } as any;
      updateProductoUseCase.execute.mockResolvedValue('ok' as any);

      const resultado = await service.update(1, dto);

      expect(updateProductoUseCase.execute).toHaveBeenCalledWith(1, dto);
      expect(resultado).toBe('ok');
    });

    it('remove() delega en RemoveProductoUseCase', async () => {
      removeProductoUseCase.execute.mockResolvedValue('ok' as any);

      const resultado = await service.remove(1, 2);

      expect(removeProductoUseCase.execute).toHaveBeenCalledWith(1, 2);
      expect(resultado).toBe('ok');
    });

    it('findEntityById() delega en FindEntityByIdUseCase', async () => {
      const producto = crearProducto();
      findEntityByIdUseCase.execute.mockResolvedValue(producto);

      const resultado = await service.findEntityById(1);

      expect(findEntityByIdUseCase.execute).toHaveBeenCalledWith(1);
      expect(resultado).toBe(producto);
    });

    it('findDtoById() delega en FindDtoByIdUseCase', async () => {
      findDtoByIdUseCase.execute.mockResolvedValue('dto' as any);

      const resultado = await service.findDtoById(1);

      expect(findDtoByIdUseCase.execute).toHaveBeenCalledWith(1);
      expect(resultado).toBe('dto');
    });

    it('findByIdConAuditoria() delega en FindByIdConAuditoria', async () => {
      findByIdConAuditoriaUseCase.execute.mockResolvedValue('auditoria' as any);

      const resultado = await service.findByIdConAuditoria(1);

      expect(findByIdConAuditoriaUseCase.execute).toHaveBeenCalledWith(1);
      expect(resultado).toBe('auditoria');
    });

    it('findByDenominacionCodigoProveedorFiltered() delega en FindByDenominacionUseCase', async () => {
      findByDenominacionUseCase.execute.mockResolvedValue('resultado' as any);

      const resultado = await service.findByDenominacionCodigoProveedorFiltered('x', 0, 10);

      expect(findByDenominacionUseCase.execute).toHaveBeenCalledWith('x', 0, 10);
      expect(resultado).toBe('resultado');
    });
  });

  describe('incrementarStock / decrementarStock', () => {
    it('ajusta el stock a través del dominio y persiste el producto actualizado', async () => {
      const producto = crearProducto(10);
      repository.findOne.mockResolvedValue(producto);
      repository.updateEntity.mockResolvedValue(producto);

      const nuevoStock = await service.incrementarStock({} as any, 1, 5, 'reposición');

      expect(nuevoStock).toBe(15);
      expect(producto.getStock()).toBe(15);
      expect(repository.updateEntity).toHaveBeenCalledWith({}, producto);
    });

    it('rechaza dejar el stock en negativo (la validación vive en el VO Stock)', async () => {
      const producto = crearProducto(3);
      repository.findOne.mockResolvedValue(producto);

      await expect(
        service.decrementarStock({} as any, 1, 10, 'venta'),
      ).rejects.toThrow();
      expect(repository.updateEntity).not.toHaveBeenCalled();
    });

    it('lanza un error si el producto no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.incrementarStock({} as any, 999, 1),
      ).rejects.toThrow('Producto con ID 999 no encontrado');
    });
  });
});
