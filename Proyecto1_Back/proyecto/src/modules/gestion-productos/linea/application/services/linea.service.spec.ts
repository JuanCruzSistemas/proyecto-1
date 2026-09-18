import { Test, TestingModule } from '@nestjs/testing';
import { LineaService } from './linea.service';
import { CreateLineaUseCase } from '../use-cases/create-linea.use-case';
import { UpdateLineaUseCase } from '../use-cases/update-linea.use-case';
import { FindLineaUseCase } from '../use-cases/find-linea.use-case';
import { FindDtoByIdLineaUseCase } from '../use-cases/find-dto-by-id-linea.use-case';
import { FindEntityByIdLineaUseCase } from '../use-cases/find-entity-by-id-linea.use-case';
import { FindByIdConAuditoriaLineaUseCase } from '../use-cases/find-by-id-auditoria-linea.use-case';
import { RemoveLineaUseCase } from '../use-cases/remove-linea.use-case';

describe('LineaService', () => {
  let service: LineaService;
  let createLineaUseCase: jest.Mocked<Pick<CreateLineaUseCase, 'execute'>>;
  let updateLineaUseCase: jest.Mocked<Pick<UpdateLineaUseCase, 'execute'>>;
  let findLineaUseCase: jest.Mocked<Pick<FindLineaUseCase, 'findByDenominacionFiltered' | 'findAllFor' | 'findAllListado'>>;
  let findDtoByIdLineaUseCase: jest.Mocked<Pick<FindDtoByIdLineaUseCase, 'execute'>>;
  let findEntityByIdLineaUseCase: jest.Mocked<Pick<FindEntityByIdLineaUseCase, 'execute'>>;
  let findByIdConAuditoriaLineaUseCase: jest.Mocked<Pick<FindByIdConAuditoriaLineaUseCase, 'execute'>>;
  let removeLineaUseCase: jest.Mocked<Pick<RemoveLineaUseCase, 'execute'>>;

  beforeEach(async () => {
    createLineaUseCase = { execute: jest.fn() };
    updateLineaUseCase = { execute: jest.fn() };
    findLineaUseCase = {
      findByDenominacionFiltered: jest.fn(),
      findAllFor: jest.fn(),
      findAllListado: jest.fn(),
    };
    findDtoByIdLineaUseCase = { execute: jest.fn() };
    findEntityByIdLineaUseCase = { execute: jest.fn() };
    findByIdConAuditoriaLineaUseCase = { execute: jest.fn() };
    removeLineaUseCase = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LineaService,
        { provide: CreateLineaUseCase, useValue: createLineaUseCase },
        { provide: UpdateLineaUseCase, useValue: updateLineaUseCase },
        { provide: FindLineaUseCase, useValue: findLineaUseCase },
        { provide: FindDtoByIdLineaUseCase, useValue: findDtoByIdLineaUseCase },
        { provide: FindEntityByIdLineaUseCase, useValue: findEntityByIdLineaUseCase },
        { provide: FindByIdConAuditoriaLineaUseCase, useValue: findByIdConAuditoriaLineaUseCase },
        { provide: RemoveLineaUseCase, useValue: removeLineaUseCase },
      ],
    }).compile();

    service = module.get<LineaService>(LineaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create() delega en CreateLineaUseCase', async () => {
    const dto = { denominacion: 'x' } as any;
    createLineaUseCase.execute.mockResolvedValue('ok' as any);

    const resultado = await service.create(dto);

    expect(createLineaUseCase.execute).toHaveBeenCalledWith(dto);
    expect(resultado).toBe('ok');
  });

  it('update() delega en UpdateLineaUseCase', async () => {
    const dto = { denominacion: 'x' } as any;
    updateLineaUseCase.execute.mockResolvedValue('ok' as any);

    const resultado = await service.update(1, dto);

    expect(updateLineaUseCase.execute).toHaveBeenCalledWith(1, dto);
    expect(resultado).toBe('ok');
  });

  it('remove() delega en RemoveLineaUseCase', async () => {
    removeLineaUseCase.execute.mockResolvedValue('ok' as any);

    const resultado = await service.remove(1, 2);

    expect(removeLineaUseCase.execute).toHaveBeenCalledWith(1, 2);
    expect(resultado).toBe('ok');
  });

  it('findEntityById() delega en FindEntityByIdLineaUseCase', async () => {
    findEntityByIdLineaUseCase.execute.mockResolvedValue('linea' as any);

    const resultado = await service.findEntityById(1);

    expect(findEntityByIdLineaUseCase.execute).toHaveBeenCalledWith(1);
    expect(resultado).toBe('linea');
  });

  it('findDtoById() delega en FindDtoByIdLineaUseCase', async () => {
    findDtoByIdLineaUseCase.execute.mockResolvedValue('dto' as any);

    const resultado = await service.findDtoById(1);

    expect(findDtoByIdLineaUseCase.execute).toHaveBeenCalledWith(1);
    expect(resultado).toBe('dto');
  });

  it('findByDenominacionFiltered() delega en FindLineaUseCase', async () => {
    findLineaUseCase.findByDenominacionFiltered.mockResolvedValue('resultado' as any);

    const resultado = await service.findByDenominacionFiltered('x', 0, 10, false);

    expect(findLineaUseCase.findByDenominacionFiltered).toHaveBeenCalledWith('x', 0, 10, false);
    expect(resultado).toBe('resultado');
  });

  it('findByIdConAuditoria() delega en FindByIdConAuditoriaLineaUseCase', async () => {
    findByIdConAuditoriaLineaUseCase.execute.mockResolvedValue('auditoria' as any);

    const resultado = await service.findByIdConAuditoria(1);

    expect(findByIdConAuditoriaLineaUseCase.execute).toHaveBeenCalledWith(1);
    expect(resultado).toBe('auditoria');
  });
});
