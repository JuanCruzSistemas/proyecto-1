import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IPresentacionRepository, PRESENTACION_REPOSITORY_TOKEN } from '../../domain/repositories/presentacion.repository.interface';

@Injectable()
export class FindEntityByIdPresentacionUseCase {
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

    return entity;
  }
}
