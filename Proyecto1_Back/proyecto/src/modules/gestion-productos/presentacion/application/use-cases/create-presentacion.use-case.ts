import { Inject, Injectable, Logger } from '@nestjs/common';
import { MessageFrontUtils } from 'src/modules/common/utils/message/message-front.util';
import { IPresentacionRepository, PRESENTACION_REPOSITORY_TOKEN } from '../../domain/repositories/presentacion.repository.interface';
import { Presentacion } from '../../domain/entities/presentacion.entity';
import { CreatePresentacionDto } from '../dto/create-presentacion.dto';
import { PresentacionUniquenessValidator } from '../../infraestructure/validators/presentacion-uniqueness.validator';

@Injectable()
export class CreatePresentacionUseCase {
  private readonly ENTITY_NAME = 'Presentación';
  private readonly logger = new Logger(CreatePresentacionUseCase.name);

  constructor(
    @Inject(PRESENTACION_REPOSITORY_TOKEN)
    private readonly repository: IPresentacionRepository,
    private readonly uniquenessValidator: PresentacionUniquenessValidator
  ) {}

  async execute(dto: CreatePresentacionDto) {
    this.logger.log(`Creando un nuevo ${this.ENTITY_NAME} con denominación: ${dto.denominacion}`);
    await this.uniquenessValidator.validarDenominacionUnica(dto.denominacion, 0);

    const nuevaPresentacion = Presentacion.create({
      denominacion: dto.denominacion,
      observacion: dto.observacion ?? null,
      usuarioCreatedId: dto.usuarioCreatedId
    });
    const entity = await this.repository.create(nuevaPresentacion);

    return MessageFrontUtils.createSimple(
      `${this.ENTITY_NAME}`,
      entity.getDenominacion(),
      'creada'
    );
  }
}
