import { Inject, Injectable, Logger } from '@nestjs/common';
import { PaginacionUtils } from 'src/modules/common/utils/pagination/paginacion-utils';
import { IMarcaRepository, MARCA_REPOSITORY_TOKEN } from '../../domain/interfaces/marca.repository.interface';
import { Marca } from '../../domain/entities/marca.entity';
import { MarcaDto } from '../dto/marca.dto';
import { MarcaOrmMapper } from '../../infraestructure/persistence/mappers/marca.mapper';

@Injectable()
export class FindMarcaUseCase {
  private readonly logger = new Logger(FindMarcaUseCase.name);

  constructor(
    @Inject(MARCA_REPOSITORY_TOKEN)
    private readonly repository: IMarcaRepository
  ) {}

  async findAllFor(denominacion: string): Promise<{ data: MarcaDto[]; total: number }> {
    const result = await this.repository.findAllFor(denominacion);

    const data: MarcaDto[] = result.map((marca) => MarcaOrmMapper.toDto(marca));
    return { data, total: 1 };
  }

  async findAllListado(): Promise<Marca[]> {
    return this.repository.findAllListado();
  }

  async findAllSinSistemaFor(denominacion: string): Promise<{ data: MarcaDto[]; total: number }> {
    const result = await this.repository.findAllSinSistemaFor(denominacion);

    const data: MarcaDto[] = result.map((marca) => MarcaOrmMapper.toDto(marca));
    return { data, total: 1 };
  }

  async findAllSistemaFor(denominacion: string): Promise<{ data: MarcaDto[]; total: number }> {
    const result = await this.repository.findAllSistemaFor(denominacion);

    const data: MarcaDto[] = result.map((marca) => MarcaOrmMapper.toDto(marca));
    return { data, total: 1 };
  }

  async findBy(
    denominacion: string,
    skip = 0,
    take = 10,
    incluirEliminados = false
  ): Promise<{ data: MarcaDto[]; total: number }> {
    this.logger.log(`Buscando o ${denominacion}  skip=${skip}, take=${take}`);
    const result = await this.repository.findBy(denominacion, skip, take, incluirEliminados);

    const data: MarcaDto[] = result.data.map((marca) => MarcaOrmMapper.toDto(marca));
    return { data, total: PaginacionUtils.totalItems(result.total) };
  }
}
