import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IProductoRepository, PRODUCTO_REPOSITORY_TOKEN } from '../../domain/interfaces/producto.repository-interface';
import { UpdatePrecioDto } from '../dto/update-precio.dto';
import { UsuarioValidator } from 'src/modules/common/utils/validation/usuario-validator';

@Injectable()
export class UpdatePrecioUseCase {
    private readonly ENTITY_NAME = 'Producto';
    private readonly logger = new Logger(UpdatePrecioUseCase.name);

    constructor(
        @Inject(PRODUCTO_REPOSITORY_TOKEN)
        private readonly repository: IProductoRepository,
        private readonly usuarioValidator: UsuarioValidator,
    ) {}

    async execute(id: number, dto: UpdatePrecioDto): Promise<void> {
        const producto = await this.repository.findOne(id);
        if (!producto) {
            throw new NotFoundException(`${this.ENTITY_NAME} con ID ${id} no encontrado.`);
        }

        const usuario = await this.usuarioValidator.validarUsuarioExiste(dto.usuarioId);

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

        this.logger.log(`Precio actualizado para ${this.ENTITY_NAME} con ID: ${id}`);
    }
}
