import { Inject, Injectable } from '@nestjs/common';
import { ISuperlineaRepository, SUPERLINEA_REPOSITORY } from '../../domain/interfaces/superlinea.repository.interface';

@Injectable()
export class RemoveSuperlineaUseCase {
  constructor(@Inject(SUPERLINEA_REPOSITORY) private readonly repository: ISuperlineaRepository) {}
  async execute(id: number, usuarioId: number) {
    await this.repository.removeIfUnused(id, usuarioId);
    return { mensaje: 'SuperLínea dada de baja.' };
  }
}
