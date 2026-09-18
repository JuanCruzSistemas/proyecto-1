import { Test, TestingModule } from '@nestjs/testing';
import { MarcaService } from './marca.service';
import { CreateMarcaUseCase } from '../use-cases/create-marca.use-case';
import { UpdateMarcaUseCase } from '../use-cases/update-marca.use-case';
import { FindMarcaUseCase } from '../use-cases/find-marca.use-case';
import { FindDtoByIdMarcaUseCase } from '../use-cases/find-dto-by-id-marca.use-case';
import { FindEntityByIdMarcaUseCase } from '../use-cases/find-entity-by-id-marca.use-case';
import { FindByIdConAuditoriaMarcaUseCase } from '../use-cases/find-by-id-auditoria-marca.use-case';
import { RemoveMarcaUseCase } from '../use-cases/remove-marca.use-case';

/**
 * `MarcaService` es una fachada delgada (Tarea 5, MODIFICACIONES.md): cada método
 * delega en su Caso de Uso. Antes de esta tarea el spec estaba enteramente comentado
 * (no probaba nada) — se reescribe con el mismo criterio de
 * `producto.service.spec.ts` (Tarea 4): verificar la delegación, no la lógica de
 * negocio (esa se prueba, si corresponde, en el spec del caso de uso).
 */
describe('MarcaService', () => {
  let service: MarcaService;
  let createMarcaUseCase: jest.Mocked<Pick<CreateMarcaUseCase, 'execute'>>;
  let updateMarcaUseCase: jest.Mocked<Pick<UpdateMarcaUseCase, 'execute'>>;
  let findMarcaUseCase: jest.Mocked<
    Pick<FindMarcaUseCase, 'findAllFor' | 'findAllListado' | 'findAllSinSistemaFor' | 'findAllSistemaFor' | 'findBy'>
  >;
  let findDtoByIdMarcaUseCase: jest.Mocked<Pick<FindDtoByIdMarcaUseCase, 'execute'>>;
  let findEntityByIdMarcaUseCase: jest.Mocked<Pick<FindEntityByIdMarcaUseCase, 'execute'>>;
  let findByIdConAuditoriaMarcaUseCase: jest.Mocked<Pick<FindByIdConAuditoriaMarcaUseCase, 'execute'>>;
  let removeMarcaUseCase: jest.Mocked<Pick<RemoveMarcaUseCase, 'execute'>>;

  beforeEach(async () => {
    createMarcaUseCase = { execute: jest.fn() };
    updateMarcaUseCase = { execute: jest.fn() };
    findMarcaUseCase = {
      findAllFor: jest.fn(),
      findAllListado: jest.fn(),
      findAllSinSistemaFor: jest.fn(),
      findAllSistemaFor: jest.fn(),
      findBy: jest.fn(),
    };
    findDtoByIdMarcaUseCase = { execute: jest.fn() };
    findEntityByIdMarcaUseCase = { execute: jest.fn() };
    findByIdConAuditoriaMarcaUseCase = { execute: jest.fn() };
    removeMarcaUseCase = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarcaService,
        { provide: CreateMarcaUseCase, useValue: createMarcaUseCase },
        { provide: UpdateMarcaUseCase, useValue: updateMarcaUseCase },
        { provide: FindMarcaUseCase, useValue: findMarcaUseCase },
        { provide: FindDtoByIdMarcaUseCase, useValue: findDtoByIdMarcaUseCase },
        { provide: FindEntityByIdMarcaUseCase, useValue: findEntityByIdMarcaUseCase },
        { provide: FindByIdConAuditoriaMarcaUseCase, useValue: findByIdConAuditoriaMarcaUseCase },
        { provide: RemoveMarcaUseCase, useValue: removeMarcaUseCase },
      ],
    }).compile();

    service = module.get<MarcaService>(MarcaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create() delega en CreateMarcaUseCase', async () => {
    const dto = { denominacion: 'x' } as any;
    createMarcaUseCase.execute.mockResolvedValue('ok' as any);

    const resultado = await service.create(dto);

    expect(createMarcaUseCase.execute).toHaveBeenCalledWith(dto);
    expect(resultado).toBe('ok');
  });

  it('update() delega en UpdateMarcaUseCase', async () => {
    const dto = { denominacion: 'x' } as any;
    updateMarcaUseCase.execute.mockResolvedValue('ok' as any);

    const resultado = await service.update(1, dto);

    expect(updateMarcaUseCase.execute).toHaveBeenCalledWith(1, dto);
    expect(resultado).toBe('ok');
  });

  it('remove() delega en RemoveMarcaUseCase', async () => {
    removeMarcaUseCase.execute.mockResolvedValue('ok' as any);

    const resultado = await service.remove(1, 2);

    expect(removeMarcaUseCase.execute).toHaveBeenCalledWith(1, 2);
    expect(resultado).toBe('ok');
  });

  it('findEntityById() delega en FindEntityByIdMarcaUseCase', async () => {
    findEntityByIdMarcaUseCase.execute.mockResolvedValue('marca' as any);

    const resultado = await service.findEntityById(1);

    expect(findEntityByIdMarcaUseCase.execute).toHaveBeenCalledWith(1);
    expect(resultado).toBe('marca');
  });

  it('findDtoById() delega en FindDtoByIdMarcaUseCase', async () => {
    findDtoByIdMarcaUseCase.execute.mockResolvedValue('dto' as any);

    const resultado = await service.findDtoById(1);

    expect(findDtoByIdMarcaUseCase.execute).toHaveBeenCalledWith(1);
    expect(resultado).toBe('dto');
  });

  it('findAllFor() delega en FindMarcaUseCase', async () => {
    findMarcaUseCase.findAllFor.mockResolvedValue('resultado' as any);

    const resultado = await service.findAllFor('x');

    expect(findMarcaUseCase.findAllFor).toHaveBeenCalledWith('x');
    expect(resultado).toBe('resultado');
  });

  it('findByIdConAuditoria() delega en FindByIdConAuditoriaMarcaUseCase', async () => {
    findByIdConAuditoriaMarcaUseCase.execute.mockResolvedValue('auditoria' as any);

    const resultado = await service.findByIdConAuditoria(1);

    expect(findByIdConAuditoriaMarcaUseCase.execute).toHaveBeenCalledWith(1);
    expect(resultado).toBe('auditoria');
  });

  it('findByDenominacionFiltered() sigue sin implementar (código muerto, sin ruta HTTP)', async () => {
    await expect(service.findByDenominacionFiltered({})).rejects.toThrow('Method not implemented.');
  });
});
