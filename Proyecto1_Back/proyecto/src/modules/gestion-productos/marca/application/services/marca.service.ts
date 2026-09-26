import { Injectable } from '@nestjs/common';
import { MarcaDto } from '../dto/marca.dto';
import { UpdateMarcaDto } from '../dto/update-marca.dto';
import { CreateMarcaDto } from '../dto/create-marca.dto';
import { Marca } from '../../domain/entities/marca.entity';
import { CreateMarcaUseCase } from '../use-cases/create-marca.use-case';
import { UpdateMarcaUseCase } from '../use-cases/update-marca.use-case';
import { FindMarcaUseCase } from '../use-cases/find-marca.use-case';
import { FindDtoByIdMarcaUseCase } from '../use-cases/find-dto-by-id-marca.use-case';
import { FindEntityByIdMarcaUseCase } from '../use-cases/find-entity-by-id-marca.use-case';
import { FindByIdConAuditoriaMarcaUseCase } from '../use-cases/find-by-id-auditoria-marca.use-case';
import { RemoveMarcaUseCase } from '../use-cases/remove-marca.use-case';

@Injectable()
export class MarcaService {
  constructor(
    private readonly createMarcaUseCase: CreateMarcaUseCase,
    private readonly updateMarcaUseCase: UpdateMarcaUseCase,
    private readonly findMarcaUseCase: FindMarcaUseCase,
    private readonly findDtoByIdMarcaUseCase: FindDtoByIdMarcaUseCase,
    private readonly findEntityByIdMarcaUseCase: FindEntityByIdMarcaUseCase,
    private readonly findByIdConAuditoriaMarcaUseCase: FindByIdConAuditoriaMarcaUseCase,
    private readonly removeMarcaUseCase: RemoveMarcaUseCase,
  ) {}

  async create(dto: CreateMarcaDto) {
    return this.createMarcaUseCase.execute(dto);
  }

  async update(id: number, dto: UpdateMarcaDto) {
    return this.updateMarcaUseCase.execute(id, dto);
  }

  async findAllFor(denominacion: string): Promise<{ data: MarcaDto[]; total: number }> {
    return this.findMarcaUseCase.findAllFor(denominacion);
  }

  async findAllListado(): Promise<Marca[]> {
    return this.findMarcaUseCase.findAllListado();
  }

  async findAllSinSistemaFor(denominacion: string): Promise<{ data: MarcaDto[]; total: number }> {
    return this.findMarcaUseCase.findAllSinSistemaFor(denominacion);
  }

  async findAllSistemaFor(denominacion: string): Promise<{ data: MarcaDto[]; total: number }> {
    return this.findMarcaUseCase.findAllSistemaFor(denominacion);
  }

  async findBy(
    denominacion: string,
    skip = 0,
    take = 10,
    incluirEliminados = false,
  ): Promise<{ data: MarcaDto[]; total: number }> {
    return this.findMarcaUseCase.findBy(denominacion, skip, take, incluirEliminados);
  }

  async findDtoById(id: number) {
    return this.findDtoByIdMarcaUseCase.execute(id);
  }

  async findEntityById(id: number) {
    return this.findEntityByIdMarcaUseCase.execute(id);
  }

  async remove(id: number, usuarioId: number) {
    return this.removeMarcaUseCase.execute(id, usuarioId);
  }

  async findByIdConAuditoria(id: number) {
    return this.findByIdConAuditoriaMarcaUseCase.execute(id);
  }

  /**
   * TODO: decidir que hacer con esta funcionalidad
   */
  async findByDenominacionFiltered(findByDenominacionFiltered: any) {
    throw new Error('Method not implemented.');
  }
}
