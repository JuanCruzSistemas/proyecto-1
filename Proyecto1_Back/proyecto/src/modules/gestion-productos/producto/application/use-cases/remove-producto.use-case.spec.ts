import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RemoveProductoUseCase } from './remove-producto.use-case';
import { FindEntityByIdUseCase } from './find-entity-by-id.use-case';
import { UsuarioService } from 'src/modules/gestion-usuario/usuario/application/services/usuario.service';
import { IProductoRepository, PRODUCTO_REPOSITORY_TOKEN } from '../../domain/interfaces/producto.repository-interface';
import { ProductoFactory } from '../../domain/factories/producto.factory';
import { Linea } from 'src/modules/gestion-productos/linea/domain/entities/linea.entity';
import { Marca } from 'src/modules/gestion-productos/marca/domain/entities/marca.entity';
import { Usuario } from 'src/modules/gestion-usuario/usuario/domain/entities/usuario.entity';

describe('RemoveProductoUseCase', () => {
  let useCase: RemoveProductoUseCase;
  let repository: jest.Mocked<IProductoRepository>;
  let findEntityByIdUseCase: jest.Mocked<Pick<FindEntityByIdUseCase, 'execute'>>;
  let usuarioService: jest.Mocked<Pick<UsuarioService, 'findOne'>>;

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

  const crearProducto = () =>
    ProductoFactory.create({
      denominacion: 'Producto de prueba',
      codigoBarra: null,
      proveedor: null,
      codigoProveedor: null,
      stock: 10,
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
      existsByDenominacion: jest.fn(),
      existsByCodigoProveedor: jest.fn(),
      existsProductosActivosByMarca: jest.fn(),
      existsProductosActivosByLinea: jest.fn(),
      findByIds: jest.fn(),
    };
    findEntityByIdUseCase = { execute: jest.fn() };
    usuarioService = { findOne: jest.fn().mockResolvedValue(usuario) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoveProductoUseCase,
        { provide: FindEntityByIdUseCase, useValue: findEntityByIdUseCase },
        { provide: UsuarioService, useValue: usuarioService },
        { provide: PRODUCTO_REPOSITORY_TOKEN, useValue: repository },
      ],
    }).compile();

    useCase = module.get(RemoveProductoUseCase);
  });

  it('marca el producto como eliminado y persiste esa entidad mutada', async () => {
    const producto = crearProducto();
    findEntityByIdUseCase.execute.mockResolvedValue(producto);
    repository.remove.mockResolvedValue(producto);

    await useCase.execute(1, usuario.id);

    expect(producto.getDeletedAt()).not.toBeNull();
    expect(repository.remove).toHaveBeenCalledWith(producto, usuario);
  });

  it('rechaza eliminar un producto que ya estaba eliminado', async () => {
    const producto = crearProducto();
    producto.marcarComoEliminado(usuario);
    findEntityByIdUseCase.execute.mockResolvedValue(producto);

    await expect(useCase.execute(1, usuario.id)).rejects.toThrow(NotFoundException);
    expect(repository.remove).not.toHaveBeenCalled();
  });

  it('lanza NotFoundException si el usuario no existe', async () => {
    findEntityByIdUseCase.execute.mockResolvedValue(crearProducto());
    usuarioService.findOne.mockResolvedValue(null as any);

    await expect(useCase.execute(1, 999)).rejects.toThrow(NotFoundException);
    expect(repository.remove).not.toHaveBeenCalled();
  });
});
