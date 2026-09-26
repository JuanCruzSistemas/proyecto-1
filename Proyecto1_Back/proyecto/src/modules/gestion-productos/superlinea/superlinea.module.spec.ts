import { MODULE_METADATA } from '@nestjs/common/constants';
import { SuperlineaModule } from './superlinea.module';
import { SuperlineaController } from './infraestructure/presentation/controllers/superlinea.controller';
import { SuperlineaService } from './application/services/superlinea.service';
import { CreateSuperlineaUseCase } from './application/use-cases/create-superlinea.use-case';
import { UpdateSuperlineaUseCase } from './application/use-cases/update-superlinea.use-case';
import { RemoveSuperlineaUseCase } from './application/use-cases/remove-superlinea.use-case';
import { SuperlineaRepository } from './infraestructure/persistence/repositories/superlinea.repository';
import { SUPERLINEA_REPOSITORY } from './domain/interfaces/superlinea.repository.interface';

describe('SuperlineaModule', () => {
  const metadata = (key: string) => Reflect.getMetadata(key, SuperlineaModule);

  it('registra el controller de superlíneas', () => {
    expect(metadata(MODULE_METADATA.CONTROLLERS)).toEqual([SuperlineaController]);
  });

  it('registra el servicio y los casos de uso', () => {
    expect(metadata(MODULE_METADATA.PROVIDERS)).toEqual(
      expect.arrayContaining([SuperlineaService, CreateSuperlineaUseCase, UpdateSuperlineaUseCase, RemoveSuperlineaUseCase]),
    );
  });

  it('vincula el token del repositorio con la implementación TypeORM', () => {
    expect(metadata(MODULE_METADATA.PROVIDERS)).toContainEqual({
      provide: SUPERLINEA_REPOSITORY,
      useClass: SuperlineaRepository,
    });
  });

  it('exporta el servicio para que Línea pueda validar superlíneas activas', () => {
    expect(metadata(MODULE_METADATA.EXPORTS)).toEqual([SuperlineaService]);
  });
});
