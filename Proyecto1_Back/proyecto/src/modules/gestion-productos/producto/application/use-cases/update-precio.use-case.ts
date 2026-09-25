import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IProductoRepository, PRODUCTO_REPOSITORY_TOKEN } from '../../domain/repositories/producto.repository.interface';
import { UpdatePrecioDto } from '../dto/update-precio.dto';
import { UsuarioValidator } from 'src/modules/common/utils/validation/usuario-validator';
import {IHistorialPrecioRepository,HISTORIAL_PRECIO_REPOSITORY_TOKEN,} from '../../domain/repositories/historial-precio.repository.interface';
import { HistorialPrecioFactory } from '../../domain/factories/historial-precio.factory';
import { TypeOrmUnitOfWork } from 'src/modules/common/unit-of-work/type-orm-unit-of-works1';

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
        private readonly dataSource: DataSource,
    ) {}

    async execute(id: number, dto: UpdatePrecioDto): Promise<void> {
        const producto = await this.repository.findOne(id);
        if (!producto) {
            throw new NotFoundException(`${this.ENTITY_NAME} con ID ${id} no encontrado.`);
        }
        const usuario = await this.usuarioValidator.validarUsuarioExiste(dto.usuarioId);
        const precioAnterior = producto.getPrecio();
        const costoAnterior = producto.getCosto();
        const margenAnterior = producto.getMargen();
        producto.actualizarDatos({
            denominacion: undefined,
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
            presentacion: producto.getPresentacion(),
            utilizaPack: producto.getUtilizaPack(),
            cantidadPorPack: producto.getCantidadPorPack(),
            imagen: producto.getImagen(),
            ubicacion: producto.getUbicacion(),
            codigoReferencia: producto.getCodigoReferencia(),
            usuarioUpdated: usuario
        });

        const historial = HistorialPrecioFactory.create({
            precioAnterior,
            precioNuevo: producto.getPrecio(),
            costoAnterior,
            costoNuevo: producto.getCosto(),
            margenAnterior,
            margenNuevo: producto.getMargen(),
            motivo: dto.motivo,
            producto,
            usuario,
        });

        // El precio y su historial se guardan en la misma transacción
        const uow = new TypeOrmUnitOfWork(this.dataSource);
        await uow.start();
        try {
            await this.repository.updateEntity(uow, producto);
            await this.historialPrecioRepository.save(historial, uow);
            await uow.commit();
        } catch (error) {
            await uow.rollback();
            throw error;
        } finally {
            await uow.release();
        }

        this.logger.log(`Precio actualizado para ${this.ENTITY_NAME} con ID: ${id}`);
    }
}
