import {
    Inject,
    Injectable,
    Logger,
} from '@nestjs/common';
import { MessageFrontUtils } from 'src/modules/common/utils/message/message-front.util';
import { IProductoRepository, PRODUCTO_REPOSITORY_TOKEN } from '../../domain/repositories/producto.repository.interface';
import { CreateProductoDto } from '../dto/create-producto.dto';
import { ProductoIntrinsicValidationService } from '../../domain/services/producto-intrinsic-validation.service';
import { ProductoValidationService } from '../../domain/services/producto-validation.service';
import { ProductoRelatedEntitiesValidator } from '../../infraestructure/validators/producto-related-entities.validator';
import { ProductoUniquenessValidator } from '../../infraestructure/validators/producto-uniqueness.validator';
import { UsuarioValidator } from 'src/modules/common/utils/validation/usuario-validator';
import { ProductoDtoMapper } from '../mappers/producto-dto.mapper';

@Injectable()
export class CreateProductoUseCase {
    private readonly ENTITY_NAME = 'Producto';
    private readonly logger = new Logger(CreateProductoUseCase.name);

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

    async execute(dto: CreateProductoDto) {
        this.logger.log(`Creando un nuevo ${this.ENTITY_NAME} con denominación: ${dto.denominacion} a: ${dto.denominacion}`);

        // Orquestar todas las validaciones
        const { marca, linea, presentacion, usuario } = await this.validarYPrepararCreacion(dto);

        const nuevoProducto = ProductoDtoMapper.createDtoToDomain(
            dto,
            linea,
            marca,
            presentacion,
            usuario,
        );

        const entity = await this.repository.create(nuevoProducto);

        return MessageFrontUtils.createSimple(
            `${this.ENTITY_NAME}`,
            entity.getDenominacion(),
            'creada',
        );
    }

    /**
     * Orquesta todas las validaciones necesarias para crear un producto
     * @private
    */
    private async validarYPrepararCreacion(dto: CreateProductoDto) {
        // Validar datos  (Domain - sin DB)
        this.intrinsicValidationService.validarDatosBasicos({
            denominacion: dto.denominacion,
            marcaId: dto.marcaId,
            lineaId: dto.lineaId,
        });

        // Validar unicidad (Infrastructure - DB)
        if (dto.denominacion) {
            await this.uniquenessValidator.validarDenominacionUnica(dto.denominacion);
        }

        if (dto.codigoProveedor) {
            await this.uniquenessValidator.validarCodigoProveedorUnico(
                dto.codigoProveedor,
                0,
            );
        }
        // 3 Validar entidades relacionadas existen (Infrastructure - DB)
        const { marca, linea, presentacion } =
            await this.relatedEntitiesValidator.validarYObtenerEntidadesRelacionadas(
                dto.marcaId,
                dto.lineaId,
                dto.presentacionId
            );

        //  Validar reglas de negocio sobre entidades (Domain)
        this.validationService.validarEntidadesRelacionadas(
            marca,
            linea
        );


        //  Validar usuario existe (Infrastructure)
        const usuario = await this.usuarioValidator.validarUsuarioExiste(
            dto.usuarioCreatedId,
        );

        return { marca, linea, presentacion, usuario };
    }
}