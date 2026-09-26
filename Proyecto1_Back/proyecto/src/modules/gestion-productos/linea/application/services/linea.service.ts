import { Injectable } from '@nestjs/common';
import { CreateLineaDto } from '../dto/create-linea.dto';
import { UpdateLineaDto } from '../dto/update-linea.dto';
import { LineaDto } from '../dto/linea.dto';
import { Linea } from '../../domain/entities/linea.entity';
import { CreateLineaUseCase } from '../use-cases/create-linea.use-case';
import { UpdateLineaUseCase } from '../use-cases/update-linea.use-case';
import { FindLineaUseCase } from '../use-cases/find-linea.use-case';
import { FindDtoByIdLineaUseCase } from '../use-cases/find-dto-by-id-linea.use-case';
import { FindEntityByIdLineaUseCase } from '../use-cases/find-entity-by-id-linea.use-case';
import { FindByIdConAuditoriaLineaUseCase } from '../use-cases/find-by-id-auditoria-linea.use-case';
import { RemoveLineaUseCase } from '../use-cases/remove-linea.use-case';

@Injectable()
export class LineaService {
  constructor(
    private readonly createLineaUseCase: CreateLineaUseCase,
    private readonly updateLineaUseCase: UpdateLineaUseCase,
    private readonly findLineaUseCase: FindLineaUseCase,
    private readonly findDtoByIdLineaUseCase: FindDtoByIdLineaUseCase,
    private readonly findEntityByIdLineaUseCase: FindEntityByIdLineaUseCase,
    private readonly findByIdConAuditoriaLineaUseCase: FindByIdConAuditoriaLineaUseCase,
    private readonly removeLineaUseCase: RemoveLineaUseCase
  ) {}

  async create(dto: CreateLineaDto) {
    return this.createLineaUseCase.execute(dto);
  }

  async update(id: number, dto: UpdateLineaDto) {
    return this.updateLineaUseCase.execute(id, dto);
  }

  async findByDenominacionFiltered(
    denominacion: string,
    skip = 0,
    take = 10,
    incluirEliminados: boolean = false,
  ): Promise<{ data: LineaDto[]; total: number }> {
    return this.findLineaUseCase.findByDenominacionFiltered(denominacion, skip, take, incluirEliminados);
  }

  async findAllFor(denominacion: string): Promise<{ data: LineaDto[]; total: number }> {
    return this.findLineaUseCase.findAllFor(denominacion);
  }

  async findByIdConAuditoria(id: number) {
    return this.findByIdConAuditoriaLineaUseCase.execute(id);
  }

  async findDtoById(id: number) {
    return this.findDtoByIdLineaUseCase.execute(id);
  }

  async findEntityById(id: number) {
    return this.findEntityByIdLineaUseCase.execute(id);
  }

  async remove(id: number, usuarioId: number) {
    return this.removeLineaUseCase.execute(id, usuarioId);
  }

  async findAllListado(): Promise<Linea[]> {
    return this.findLineaUseCase.findAllListado();
  }
}
