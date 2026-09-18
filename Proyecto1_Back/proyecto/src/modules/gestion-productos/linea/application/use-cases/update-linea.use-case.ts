import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ensureNotSistemaEntity } from 'src/modules/common/utils/atrituto-sistema';
import { MessageFrontUtils } from 'src/modules/common/utils/message/message-front.util';
import { ILineaRepository, LINEA_REPOSITORY_TOKEN } from '../../domain/interfaces/linea.repository.interface';
import { UpdateLineaDto } from '../dto/update-linea.dto';
import { LineaUniquenessValidator } from '../../infraestructure/validators/linea-uniqueness.validator';

@Injectable()
export class UpdateLineaUseCase {
  private readonly ENTITY_NAME = 'Linea';
  private readonly logger = new Logger(UpdateLineaUseCase.name);

  constructor(
    @Inject(LINEA_REPOSITORY_TOKEN)
    private readonly repository: ILineaRepository,
    private readonly uniquenessValidator: LineaUniquenessValidator,
  ) {}

  async execute(id: number, dto: UpdateLineaDto) {
    this.logger.log(`Actualizando  ${this.ENTITY_NAME} con ID: ${id}`);

    const linea = await this.repository.findOne(id);
    if (!linea) {
      throw new NotFoundException(`${this.ENTITY_NAME} con ID ${id} no encontrado.`);
    }
    ensureNotSistemaEntity(linea.getSistema(), 'Linea');

    if (dto.denominacion) {
      await this.uniquenessValidator.validarDenominacionUnica(dto.denominacion, id);
    }

    linea.actualizarDatos({
      denominacion: dto.denominacion ?? linea.getDenominacion(),
      observacion: dto.observacion ?? linea.getObservacion(),
      utilizaStockMinimo: dto.utilizaStockMinimo,
      stockMinimo: dto.stockMinimo ?? linea.getStockMinimo(),
      usuarioUpdatedId: dto.usuarioUpdatedId,
    });

    const entity = await this.repository.update(id, linea);
    return MessageFrontUtils.createSimple(
      `${this.ENTITY_NAME}`,
      entity.getDenominacion(),
      'editada',
    );
  }
}
