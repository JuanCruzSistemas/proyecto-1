import { forwardRef, Module } from '@nestjs/common';
import { LineaEntity } from './infraestructure/persistence/entities/linea.orm-entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NormalizeDenominacionPipe } from 'src/modules/common/pipes/normalize-denominations.pipe';
import { LineaRepository } from './infraestructure/persistence/repositories/linea.repository';
import { DataSource } from 'typeorm';
import { IUnitOfWork } from 'src/modules/common/unit-of-work/unit-of-work.interface';
import { TypeOrmUnitOfWork } from 'src/modules/common/unit-of-work/type-orm-unit-of-works1';
import { UsuarioModule } from 'src/modules/gestion-usuario/usuario/usuario.module';
import { LineaController } from './infraestructure/presentation/controllers/linea.controller';
import { LineaService } from './application/services/linea.service';
import { ProductoModule } from '../producto/producto.module';
import { PoliticaEliminacionLinea } from './domain/services/politica-eliminacion-linea.service';
import { LINEA_REPOSITORY_TOKEN } from './domain/interfaces/linea.repository.interface';
import { LineaUniquenessValidator } from './infraestructure/validators/linea-uniqueness.validator';
import { CreateLineaUseCase } from './application/use-cases/create-linea.use-case';
import { UpdateLineaUseCase } from './application/use-cases/update-linea.use-case';
import { FindLineaUseCase } from './application/use-cases/find-linea.use-case';
import { FindDtoByIdLineaUseCase } from './application/use-cases/find-dto-by-id-linea.use-case';
import { FindEntityByIdLineaUseCase } from './application/use-cases/find-entity-by-id-linea.use-case';
import { FindByIdConAuditoriaLineaUseCase } from './application/use-cases/find-by-id-auditoria-linea.use-case';
import { RemoveLineaUseCase } from './application/use-cases/remove-linea.use-case';

import { SuperlineaModule } from '../superlinea/superlinea.module';

@Module({
  imports: [
    SuperlineaModule,
    TypeOrmModule.forFeature([LineaEntity]),
    forwardRef(() => ProductoModule),
    UsuarioModule,
  ],
  controllers: [LineaController],
  providers: [
    LineaService,
    PoliticaEliminacionLinea,
    LineaUniquenessValidator,
    CreateLineaUseCase,
    UpdateLineaUseCase,
    FindLineaUseCase,
    FindDtoByIdLineaUseCase,
    FindEntityByIdLineaUseCase,
    FindByIdConAuditoriaLineaUseCase,
    RemoveLineaUseCase,
    {
      provide: LINEA_REPOSITORY_TOKEN,
      useClass: LineaRepository,
    },

    {
      provide: 'UnitOfWork',
      useFactory: (dataSource: DataSource): IUnitOfWork => {
        return new TypeOrmUnitOfWork(dataSource);
      },
      inject: [DataSource],
    },
    NormalizeDenominacionPipe,
  ],
  exports: [
    TypeOrmModule,
    LineaService,
    LINEA_REPOSITORY_TOKEN,
  ],
})
export class LineaModule {}
