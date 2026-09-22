import { Injectable, ConflictException, Inject, Logger } from '@nestjs/common';
import { IPresentacionRepository, PRESENTACION_REPOSITORY_TOKEN } from '../../domain/repositories/presentacion.repository.interface';

@Injectable()
export class PresentacionUniquenessValidator {
  private readonly logger = new Logger(PresentacionUniquenessValidator.name);

  constructor(
    @Inject(PRESENTACION_REPOSITORY_TOKEN)
    private readonly repository: IPresentacionRepository
  ) {}

  async validarDenominacionUnica(denominacion: string, excludeId: number): Promise<void> {
    const exists = await this.repository.findByDenominacionWith(denominacion);
    if (exists && exists.getId() !== excludeId) {
      this.logger.warn(`Presentación - Conflicto: denominación ya está en uso: ${denominacion}`);
      throw new ConflictException('Denominación ya en uso.');
    }
  }
}
