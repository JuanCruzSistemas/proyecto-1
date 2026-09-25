import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IPresentacionRepository, PRESENTACION_REPOSITORY_TOKEN } from '../../domain/repositories/presentacion.repository.interface';
import { PresentacionDtoMapper } from '../mappers/presentacion-dto.mapper';

@Injectable()
export class FindDtoByIdPresentacionUseCase {
  private readonly ENTITY_NAME = 'Presentación';

  constructor(
    @Inject(PRESENTACION_REPOSITORY_TOKEN)
    private readonly repository: IPresentacionRepository
  ) {}

  async execute(id: number) {
    const entity = await this.repository.findOne(id);
    if (!entity) {
      throw new NotFoundException(`${this.ENTITY_NAME} con ID ${id} no encontrada.`);
    }

    return PresentacionDtoMapper.toResponseDto(entity);
  }
}
