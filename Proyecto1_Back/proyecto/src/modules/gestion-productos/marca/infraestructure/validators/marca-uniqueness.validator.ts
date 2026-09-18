import { Injectable, ConflictException, Inject, Logger } from '@nestjs/common';
import { IMarcaRepository, MARCA_REPOSITORY_TOKEN } from '../../domain/interfaces/marca.repository.interface';

@Injectable()
export class MarcaUniquenessValidator {
  private readonly logger = new Logger(MarcaUniquenessValidator.name);

  constructor(
    @Inject(MARCA_REPOSITORY_TOKEN)
    private readonly repository: IMarcaRepository
  ) {}

  async validarDenominacionUnica(denominacion: string, excludeId: number): Promise<void> {
    const exists = await this.repository.findByDenominacionWith(denominacion);
    if (exists && exists.getId() !== excludeId) {
      this.logger.warn(`Marca - Conflicto: denominación ya está en uso: ${denominacion}`);
      throw new ConflictException('Denominación ya en uso.');
    }
  }
}
