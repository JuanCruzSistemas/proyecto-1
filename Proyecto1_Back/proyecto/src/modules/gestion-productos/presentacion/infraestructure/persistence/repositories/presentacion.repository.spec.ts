import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PresentacionRepository } from './presentacion.repository';
import { PresentacionEntity } from '../entities/presentacion.orm-entity';
import { Presentacion } from '../../../domain/entities/presentacion.entity';

describe('PresentacionRepository', () => {
  let repository: PresentacionRepository;
  let ormRepository: jest.Mocked<Repository<PresentacionEntity>>;

  beforeEach(async () => {
    ormRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PresentacionRepository,
        {
          provide: getRepositoryToken(PresentacionEntity),
          useValue: ormRepository,
        },
      ],
    }).compile();

    repository = module.get(PresentacionRepository);
  });

  it('debe estar definido', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('crea y guarda una nueva presentación', async () => {
      const presentacion = Presentacion.create({
        denominacion: 'caja x 12',
        observacion: null,
        usuarioCreatedId: 1,
      });

      const ormEntity = new PresentacionEntity();
      ormEntity.id = 1;
      ormEntity.denominacion = 'caja x 12';
      ormEntity.createdAt = new Date();
      ormEntity.updatedAt = new Date();

      ormRepository.create.mockReturnValue(ormEntity);
      ormRepository.save.mockResolvedValue(ormEntity);

      const result = await repository.create(presentacion);

      expect(ormRepository.create).toHaveBeenCalled();
      expect(ormRepository.save).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Presentacion);
      expect(result.getDenominacion()).toBe('caja x 12');
    });
  });

  describe('findOne', () => {
    it('busca una presentación por id', async () => {
      const ormEntity = new PresentacionEntity();
      ormEntity.id = 1;
      ormEntity.denominacion = 'botella';
      ormEntity.createdAt = new Date();
      ormEntity.updatedAt = new Date();

      ormRepository.findOne.mockResolvedValue(ormEntity);

      const result = await repository.findOne(1);

      expect(ormRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toBeInstanceOf(Presentacion);
    });

    it('retorna null cuando no encuentra la presentación', async () => {
      ormRepository.findOne.mockResolvedValue(null);

      const result = await repository.findOne(999);

      expect(result).toBeNull();
    });
  });
});
