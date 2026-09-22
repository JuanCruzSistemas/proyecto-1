import { Inject, Injectable, Logger } from '@nestjs/common';
import { MessageFrontUtils } from 'src/modules/common/utils/message/message-front.util';
import { ILineaRepository, LINEA_REPOSITORY_TOKEN } from '../../domain/interfaces/linea.repository.interface';
import { Linea } from '../../domain/entities/linea.entity';
import { CreateLineaDto } from '../dto/create-linea.dto';
import { LineaUniquenessValidator } from '../../infraestructure/validators/linea-uniqueness.validator';

@Injectable()
export class CreateLineaUseCase {
  private readonly ENTITY_NAME = 'Linea';
  private readonly logger = new Logger(CreateLineaUseCase.name);

  constructor(
    @Inject(LINEA_REPOSITORY_TOKEN)
    private readonly repository: ILineaRepository,
    private readonly uniquenessValidator: LineaUniquenessValidator
  ) {}

  async execute(dto: CreateLineaDto) {
    this.logger.log(`Creando un nuevo ${this.ENTITY_NAME} con denominación: ${dto.denominacion} a: ${dto.denominacion}`,);
    await this.uniquenessValidator.validarDenominacionUnica(dto.denominacion, 0);

    const nuevaLinea = Linea.create({
      denominacion: dto.denominacion,
      observacion: dto.observacion ?? null,
      utilizaStockMinimo: dto.utilizaStockMinimo,
      stockMinimo: dto.stockMinimo ?? 0,
      usuarioCreatedId: dto.usuarioCreatedId
    });

    const entity = await this.repository.create(nuevaLinea);

    return MessageFrontUtils.createSimple(
      `${this.ENTITY_NAME}`,
      entity.getDenominacion(),
      'creada'
    );
  }
}
