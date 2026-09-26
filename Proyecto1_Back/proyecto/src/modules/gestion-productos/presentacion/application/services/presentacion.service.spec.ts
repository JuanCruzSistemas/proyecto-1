import { Test, TestingModule } from '@nestjs/testing';
import { PresentacionService } from './presentacion.service';
import { CreatePresentacionUseCase } from '../use-cases/create-presentacion.use-case';
import { UpdatePresentacionUseCase } from '../use-cases/update-presentacion.use-case';
import { FindPresentacionUseCase } from '../use-cases/find-presentacion.use-case';
import { FindDtoByIdPresentacionUseCase } from '../use-cases/find-dto-by-id-presentacion.use-case';
import { FindEntityByIdPresentacionUseCase } from '../use-cases/find-entity-by-id-presentacion.use-case';
import { RemovePresentacionUseCase } from '../use-cases/remove-presentacion.use-case';

describe('PresentacionService', () => {
  let service: PresentacionService;
  let createUseCase: jest.Mocked<Pick<CreatePresentacionUseCase, 'execute'>>;
  let updateUseCase: jest.Mocked<Pick<UpdatePresentacionUseCase, 'execute'>>;
  let findUseCase: jest.Mocked<Pick<FindPresentacionUseCase, 'findAllFor' | 'findAllListado' | 'findBy'>>;
  let findDtoByIdUseCase: jest.Mocked<Pick<FindDtoByIdPresentacionUseCase, 'execute'>>;
  let findEntityByIdUseCase: jest.Mocked<Pick<FindEntityByIdPresentacionUseCase, 'execute'>>;
  let removeUseCase: jest.Mocked<Pick<RemovePresentacionUseCase, 'execute'>>;

  beforeEach(async () => {
    createUseCase = { execute: jest.fn() };
    updateUseCase = { execute: jest.fn() };
    findUseCase = {
      findAllFor: jest.fn(),
      findAllListado: jest.fn(),
      findBy: jest.fn(),
    };
    findDtoByIdUseCase = { execute: jest.fn() };
    findEntityByIdUseCase = { execute: jest.fn() };
    removeUseCase = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PresentacionService,
        { provide: CreatePresentacionUseCase, useValue: createUseCase },
        { provide: UpdatePresentacionUseCase, useValue: updateUseCase },
        { provide: FindPresentacionUseCase, useValue: findUseCase },
        { provide: FindDtoByIdPresentacionUseCase, useValue: findDtoByIdUseCase },
        { provide: FindEntityByIdPresentacionUseCase, useValue: findEntityByIdUseCase },
        { provide: RemovePresentacionUseCase, useValue: removeUseCase },
      ],
    }).compile();

    service = module.get<PresentacionService>(PresentacionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create() delega en CreatePresentacionUseCase', async () => {
    const dto = { denominacion: 'x' } as any;
    createUseCase.execute.mockResolvedValue('ok' as any);

    const resultado = await service.create(dto);

    expect(createUseCase.execute).toHaveBeenCalledWith(dto);
    expect(resultado).toBe('ok');
  });

  it('update() delega en UpdatePresentacionUseCase', async () => {
    const dto = { denominacion: 'x' } as any;
    updateUseCase.execute.mockResolvedValue('ok' as any);

    const resultado = await service.update(1, dto);

    expect(updateUseCase.execute).toHaveBeenCalledWith(1, dto);
    expect(resultado).toBe('ok');
  });

  it('remove() delega en RemovePresentacionUseCase', async () => {
    removeUseCase.execute.mockResolvedValue('ok' as any);

    const resultado = await service.remove(1, 2);

    expect(removeUseCase.execute).toHaveBeenCalledWith(1, 2);
    expect(resultado).toBe('ok');
  });

  it('findEntityById() delega en FindEntityByIdPresentacionUseCase', async () => {
    findEntityByIdUseCase.execute.mockResolvedValue('presentacion' as any);

    const resultado = await service.findEntityById(1);

    expect(findEntityByIdUseCase.execute).toHaveBeenCalledWith(1);
    expect(resultado).toBe('presentacion');
  });

  it('findDtoById() delega en FindDtoByIdPresentacionUseCase', async () => {
    findDtoByIdUseCase.execute.mockResolvedValue('dto' as any);

    const resultado = await service.findDtoById(1);

    expect(findDtoByIdUseCase.execute).toHaveBeenCalledWith(1);
    expect(resultado).toBe('dto');
  });

  it('findAllFor() delega en FindPresentacionUseCase', async () => {
    findUseCase.findAllFor.mockResolvedValue('resultado' as any);

    const resultado = await service.findAllFor('x');

    expect(findUseCase.findAllFor).toHaveBeenCalledWith('x');
    expect(resultado).toBe('resultado');
  });

  it('findAllListado() delega en FindPresentacionUseCase', async () => {
    findUseCase.findAllListado.mockResolvedValue('listado' as any);

    const resultado = await service.findAllListado();

    expect(findUseCase.findAllListado).toHaveBeenCalled();
    expect(resultado).toBe('listado');
  });

  it('findBy() delega en FindPresentacionUseCase', async () => {
    findUseCase.findBy.mockResolvedValue({ data: [], total: 0 });

    const resultado = await service.findBy({ denominacion: 'test', skip: 0, take: 10 });

    expect(findUseCase.findBy).toHaveBeenCalledWith('test', 0, 10, false);
    expect(resultado).toEqual({ data: [], total: 0 });
  });
});
