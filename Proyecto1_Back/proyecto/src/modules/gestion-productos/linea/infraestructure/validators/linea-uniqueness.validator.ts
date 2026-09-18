import { Injectable, ConflictException, Inject, Logger } from '@nestjs/common';
import { ILineaRepository, LINEA_REPOSITORY_TOKEN } from '../../domain/interfaces/linea.repository.interface';

@Injectable()
export class LineaUniquenessValidator {
  private readonly logger = new Logger(LineaUniquenessValidator.name);

  constructor(
    @Inject(LINEA_REPOSITORY_TOKEN)
    private readonly repository: ILineaRepository,
  ) {}

  async validarDenominacionUnica(denominacion: string, excludeId: number): Promise<void> {
    const denominacionNormalizada = denominacion.trim().toUpperCase();
    const exists = await this.repository.findByDenominacionWith(denominacionNormalizada);

    if (exists && exists.getId() !== excludeId) {
      this.logger.warn(
        `Conflicto: denominación ya está en uso: ${denominacionNormalizada} (ID existente: ${exists.getId()})`,
      );
      throw new ConflictException('Denominación ya en uso o esta eliminada.');
    }
  }
}
