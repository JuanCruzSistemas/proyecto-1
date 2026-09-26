import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarcaRepository } from './marca.repository';
import { MarcaEntity } from '../entities/marca.orm-entity';
import { Marca } from '../../../domain/entities/marca.entity';

describe('MarcaRepository', () => {
  let repository: MarcaRepository;
  let ormRepository: jest.Mocked<Repository<MarcaEntity>>;

  beforeEach(async () => {
    ormRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarcaRepository,
        {
          provide: getRepositoryToken(MarcaEntity),
          useValue: ormRepository,
        },
      ],
    }).compile();

    repository = module.get(MarcaRepository);
  });

  it('debe estar definido', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('crea y guarda una nueva marca', async () => {
      const marca = Marca.create({
        denominacion: 'toyota',
        observacion: null,
        usuarioCreatedId: 1,
      });

      const ormEntity = new MarcaEntity();
      ormEntity.id = 1;
      ormEntity.denominacion = 'toyota';
      ormEntity.sistema = 0;
      ormEntity.createdAt = new Date();
      ormEntity.updatedAt = new Date();

      ormRepository.create.mockReturnValue(ormEntity);
      ormRepository.save.mockResolvedValue(ormEntity);

      const result = await repository.create(marca);

      expect(ormRepository.create).toHaveBeenCalled();
      expect(ormRepository.save).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Marca);
      expect(result.getDenominacion()).toBe('toyota');
    });
  });

  describe('findAllFor', () => {
    it('busca marcas activas por denominación', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      ormRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await repository.findAllFor('toyota');

      expect(ormRepository.createQueryBuilder).toHaveBeenCalledWith('marca');
      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findAllListado', () => {
    it('retorna todas las marcas activas ordenadas', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      ormRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await repository.findAllListado();

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('marca.deletedAt IS NULL');
      expect(result).toEqual([]);
    });
  });
});
