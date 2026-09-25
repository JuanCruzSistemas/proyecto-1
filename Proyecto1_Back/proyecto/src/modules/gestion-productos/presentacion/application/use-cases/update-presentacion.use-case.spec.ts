import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UpdatePresentacionUseCase } from './update-presentacion.use-case';
import { PresentacionUniquenessValidator } from '../../infraestructure/validators/presentacion-uniqueness.validator';
import { IPresentacionRepository, PRESENTACION_REPOSITORY_TOKEN } from '../../domain/repositories/presentacion.repository.interface';
import { Presentacion } from '../../domain/entities/presentacion.entity';
import { UpdatePresentacionDto } from '../dto/update-presentacion.dto';

describe('UpdatePresentacionUseCase', () => {
  let useCase: UpdatePresentacionUseCase;
  let repository: jest.Mocked<IPresentacionRepository>;

  const crearPresentacion = () =>
    Presentacion.reconstitute({
      id: 1,
      denominacion: 'caja x 12',
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
        UpdatePresentacionUseCase,
        PresentacionUniquenessValidator,
        { provide: PRESENTACION_REPOSITORY_TOKEN, useValue: repository },
      ],
    }).compile();

    useCase = module.get(UpdatePresentacionUseCase);
  });

  it('actualiza la denominación y observación de la presentación', async () => {
    const presentacion = crearPresentacion();
    repository.findOne.mockResolvedValue(presentacion);
    repository.findByDenominacionWith.mockResolvedValue(null);
    repository.update.mockResolvedValue(presentacion);

    const dto: UpdatePresentacionDto = {
      denominacion: 'caja x 24',
      usuarioUpdatedId: 2,
    } as UpdatePresentacionDto;

    await useCase.execute(1, dto);

    expect(presentacion.getDenominacion()).toBe('caja x 24');
    expect(repository.update).toHaveBeenCalledWith(1, presentacion);
  });

  it('lanza NotFoundException si la presentación no existe', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(
      useCase.execute(999, { usuarioUpdatedId: 2 } as UpdatePresentacionDto),
    ).rejects.toThrow(NotFoundException);
  });

  it('rechaza actualizar a una denominación ya usada por otra presentación', async () => {
    const presentacion = crearPresentacion();
    repository.findOne.mockResolvedValue(presentacion);
    repository.findByDenominacionWith.mockResolvedValue(
      Presentacion.reconstitute({
        id: 2,
        denominacion: 'caja x 24',
        observacion: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        usuarioCreatedId: 1,
        usuarioUpdatedId: null,
        usuarioDeletedId: null,
      }),
    );

    const dto: UpdatePresentacionDto = {
      denominacion: 'caja x 24',
      usuarioUpdatedId: 2,
    } as UpdatePresentacionDto;

    await expect(useCase.execute(1, dto)).rejects.toThrow(ConflictException);
    expect(repository.update).not.toHaveBeenCalled();
  });
});
