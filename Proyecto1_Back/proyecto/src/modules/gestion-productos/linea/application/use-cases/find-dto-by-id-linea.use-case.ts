import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ILineaRepository, LINEA_REPOSITORY_TOKEN } from '../../domain/interfaces/linea.repository.interface';
import { LineaOrmMapper } from '../../infraestructure/persistence/mappers/linea.mapper';

@Injectable()
export class FindDtoByIdLineaUseCase {
  private readonly ENTITY_NAME = 'Linea';

  constructor(
    @Inject(LINEA_REPOSITORY_TOKEN)
    private readonly repository: ILineaRepository,
  ) {}

  async execute(id: number) {
    const entity = await this.repository.findOne(id);
    if (!entity) {
      throw new NotFoundException(`${this.ENTITY_NAME} con ID ${id} no encontrado.`);
    }
    return LineaOrmMapper.toDto(entity);
  }
}
