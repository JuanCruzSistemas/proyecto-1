import { Inject, Injectable, Logger } from '@nestjs/common';
import { PaginacionUtils } from 'src/modules/common/utils/pagination/paginacion-utils';
import { IPresentacionRepository, PRESENTACION_REPOSITORY_TOKEN } from '../../domain/repositories/presentacion.repository.interface';
import { Presentacion } from '../../domain/entities/presentacion.entity';
import { PresentacionDto } from '../dto/presentacion.dto';
import { PresentacionDtoMapper } from '../mappers/presentacion-dto.mapper';

@Injectable()
export class FindPresentacionUseCase {
  private readonly logger = new Logger(FindPresentacionUseCase.name);

  constructor(
    @Inject(PRESENTACION_REPOSITORY_TOKEN)
    private readonly repository: IPresentacionRepository
  ) {}

  async findAllFor(denominacion: string): Promise<{ data: PresentacionDto[]; total: number }> {
    const result = await this.repository.findAllFor(denominacion);

    const data: PresentacionDto[] = result.map((presentacion) => PresentacionDtoMapper.toResponseDto(presentacion));
    return { data, total: 1 };
  }

  async findAllListado(): Promise<Presentacion[]> {
    return this.repository.findAllListado();
  }

  async findBy(
    denominacion: string,
    skip = 0,
    take = 10,
    incluirEliminados = false
  ): Promise<{ data: PresentacionDto[]; total: number }> {
    this.logger.log(`Buscando o ${denominacion} skip=${skip}, take=${take}`);
    const result = await this.repository.findBy(denominacion, skip, take, incluirEliminados);

    const data: PresentacionDto[] = result.data.map((presentacion) => PresentacionDtoMapper.toResponseDto(presentacion));
    return { data, total: PaginacionUtils.totalItems(result.total) };
  }
}
