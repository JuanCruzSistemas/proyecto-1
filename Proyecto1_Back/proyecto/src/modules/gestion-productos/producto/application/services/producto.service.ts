import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { IUnitOfWork } from 'src/modules/common/unit-of-work/unit-of-work.interface';
import { Producto } from '../../domain/entities/producto.entity';
import { IProductoRepository, PRODUCTO_REPOSITORY_TOKEN } from '../../domain/repositories/producto.repository-interface';
import { CreateProductoDto } from '../dto/create-producto.dto';
import { GetProductoDto } from '../dto/get-producto.dto';
import { UpdateProductoDto } from '../dto/update-producto.dto';
import { LineaService } from 'src/modules/gestion-productos/linea/application/services/linea.service';
import { MarcaService } from 'src/modules/gestion-productos/marca/application/services/marca.service';
import { PresentacionService } from 'src/modules/gestion-productos/presentacion/application/services/presentacion.service';
import { CreateProductoUseCase } from '../use-cases/create-producto.use-case';
import { UpdateProductoUseCase } from '../use-cases/update-producto.use-case';
import { FindByProductoUseCase } from '../use-cases/find-by-producto.use-case';
import { FindByIdConAuditoria } from '../use-cases/find-by-id-auditoria.use-case';
import { FindDtoByIdUseCase } from '../use-cases/find-dto-by-id.use-case';
import { FindEntityByIdUseCase } from '../use-cases/find-entity-by-id.use-case';
import { RemoveProductoUseCase } from '../use-cases/remove-producto.use-case';
import { FindByDenominacionUseCase } from '../use-cases/find-by-denominiacion.use-case';

@Injectable()
export class ProductoService {
  private readonly logger = new Logger(ProductoService.name);
  constructor(
    private readonly createProductoUseCase: CreateProductoUseCase,
    private readonly updateProductoUseCase: UpdateProductoUseCase,
    private readonly findByProductoUseCase: FindByProductoUseCase,
    private readonly findByIdConAuditoriaUseCase: FindByIdConAuditoria,
    private readonly findDtoByIdUseCase: FindDtoByIdUseCase,
    private readonly findEntityByIdUseCase: FindEntityByIdUseCase,
    private readonly removeProductoUseCase: RemoveProductoUseCase,
    private readonly findByDenominacionUseCase: FindByDenominacionUseCase,
    @Inject(PRODUCTO_REPOSITORY_TOKEN)
    private readonly repository: IProductoRepository,
    private readonly lineaService: LineaService,

    @Inject(forwardRef(() => MarcaService))
    private readonly marcaService: MarcaService,

    @Inject(forwardRef(() => PresentacionService))
    private readonly presentacionService: PresentacionService,
  ) {}

  private readonly ENTITY_NAME = 'Producto';

  async create(dto: CreateProductoDto) {
    return this.createProductoUseCase.execute(dto);
  }

  async update(id: number, dto: UpdateProductoDto) {
    return this.updateProductoUseCase.execute(id, dto);
  }

  async findByRapido(
    codigo: string,
    exacto: boolean,
    skip: number,
    take: number,
  ): Promise<{ data: GetProductoDto[]; total: number }> {
    return this.findByProductoUseCase.findByRapido(codigo, exacto, skip, take);
  }

  async findBy(
    denominacion: string,
    codigoProveedor: string,
    codProveedorExacto: boolean,
    codigoReferencia: string,
    marca_id: number,
    linea_id: number,
    proveedor_id: number,
    conStock: boolean,
    skip: number,
    take: number,
    lineaDenominacion?: string,
    superlineaDenominacion?: string,
  ): Promise<{ data: GetProductoDto[]; total: number }> {
    return this.findByProductoUseCase.findBy(
      denominacion,
      codigoProveedor,
      codProveedorExacto,
      codigoReferencia,
      marca_id,
      linea_id,
      proveedor_id,
      conStock,
      skip,
      take,
      lineaDenominacion,
      superlineaDenominacion,
    );
  }

  async buscarMarcaDesdeProducto(id: number) {
    return this.marcaService.findEntityById(id);
  }

  async buscarLineaDesdeProducto(id: number) {
    return this.lineaService.findEntityById(id);
  }

  async findByIdConAuditoria(id: number) {
    return this.findByIdConAuditoriaUseCase.execute(id);
  }

  async findDtoById(id: number) {
    return this.findDtoByIdUseCase.execute(id);
  }

  async findEntityById(id: number) {
    return this.findEntityByIdUseCase.execute(id);
  }

  async remove(id: number, usuarioId: number) {
    return this.removeProductoUseCase.execute(id, usuarioId);
  }


  async findAllForLineas(denominacion: string) {
    return this.lineaService.findAllFor(denominacion);
  }

  async findAllForMarcas(denominacion: string) {
    return this.marcaService.findAllFor(denominacion);
  }

  async findAllForPresentaciones(denominacion: string) {
    return this.presentacionService.findAllFor(denominacion);
  }

  async findByDenominacionCodigoProveedorFiltered(
    denominacion: string,
    skip = 0,
    take = 10,
  ): Promise<{ data: GetProductoDto[]; total: number }> {
    return this.findByDenominacionUseCase.execute(denominacion, skip, take);
  }

  async existsProductosActivosByMarca(marcaId: number): Promise<boolean> {
    return this.repository.existsProductosActivosByMarca(marcaId);
  }
  async existsProductosActivosByLinea(lineaId: number): Promise<boolean> {
    return this.repository.existsProductosActivosByLinea(lineaId);
  }


  async findByIds(ids: number[]): Promise<Producto[]> {
    return this.repository.findByIds(ids);
  }

  async incrementarStock(
    uow: IUnitOfWork,
    productoId: number,
    cantidad: number,
    origen?: string,
  ): Promise<number> {
    return this.ajustarStockInterno(uow, productoId, cantidad, origen);
  }

  async decrementarStock(
    uow: IUnitOfWork,
    productoId: number,
    cantidad: number,
    origen?: string,
  ): Promise<number> {
    return this.ajustarStockInterno(uow, productoId, -cantidad, origen);
  }

  private async ajustarStockInterno(
    uow: IUnitOfWork,
    productoId: number,
    delta: number,
    origen?: string,
  ): Promise<number> {
    const producto = await this.repository.findOne(productoId);
    if (!producto) {
      throw new Error(`Producto con ID ${productoId} no encontrado`);
    }

    const stockActual = producto.getStock();
    const nuevoStock = stockActual + delta;

    producto.ajustarStock(delta, origen ?? 'Ajuste de stock');
    await this.repository.updateEntity(uow, producto);

    this.logger.log(`[StockService] ${origen ?? 'Desconocido'} → ${stockActual} → ${nuevoStock}`);

    return nuevoStock;
  }
}
