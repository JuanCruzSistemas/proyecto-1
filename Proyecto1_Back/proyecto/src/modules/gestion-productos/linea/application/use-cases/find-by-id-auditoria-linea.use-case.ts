import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ILineaRepository, LINEA_REPOSITORY_TOKEN } from '../../domain/interfaces/linea.repository.interface';

@Injectable()
export class FindByIdConAuditoriaLineaUseCase {
  private readonly ENTITY_NAME = 'Linea';

  constructor(
    @Inject(LINEA_REPOSITORY_TOKEN)
    private readonly repository: ILineaRepository,
  ) {}

  async execute(id: number) {
    const entity = await this.repository.findByIdConAuditoria(id);
    if (!entity) {
      throw new NotFoundException(`${this.ENTITY_NAME} con ID ${id} no encontrado.`);
    }
    return entity;
  }
}
