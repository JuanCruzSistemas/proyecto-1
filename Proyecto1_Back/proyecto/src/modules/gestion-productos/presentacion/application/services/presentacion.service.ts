import { Injectable } from '@nestjs/common';
import { PresentacionDto } from '../dto/presentacion.dto';
import { UpdatePresentacionDto } from '../dto/update-presentacion.dto';
import { CreatePresentacionDto } from '../dto/create-presentacion.dto';
import { Presentacion } from '../../domain/entities/presentacion.entity';
import { CreatePresentacionUseCase } from '../use-cases/create-presentacion.use-case';
import { UpdatePresentacionUseCase } from '../use-cases/update-presentacion.use-case';
import { FindPresentacionUseCase } from '../use-cases/find-presentacion.use-case';
import { FindDtoByIdPresentacionUseCase } from '../use-cases/find-dto-by-id-presentacion.use-case';
import { FindEntityByIdPresentacionUseCase } from '../use-cases/find-entity-by-id-presentacion.use-case';
import { RemovePresentacionUseCase } from '../use-cases/remove-presentacion.use-case';
import { PaginationWithDenominacionDto } from 'src/modules/common/dto/busquedas/pagination-with-denominacion.dto';

@Injectable()
export class PresentacionService {
  constructor(
    private readonly createPresentacionUseCase: CreatePresentacionUseCase,
    private readonly updatePresentacionUseCase: UpdatePresentacionUseCase,
    private readonly findPresentacionUseCase: FindPresentacionUseCase,
    private readonly findDtoByIdPresentacionUseCase: FindDtoByIdPresentacionUseCase,
    private readonly findEntityByIdPresentacionUseCase: FindEntityByIdPresentacionUseCase,
    private readonly removePresentacionUseCase: RemovePresentacionUseCase,
  ) {}

  async create(dto: CreatePresentacionDto) {
    return this.createPresentacionUseCase.execute(dto);
  }

  async update(id: number, dto: UpdatePresentacionDto) {
    return this.updatePresentacionUseCase.execute(id, dto);
  }

  async findAllFor(denominacion: string): Promise<{ data: PresentacionDto[]; total: number }> {
    return this.findPresentacionUseCase.findAllFor(denominacion);
  }

  async findAllListado(): Promise<Presentacion[]> {
    return this.findPresentacionUseCase.findAllListado();
  }

  async findBy(
    paginationDto: PaginationWithDenominacionDto
  ): Promise<{ data: PresentacionDto[]; total: number }> {
    const { denominacion = '', skip, take, incluirEliminados = false } = paginationDto;
    return this.findPresentacionUseCase.findBy(denominacion, skip, take, incluirEliminados);
  }

  async findDtoById(id: number) {
    return this.findDtoByIdPresentacionUseCase.execute(id);
  }

  async findEntityById(id: number) {
    return this.findEntityByIdPresentacionUseCase.execute(id);
  }

  async remove(id: number, usuarioId: number) {
    return this.removePresentacionUseCase.execute(id, usuarioId);
  }
}
