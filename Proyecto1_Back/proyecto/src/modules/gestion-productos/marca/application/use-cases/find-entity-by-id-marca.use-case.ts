import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IMarcaRepository, MARCA_REPOSITORY_TOKEN } from '../../domain/interfaces/marca.repository.interface';

@Injectable()
export class FindEntityByIdMarcaUseCase {
  private readonly ENTITY_NAME = 'Marca';

  constructor(
    @Inject(MARCA_REPOSITORY_TOKEN)
    private readonly repository: IMarcaRepository
  ) {}

  async execute(id: number) {
    const entity = await this.repository.findOne(id);
    if (!entity) {
      throw new NotFoundException(`${this.ENTITY_NAME} con ID ${id} no encontrado.`);
    }

    return entity;
  }
}
