import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { MessageFrontUtils } from 'src/modules/common/utils/message/message-front.util';
import { IPresentacionRepository, PRESENTACION_REPOSITORY_TOKEN } from '../../domain/repositories/presentacion.repository.interface';
import { UpdatePresentacionDto } from '../dto/update-presentacion.dto';
import { PresentacionUniquenessValidator } from '../../infraestructure/validators/presentacion-uniqueness.validator';

@Injectable()
export class UpdatePresentacionUseCase {
  private readonly ENTITY_NAME = 'Presentación';
  private readonly logger = new Logger(UpdatePresentacionUseCase.name);

  constructor(
    @Inject(PRESENTACION_REPOSITORY_TOKEN)
    private readonly repository: IPresentacionRepository,
    private readonly uniquenessValidator: PresentacionUniquenessValidator
  ) {}

  async execute(id: number, dto: UpdatePresentacionDto) {
    this.logger.log(`Actualizando ${this.ENTITY_NAME} con ID: ${id}`);

    const presentacion = await this.repository.findOne(id);
    if (!presentacion) {
      throw new NotFoundException(`${this.ENTITY_NAME} con ID ${id} no encontrada.`);
    }

    if (dto.denominacion) {
      await this.uniquenessValidator.validarDenominacionUnica(dto.denominacion, id);
    }

    presentacion.actualizarDatos({
      denominacion: dto.denominacion ?? presentacion.getDenominacion(),
      observacion: dto.observacion ?? presentacion.getObservacion(),
      usuarioUpdatedId: dto.usuarioUpdatedId
    });

    const entity = await this.repository.update(id, presentacion);
    return MessageFrontUtils.createSimple(
      `${this.ENTITY_NAME}`,
      entity.getDenominacion(),
      'editada'
    );
  }
}
