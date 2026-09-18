import { Inject, Injectable, Logger } from '@nestjs/common';
import { PaginacionUtils } from 'src/modules/common/utils/pagination/paginacion-utils';
import { ILineaRepository, LINEA_REPOSITORY_TOKEN } from '../../domain/interfaces/linea.repository.interface';
import { Linea } from '../../domain/entities/linea.entity';
import { LineaDto } from '../dto/linea.dto';
import { LineaOrmMapper } from '../../infraestructure/persistence/mappers/linea.mapper';

@Injectable()
export class FindLineaUseCase {
  private readonly logger = new Logger(FindLineaUseCase.name);

  constructor(
    @Inject(LINEA_REPOSITORY_TOKEN)
    private readonly repository: ILineaRepository
  ) {}

  async findByDenominacionFiltered(
    denominacion: string,
    skip = 0,
    take = 10,
    incluirEliminados: boolean = false,
  ): Promise<{ data: LineaDto[]; total: number }> {
    const result = await this.repository.findByDenominacionFiltered(
      denominacion,
      skip,
      take,
      incluirEliminados
    );
    const data: LineaDto[] = result.data.map((linea) => LineaOrmMapper.toDto(linea));
    return { data, total: PaginacionUtils.totalItems(result.total) };
  }

  async findAllFor(denominacion: string): Promise<{ data: LineaDto[]; total: number }> {
    const result = await this.repository.findAllFor(denominacion);
    const data: LineaDto[] = result.map((linea) => LineaOrmMapper.toDto(linea));
    return { data, total: 1 };
  }

  async findAllListado(): Promise<Linea[]> {
    return this.repository.findAllListado();
  }
}
