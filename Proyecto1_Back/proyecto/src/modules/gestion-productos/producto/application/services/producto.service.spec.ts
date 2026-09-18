import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductoService } from './producto.service';
import { IProductoRepository } from '../../domain/interfaces/producto.repository-interface';
import { LineaService } from 'src/modules/gestion-productos/linea/application/services/linea.service';
import { MarcaService } from 'src/modules/gestion-productos/marca/application/services/marca.service';
import { ProveedorService } from 'src/modules/organizacion/proveedor/application/services/proveedor.service';
import { UsuarioService } from 'src/modules/gestion-usuario/usuario/application/services/usuario.service';
import { ProductoIntrinsicValidationService } from '../../domain/services/producto-intrinsic-validation.service';
import { ProductoValidationService } from '../../domain/services/producto-validation.service';
import { ProductoRelatedEntitiesValidator } from '../../infraestructure/validators/producto-related-entities.validator';
import { ProductoUniquenessValidator } from '../../infraestructure/validators/producto-uniqueness.validator';
import { UsuarioValidator } from 'src/modules/common/utils/validation/usuario-validator';
import { Producto } from '../../domain/entities/producto.entity';
import { Linea } from 'src/modules/gestion-productos/linea/domain/entities/linea.entity';
import { Marca } from 'src/modules/gestion-productos/marca/domain/entities/marca.entity';
import { Usuario } from 'src/modules/gestion-usuario/usuario/domain/entities/usuario.entity';
import { CreateProductoDto } from '../dto/create-producto.dto';

describe('ProductoService', () => {
  let service: ProductoService;
  let repository: jest.Mocked<IProductoRepository>;

  const usuario = { id: 1 } as Usuario;
  const linea = Linea.create({
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
    Producto.create({
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
      actualizarPrecio: jest.fn(),
      remove: jest.fn(),
      isCodigoProveedorDuplicado: jest.fn(),
      findByDenominacionCodigoProveedorFiltered: jest.fn(),
      existsByDenominacion: jest.fn().mockResolvedValue(false),
      existsByCodigoProveedor: jest.fn().mockResolvedValue(false),
      existsProductosActivosByMarca: jest.fn(),
      existsProductosActivosByLinea: jest.fn(),
      findByIds: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductoService,
        { provide: 'IProductoRepository', useValue: repository },
        {
          provide: LineaService,
          useValue: { findEntityById: jest.fn().mockResolvedValue(linea), findAllFor: jest.fn() },
        },
        {
          provide: MarcaService,
          useValue: { findEntityById: jest.fn().mockResolvedValue(marca), findAllFor: jest.fn() },
        },
        { provide: ProveedorService, useValue: {} },
        { provide: UsuarioService, useValue: { findOne: jest.fn().mockResolvedValue(usuario) } },
        { provide: ProductoIntrinsicValidationService, useValue: { validarDatosBasicos: jest.fn() } },
        { provide: ProductoValidationService, useValue: { validarEntidadesRelacionadas: jest.fn() } },
        {
          provide: ProductoRelatedEntitiesValidator,
          useValue: {
            validarYObtenerEntidadesRelacionadas: jest.fn().mockResolvedValue({ marca, linea }),
          },
        },
        {
          provide: ProductoUniquenessValidator,
          useValue: {
            validarDenominacionUnica: jest.fn(),
            validarCodigoProveedorUnico: jest.fn(),
          },
        },
        {
          provide: UsuarioValidator,
          useValue: { validarUsuarioExiste: jest.fn().mockResolvedValue(usuario) },
        },
      ],
    }).compile();

    service = module.get<ProductoService>(ProductoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('crea el producto delegando en el repositorio con el dominio ya armado', async () => {
      const guardado = crearProducto();
      repository.create.mockResolvedValue(guardado);

      const dto: CreateProductoDto = {
        denominacion: 'Producto de prueba',
        utilizaStockMinimo: false,
        utilizaPack: false,
        precio: 0,
        lineaId: 1,
        marcaId: 1,
        usuarioCreatedId: 1,
      } as CreateProductoDto;

      const resultado = await service.create(dto);

      expect(repository.create).toHaveBeenCalledTimes(1);
      const productoCreado = repository.create.mock.calls[0][0];
      expect(productoCreado).toBeInstanceOf(Producto);
      expect(productoCreado.getDenominacion()).toBe('Producto de prueba');
      expect(resultado).toBeDefined();
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

  describe('remove', () => {
    it('elimina el producto vía el repositorio', async () => {
      const producto = crearProducto();
      repository.findOne.mockResolvedValue(producto);
      repository.remove.mockResolvedValue(producto);

      const resultado = await service.remove(1, 1);

      expect(repository.remove).toHaveBeenCalledWith(producto, usuario);
      expect(resultado).toBeDefined();
    });

    it('lanza NotFoundException si el producto no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove(1, 1)).rejects.toThrow(NotFoundException);
    });
  });
});
