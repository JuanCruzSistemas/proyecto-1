import { Test, TestingModule } from '@nestjs/testing';
import { PresentacionController } from './presentacion.controller';
import { PresentacionService } from '../../../application/services/presentacion.service';
import { AuthGuard } from 'src/modules/gestion-usuario/auth/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';

describe('PresentacionController', () => {
  let controller: PresentacionController;
  let service: PresentacionService;

  const mockService = {
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findBy: jest.fn(),
    findAllFor: jest.fn(),
    findDtoById: jest.fn(),
  };

  const mockJwtService = {
    verify: jest.fn().mockReturnValue({ rolId: 1 }),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('secret'),
  };

  const mockReflector = {
    getAllAndOverride: jest.fn().mockReturnValue(['Administrador']),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PresentacionController],
      providers: [
        {
          provide: PresentacionService,
          useValue: mockService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PresentacionController>(PresentacionController);
    service = module.get<PresentacionService>(PresentacionService);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('create delega al servicio', async () => {
    const dto = { denominacion: 'caja x 12', usuarioCreatedId: 1 } as any;
    mockService.create.mockResolvedValue({ message: 'OK' });

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ message: 'OK' });
  });

  it('findBy delega al servicio', async () => {
    const paginationDto = { denominacion: 'botella', skip: 0, take: 10 };
    mockService.findBy.mockResolvedValue({ data: [], total: 0 });

    const result = await controller.findBy(paginationDto);

    expect(service.findBy).toHaveBeenCalledWith(paginationDto);
    expect(result).toEqual({ data: [], total: 0 });
  });
});
