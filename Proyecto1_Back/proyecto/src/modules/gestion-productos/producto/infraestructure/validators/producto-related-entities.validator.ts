import { Injectable, NotFoundException } from '@nestjs/common';
import { MarcaService } from '../../../marca/application/services/marca.service';
import { LineaService } from '../../../linea/application/services/linea.service';
import { FindEntityByIdPresentacionUseCase } from '../../../presentacion/application/use-cases/find-entity-by-id-presentacion.use-case';

@Injectable()
export class ProductoRelatedEntitiesValidator {
  constructor(
    private readonly marcaService: MarcaService,
    private readonly lineaService: LineaService,
    private readonly findEntityByIdPresentacionUseCase: FindEntityByIdPresentacionUseCase

  ) {}

  /**
   * Valida que todas las entidades relacionadas existan en la DB
   * y las retorna para su uso posterior
   */
  async validarYObtenerEntidadesRelacionadas(
    marcaId: number,
    lineaId: number,
    presentacionId?: number
  ) {

      // Sin sublínea
    let [marca, linea] = await Promise.all([
      this.marcaService.findEntityById(marcaId),
      this.lineaService.findEntityById(lineaId),
    ]);

    // Validar que existen
    this.validarEntidadExiste(marca, 'Marca', marcaId);
    this.validarEntidadExiste(linea, 'Línea', lineaId);

    const presentacion = presentacionId
      ? await this.findEntityByIdPresentacionUseCase.execute(presentacionId)
      : null;

    return { marca, linea, presentacion };
  }

  private validarEntidadExiste(
    entidad: any,
    tipo: string,
    id: number,
  ): void {
    if (!entidad) {
      throw new NotFoundException(`${tipo} con ID ${id} no encontrada`);
    }
  }
}