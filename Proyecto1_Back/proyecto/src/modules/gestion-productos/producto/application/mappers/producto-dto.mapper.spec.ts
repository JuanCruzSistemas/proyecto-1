import { ProductoDtoMapper } from './producto-dto.mapper';
import { ProductoFactory } from '../../domain/factories/producto.factory';
import { Linea } from 'src/modules/gestion-productos/linea/domain/entities/linea.entity';
import { Marca } from 'src/modules/gestion-productos/marca/domain/entities/marca.entity';
import { Presentacion } from 'src/modules/gestion-productos/presentacion/domain/entities/presentacion.entity';
import { Usuario } from 'src/modules/gestion-usuario/usuario/domain/entities/usuario.entity';
import { CreateProductoDto } from '../dto/create-producto.dto';
import { UpdateProductoDto } from '../dto/update-producto.dto';

describe('ProductoDtoMapper', () => {
  const crearUsuario = () => ({ id: 1, denominacion: 'Usuario Test' }) as Usuario;

  const crearLinea = () =>
    Linea.create({
      superlineaId: 1,
      denominacion: 'Aceites',
      observacion: null,
      utilizaStockMinimo: false,
      stockMinimo: 0,
      usuarioCreatedId: 1,
    });

  const crearMarca = () =>
    Marca.create({
      denominacion: 'Genérica',
      observacion: null,
      usuarioCreatedId: 1,
    });

  const crearPresentacion = () =>
    Presentacion.create({
      denominacion: '1 Litro',
      observacion: null,
      usuarioCreatedId: 1,
    });

  const crearProducto = (overrides = {}) =>
    ProductoFactory.create({
      denominacion: 'Aceite Genérica 1 Litro',
      codigoBarra: '7890123456789',
      proveedor: null,
      codigoProveedor: 'CP001',
      stock: 100,
      utilizaStockMinimo: true,
      utilizaStockMinimoPorEmpresa: false,
      stockMinimo: 10,
      costo: 250,
      margen: 0.2,
      destacado: false,
      envioGratis: false,
      observacion: 'Producto de prueba',
      usuarioCreated: crearUsuario(),
      linea: crearLinea(),
      marca: crearMarca(),
      presentacion: crearPresentacion(),
      utilizaPack: false,
      cantidadPorPack: null,
      imagen: null,
      ubicacion: 'A1-B2',
      codigoReferencia: 'REF001',
      ...overrides,
    });

  describe('toResponseDto', () => {
    it('mapea correctamente un producto a DTO de respuesta', () => {
      const producto = crearProducto();

      const dto = ProductoDtoMapper.toResponseDto(producto);

      expect(dto.denominacion).toBe('Aceite Genérica 1 Litro');
      expect(dto.codigoProveedor).toBe('CP001');
      expect(dto.codigoBarra).toBe('7890123456789');
      expect(dto.stock).toBe(100);
      expect(dto.costo).toBe(250);
      expect(dto.porcentaje).toBe(20); // margen 0.2 * 100
      expect(dto.destacado).toBe(false);
      expect(dto.envioGratis).toBe(false);
      expect(dto.observacion).toBe('Producto de prueba');
      expect(dto.ubicacion).toBe('A1-B2');
      expect(dto.utilizaStockMinimo).toBe(true);
      expect(dto.stockMinimo).toBe(10);
      expect(dto.utilizaPack).toBe(false);
      expect(dto.cantidadPorPack).toBe(0);
      expect(dto.codigoReferencia).toBe('REF001');
    });

    it('convierte el margen decimal a porcentaje', () => {
      const producto = crearProducto();

      const dto = ProductoDtoMapper.toResponseDto(producto);

      expect(dto.porcentaje).toBe(20);
    });

    it('calcula correctamente el precio a partir de costo y margen', () => {
      const producto = crearProducto();

      const dto = ProductoDtoMapper.toResponseDto(producto);

      expect(dto.precio).toBe(300); // 250 * (1 + 0.2)
    });

    it('mapea las referencias de linea, marca y presentacion', () => {
      const producto = crearProducto();

      const dto = ProductoDtoMapper.toResponseDto(producto);

      expect(dto.linea).toBeDefined();
      expect(dto.linea.denominacion).toBe('Aceites');
      expect(dto.marca).toBeDefined();
      expect(dto.marca.denominacion).toBe('Genérica');
      expect(dto.presentacion).toBeDefined();
      expect(dto.presentacion!.denominacion).toBe('1 Litro');
    });

    it('maneja presentacion nula correctamente', () => {
      const producto = crearProducto({ presentacion: null, denominacion: 'Producto Sin Presentación' });

      const dto = ProductoDtoMapper.toResponseDto(producto);

      expect(dto.presentacion).toBeNull();
    });

    it('convierte valores nulos a strings vacíos', () => {
      const producto = crearProducto({
        codigoBarra: null,
        codigoProveedor: null,
        observacion: null,
        ubicacion: null,
        codigoReferencia: null,
      });

      const dto = ProductoDtoMapper.toResponseDto(producto);

      expect(dto.codigoBarra).toBe('');
      expect(dto.codigoProveedor).toBe('');
      expect(dto.observacion).toBe('');
      expect(dto.ubicacion).toBe('');
      expect(dto.codigoReferencia).toBe('');
    });

    it('maneja ID nulo asignando 0', () => {
      const producto = crearProducto();

      const dto = ProductoDtoMapper.toResponseDto(producto);

      expect(dto.id).toBe(0);
    });

    it('preserva los flags booleanos', () => {
      const producto = crearProducto({
        destacado: true,
        envioGratis: true,
        utilizaPack: true,
        cantidadPorPack: 6,
      });

      const dto = ProductoDtoMapper.toResponseDto(producto);

      expect(dto.destacado).toBe(true);
      expect(dto.envioGratis).toBe(true);
      expect(dto.utilizaPack).toBe(true);
      expect(dto.cantidadPorPack).toBe(6);
    });
  });

  describe('createDtoToDomain', () => {
    const crearCreateDto = (overrides: Partial<CreateProductoDto> = {}): CreateProductoDto =>
      Object.assign(new CreateProductoDto(), {
        denominacion: 'producto test',
        lineaId: 1,
        marcaId: 1,
        usuarioCreatedId: 1,
        utilizaStockMinimo: false,
        utilizaPack: false,
        ...overrides,
      });

    it('crea un producto de dominio a partir de CreateDto', () => {
      const dto = crearCreateDto({ costo: 100, porcentaje: 25, stock: 50 });
      const linea = crearLinea();
      const marca = crearMarca();
      const presentacion = crearPresentacion();
      const usuario = crearUsuario();

      const producto = ProductoDtoMapper.createDtoToDomain(
        dto,
        linea,
        marca,
        presentacion,
        usuario,
      );

      expect(producto).toBeDefined();
      expect(producto.getDenominacion()).toBe('producto test');
      expect(producto.getCosto()).toBe(100);
      expect(producto.getMargen()).toBe(0.25); // 25 / 100
      expect(producto.getStock()).toBe(50);
    });

    it('convierte porcentaje a margen decimal', () => {
      const dto = crearCreateDto({ porcentaje: 30 });
      const producto = ProductoDtoMapper.createDtoToDomain(
        dto,
        crearLinea(),
        crearMarca(),
        crearPresentacion(),
        crearUsuario(),
      );

      expect(producto.getMargen()).toBe(0.3);
    });

    it('maneja valores por defecto cuando faltan opcionales', () => {
      const dto = crearCreateDto();
      const producto = ProductoDtoMapper.createDtoToDomain(
        dto,
        crearLinea(),
        crearMarca(),
        null,
        crearUsuario(),
      );

      expect(producto.getStock()).toBe(0);
      expect(producto.getCosto()).toBe(0);
      expect(producto.isDestacado()).toBe(false);
      expect(producto.hasEnvioGratis()).toBe(false);
    });

    it('asigna las entidades relacionadas correctamente', () => {
      const dto = crearCreateDto();
      const linea = crearLinea();
      const marca = crearMarca();
      const presentacion = crearPresentacion();

      const producto = ProductoDtoMapper.createDtoToDomain(
        dto,
        linea,
        marca,
        presentacion,
        crearUsuario(),
      );

      expect(producto.getLinea()).toBe(linea);
      expect(producto.getMarca()).toBe(marca);
      expect(producto.getPresentacion()).toBe(presentacion);
    });

    it('maneja presentacion nula correctamente', () => {
      const dto = crearCreateDto();
      const producto = ProductoDtoMapper.createDtoToDomain(
        dto,
        crearLinea(),
        crearMarca(),
        null,
        crearUsuario(),
      );

      expect(producto.getPresentacion()).toBeNull();
    });
  });

  describe('updateDtoToDomain', () => {
    const crearUpdateDto = (overrides: Partial<UpdateProductoDto> = {}): UpdateProductoDto =>
      Object.assign(new UpdateProductoDto(), {
        usuarioUpdatedId: 1,
        ...overrides,
      });

    it('actualiza un producto existente con UpdateDto', () => {
      const productoActual = crearProducto();
      const dto = crearUpdateDto({
        denominacion: 'denominacion actualizada',
        stock: 200,
        costo: 300,
      });

      const productoActualizado = ProductoDtoMapper.updateDtoToDomain(
        dto,
        productoActual,
        crearLinea(),
        crearMarca(),
        crearPresentacion(),
        crearUsuario(),
      );

      expect(productoActualizado.getDenominacion()).toBe('denominacion actualizada');
      expect(productoActualizado.getStock()).toBe(200);
      expect(productoActualizado.getCosto()).toBe(300);
    });

    it('preserva valores no actualizados cuando son undefined', () => {
      const productoActual = crearProducto();
      const stockOriginal = productoActual.getStock();
      const costoOriginal = productoActual.getCosto();

      const dto = crearUpdateDto({ denominacion: 'nueva denominacion' });

      const productoActualizado = ProductoDtoMapper.updateDtoToDomain(
        dto,
        productoActual,
        crearLinea(),
        crearMarca(),
        crearPresentacion(),
        crearUsuario(),
      );

      expect(productoActualizado.getStock()).toBe(stockOriginal);
      expect(productoActualizado.getCosto()).toBe(costoOriginal);
    });

    it('convierte porcentaje a margen decimal al actualizar', () => {
      const productoActual = crearProducto();
      const dto = crearUpdateDto({ porcentaje: 35 });

      const productoActualizado = ProductoDtoMapper.updateDtoToDomain(
        dto,
        productoActual,
        crearLinea(),
        crearMarca(),
        crearPresentacion(),
        crearUsuario(),
      );

      expect(productoActualizado.getMargen()).toBe(0.35);
    });

    it('actualiza las entidades relacionadas', () => {
      const productoActual = crearProducto();
      const nuevaLinea = Linea.create({
        superlineaId: 2,
        denominacion: 'Lubricantes',
        observacion: null,
        utilizaStockMinimo: false,
        stockMinimo: 0,
        usuarioCreatedId: 1,
      });
      const dto = crearUpdateDto();

      const productoActualizado = ProductoDtoMapper.updateDtoToDomain(
        dto,
        productoActual,
        nuevaLinea,
        crearMarca(),
        crearPresentacion(),
        crearUsuario(),
      );

      expect(productoActualizado.getLinea().getDenominacion()).toBe('Lubricantes');
    });

    it('retorna la misma instancia actualizada', () => {
      const productoActual = crearProducto();
      const dto = crearUpdateDto({ stock: 150 });

      const productoActualizado = ProductoDtoMapper.updateDtoToDomain(
        dto,
        productoActual,
        crearLinea(),
        crearMarca(),
        crearPresentacion(),
        crearUsuario(),
      );

      expect(productoActualizado).toBe(productoActual);
    });
  });
});
