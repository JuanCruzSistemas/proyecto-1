import { Test, TestingModule } from '@nestjs/testing';
import { FindPresentacionUseCase } from './find-presentacion.use-case';
import { IPresentacionRepository, PRESENTACION_REPOSITORY_TOKEN } from '../../domain/repositories/presentacion.repository.interface';
import { Presentacion } from '../../domain/entities/presentacion.entity';

describe('FindPresentacionUseCase', () => {
  let useCase: FindPresentacionUseCase;
  let repository: jest.Mocked<IPresentacionRepository>;

  const crearPresentacion = (id: number, denominacion: string) =>
    Presentacion.reconstitute({
      id,
      denominacion,
      observacion: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      usuarioCreatedId: 1,
      usuarioUpdatedId: null,
      usuarioDeletedId: null,
    });

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      findOne: jest.fn(),
      findByDenominacion: jest.fn(),
      findByDenominacionWith: jest.fn(),
      findAllFor: jest.fn(),
      findAllListado: jest.fn(),
      findBy: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindPresentacionUseCase,
        { provide: PRESENTACION_REPOSITORY_TOKEN, useValue: repository },
      ],
    }).compile();

    useCase = module.get(FindPresentacionUseCase);
  });

  it('findAllFor() mapea las entidades del repositorio a PresentacionDto', async () => {
    repository.findAllFor.mockResolvedValue([crearPresentacion(1, 'caja x 12')]);

    const resultado = await useCase.findAllFor('caja');

    expect(resultado.data).toEqual([
      { id: 1, denominacion: 'caja x 12', observacion: '', deletedAt: null },
    ]);
  });

  it('findAllListado() delega directo en el repositorio', async () => {
    const listado = [crearPresentacion(1, 'caja x 12')];
    repository.findAllListado.mockResolvedValue(listado);

    const resultado = await useCase.findAllListado();

    expect(resultado).toBe(listado);
  });

  it('findBy() pagina y mapea a PresentacionDto', async () => {
    repository.findBy.mockResolvedValue({
      data: [crearPresentacion(1, 'caja x 12')],
      total: 1,
    });

    const resultado = await useCase.findBy('caja', 0, 10, false);

    expect(repository.findBy).toHaveBeenCalledWith('caja', 0, 10, false);
    expect(resultado.data).toHaveLength(1);
    expect(resultado.total).toBe(1);
  });
});
