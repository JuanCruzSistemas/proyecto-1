import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IProductoRepository, PRODUCTO_REPOSITORY_TOKEN } from '../../domain/interfaces/producto.repository-interface';
import { UpdatePrecioDto } from '../dto/update-precio.dto';
import { UsuarioValidator } from 'src/modules/common/utils/validation/usuario-validator';
import { BadRequestException} from '@nestjs/common';
import {IHistorialPrecioRepository,HISTORIAL_PRECIO_REPOSITORY_TOKEN,} from '../../domain/interfaces/historial-precio.repository-interface';
import { HistorialPrecioFactory } from '../../domain/factories/historial-precio.factory';

@Injectable()
export class UpdatePrecioUseCase {
    private readonly ENTITY_NAME = 'Producto';
    private readonly logger = new Logger(UpdatePrecioUseCase.name);

    constructor(
        @Inject(PRODUCTO_REPOSITORY_TOKEN)
        private readonly repository: IProductoRepository,
        @Inject(HISTORIAL_PRECIO_REPOSITORY_TOKEN)
        private readonly historialPrecioRepository: IHistorialPrecioRepository,
        private readonly usuarioValidator: UsuarioValidator,
    ) {}

    async execute(id: number, dto: UpdatePrecioDto): Promise<void> {
        const producto = await this.repository.findOne(id);
        if (!producto) {
            throw new NotFoundException(`${this.ENTITY_NAME} con ID ${id} no encontrado.`);
        }
        if (dto.costo <= 0) {
            throw new BadRequestException('El costo debe ser mayor a 0.');
        }
        const usuario = await this.usuarioValidator.validarUsuarioExiste(dto.usuarioId);
        const precioAnterior = producto.getPrecio();
        const costoAnterior = producto.getCosto();
        const margenAnterior = producto.getMargen();
        producto.actualizarDatos({
            denominacion: producto.getDenominacion(),
            codigoBarra: producto.getCodigoBarra(),
            codigoProveedor: producto.getCodigoProveedor(),
            stock: producto.getStock(),
            utilizaStockMinimo: producto.getUtilizaStockMinimo(),
            utilizaStockMinimoPorEmpresa: producto.getUtilizaStockMinimoPorEmpresa(),
            stockMinimo: producto.getStockMinimo(),
            costo: dto.costo,
            margen: dto.porcentaje / 100,
            destacado: producto.isDestacado(),
            envioGratis: producto.hasEnvioGratis(),
            observacion: producto.getObservacion(),
            linea: producto.getLinea(),
            marca: producto.getMarca(),
            utilizaPack: producto.getUtilizaPack(),
            cantidadPorPack: producto.getCantidadPorPack(),
            imagen: producto.getImagen(),
            ubicacion: producto.getUbicacion(),
            codigoReferencia: producto.getCodigoReferencia(),
            usuarioUpdated: usuario,
        });

        await this.repository.update(id, producto);
        const historial = HistorialPrecioFactory.create({
            precioAnterior,
            precioNuevo: producto.getPrecio(),
            costoAnterior,
            costoNuevo: producto.getCosto(),
            margenAnterior,
            margenNuevo: producto.getMargen(),
            motivo: 'Actualización de precio',
            producto,
            usuario,
        });
        await this.historialPrecioRepository.save(historial);

        this.logger.log(`Precio actualizado para ${this.ENTITY_NAME} con ID: ${id}`);
    }
}
