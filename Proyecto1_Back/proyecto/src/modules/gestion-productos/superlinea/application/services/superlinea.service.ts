import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ISuperlineaRepository, SUPERLINEA_REPOSITORY } from '../../domain/interfaces/superlinea.repository.interface';
import { CreateSuperlineaUseCase } from '../use-cases/create-superlinea.use-case';
import { UpdateSuperlineaUseCase } from '../use-cases/update-superlinea.use-case';
import { RemoveSuperlineaUseCase } from '../use-cases/remove-superlinea.use-case';
import { SuperlineaDtoMapper } from '../mappers/superlinea-dto.mapper';
import { SaveSuperlineaDto } from '../dto/superlinea.dto';

@Injectable()
export class SuperlineaService {
  constructor(
    @Inject(SUPERLINEA_REPOSITORY) private readonly repository: ISuperlineaRepository,
    private readonly createUseCase: CreateSuperlineaUseCase,
    private readonly updateUseCase: UpdateSuperlineaUseCase,
    private readonly removeUseCase: RemoveSuperlineaUseCase,
  ) {}

  async list() {
    return (await this.repository.listActive()).map(SuperlineaDtoMapper.toDto);
  }

  async findOne(id: number) {
    const entity = await this.repository.findActive(id);
    if (!entity) throw new NotFoundException('SuperLínea no encontrada.');
    return SuperlineaDtoMapper.toDto(entity);
  }

  async assertActive(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('Debe seleccionar una SuperLínea para la línea');
    }
    if (!await this.repository.findActive(id)) {
      throw new BadRequestException('Debe seleccionar una SuperLínea válida y activa.');
    }
  }

  create(dto: SaveSuperlineaDto, usuarioId: number) { return this.createUseCase.execute(dto, usuarioId); }
  update(id: number, dto: SaveSuperlineaDto, usuarioId: number) { return this.updateUseCase.execute(id, dto, usuarioId); }
  remove(id: number, usuarioId: number) { return this.removeUseCase.execute(id, usuarioId); }
}
