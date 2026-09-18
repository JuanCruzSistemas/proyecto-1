import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ensureNotSistemaEntity } from 'src/modules/common/utils/atrituto-sistema';
import { MessageFrontUtils } from 'src/modules/common/utils/message/message-front.util';
import { IMarcaRepository, MARCA_REPOSITORY_TOKEN } from '../../domain/interfaces/marca.repository.interface';
import { UpdateMarcaDto } from '../dto/update-marca.dto';
import { MarcaUniquenessValidator } from '../../infraestructure/validators/marca-uniqueness.validator';

@Injectable()
export class UpdateMarcaUseCase {
  private readonly ENTITY_NAME = 'Marca';
  private readonly logger = new Logger(UpdateMarcaUseCase.name);

  constructor(
    @Inject(MARCA_REPOSITORY_TOKEN)
    private readonly repository: IMarcaRepository,
    private readonly uniquenessValidator: MarcaUniquenessValidator,
  ) {}

  async execute(id: number, dto: UpdateMarcaDto) {
    this.logger.log(`Actualizando  ${this.ENTITY_NAME} con ID: ${id}`);

    const marca = await this.repository.findOne(id);
    if (!marca) {
      throw new NotFoundException(`${this.ENTITY_NAME} con ID ${id} no encontrado.`);
    }
    ensureNotSistemaEntity(marca.getSistema(), 'Marca');

    if (dto.denominacion) {
      await this.uniquenessValidator.validarDenominacionUnica(dto.denominacion, id);
    }

    marca.actualizarDatos({
      denominacion: dto.denominacion ?? marca.getDenominacion(),
      observacion: dto.observacion ?? marca.getObservacion(),
      usuarioUpdatedId: dto.usuarioUpdatedId,
    });

    const entity = await this.repository.update(id, marca);
    return MessageFrontUtils.createSimple(
      `${this.ENTITY_NAME}`,
      entity.getDenominacion(),
      'editada',
    );
  }
}
