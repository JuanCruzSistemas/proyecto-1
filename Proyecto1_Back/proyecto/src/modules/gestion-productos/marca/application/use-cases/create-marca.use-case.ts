import { Inject, Injectable, Logger } from '@nestjs/common';
import { MessageFrontUtils } from 'src/modules/common/utils/message/message-front.util';
import { IMarcaRepository, MARCA_REPOSITORY_TOKEN } from '../../domain/interfaces/marca.repository.interface';
import { Marca } from '../../domain/entities/marca.entity';
import { CreateMarcaDto } from '../dto/create-marca.dto';
import { MarcaUniquenessValidator } from '../../infraestructure/validators/marca-uniqueness.validator';

@Injectable()
export class CreateMarcaUseCase {
  private readonly ENTITY_NAME = 'Marca';
  private readonly logger = new Logger(CreateMarcaUseCase.name);

  constructor(
    @Inject(MARCA_REPOSITORY_TOKEN)
    private readonly repository: IMarcaRepository,
    private readonly uniquenessValidator: MarcaUniquenessValidator,
  ) {}

  async execute(dto: CreateMarcaDto) {
    this.logger.log(
      `Creando un nuevo ${this.ENTITY_NAME} con denominación: ${dto.denominacion} a: ${dto.denominacion}`,
    );
    await this.uniquenessValidator.validarDenominacionUnica(dto.denominacion, 0);

    const nuevaMarca = Marca.create({
      denominacion: dto.denominacion,
      observacion: dto.observacion ?? null,
      usuarioCreatedId: dto.usuarioCreatedId,
    });
    const entity = await this.repository.create(nuevaMarca);

    return MessageFrontUtils.createSimple(
      `${this.ENTITY_NAME}`,
      entity.getDenominacion(),
      'creada',
    );
  }
}
