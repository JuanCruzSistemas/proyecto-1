import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { MessageFrontUtils } from 'src/modules/common/utils/message/message-front.util';
import { IProductoRepository, PRODUCTO_REPOSITORY_TOKEN } from '../../domain/interfaces/producto.repository-interface';
import { UpdateProductoDto } from '../dto/update-producto.dto';
import { ProductoIntrinsicValidationService } from '../../domain/services/producto-intrinsic-validation.service';
import { ProductoValidationService } from '../../domain/services/producto-validation.service';
import { ProductoRelatedEntitiesValidator } from '../../infraestructure/validators/producto-related-entities.validator';
import { ProductoUniquenessValidator } from '../../infraestructure/validators/producto-uniqueness.validator';
import { UsuarioValidator } from 'src/modules/common/utils/validation/usuario-validator';
import { ProductoDtoMapper } from '../mappers/producto-dto.mapper';

@Injectable()
export class UpdateProductoUseCase {
    private readonly logger = new Logger(UpdateProductoDto.name);
    private readonly ENTITY_NAME = 'Producto';
    constructor(
        @Inject(PRODUCTO_REPOSITORY_TOKEN)
        private readonly repository: IProductoRepository,
    
        //  Domain Services
        private readonly intrinsicValidationService: ProductoIntrinsicValidationService,
        private readonly validationService: ProductoValidationService,
    
        // Infrastructure Validators
        private readonly relatedEntitiesValidator: ProductoRelatedEntitiesValidator,
        private readonly uniquenessValidator: ProductoUniquenessValidator,
        private readonly usuarioValidator: UsuarioValidator    
      ) {}


    async execute(id: number, dto: UpdateProductoDto) {
        this.logger.log(`Actualizandox  ${this.ENTITY_NAME} con ID: ${id}`);

        const { marca, linea, usuario, productoActual } = await this.validarYPrepararActualizacion(id, dto);

        const productoActualizado = ProductoDtoMapper.updateDtoToDomain(
            dto,
            productoActual,
            linea,
            marca,
            usuario,
        );

        const entity = await this.repository.update(id, productoActualizado);

        return MessageFrontUtils.createSimple(
            `${this.ENTITY_NAME}`,
            entity.getDenominacion(),
            'editada',
        );
    }

    /**
     * Orquesta todas las validaciones necesarias para actualizar un producto
     * @private
    */
    private async validarYPrepararActualizacion(id: number, dto: UpdateProductoDto) {
        // Obtener producto actual
        const productoActual = await this.repository.findOne(id);
        if (!productoActual)
            throw new NotFoundException(`${this.ENTITY_NAME} con ID ${id} no encontrado.`);

        if (
            productoActual.getLinea() == null ||
            productoActual.getMarca() == null
        ) {
            throw new InternalServerErrorException('Producto en estado inválido');
        }

        //  Validar datos intrínsecos
        this.intrinsicValidationService.validarDatosBasicos({
            denominacion: dto.denominacion ?? productoActual.getDenominacion(),
            marcaId: dto.marcaId ?? productoActual.getMarca().getId()!,
            lineaId: dto.lineaId ?? productoActual.getLinea().getId()!,
        });

        // Validar unicidad (excluyendo el ID actual)
        if (dto.denominacion) {
            await this.uniquenessValidator.validarDenominacionUnica(
                dto.denominacion,
                id,
            );
        }

        // Validar entidades relacionadas
        const { marca, linea, } =
            await this.relatedEntitiesValidator.validarYObtenerEntidadesRelacionadas(
                dto.marcaId ?? productoActual.getMarca().getId()!,
                dto.lineaId ?? productoActual.getLinea().getId()!,
            );

        //  Validar reglas de negocio
        this.validationService.validarEntidadesRelacionadas(
            marca,
            linea,
        );

        // 5 Validar usuario
        const usuario = await this.usuarioValidator.validarUsuarioExiste(
            dto.usuarioUpdatedId,
        );

        return { marca, linea, usuario, productoActual };
    }
}