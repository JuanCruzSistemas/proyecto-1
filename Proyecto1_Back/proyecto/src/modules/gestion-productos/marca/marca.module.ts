import { forwardRef, Module } from '@nestjs/common';
import { MarcaController } from './infraestructure/presentation/controllers/marca.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarcaEntity } from './infraestructure/persistence/entities/marca.orm-entity';
import { NormalizeDenominacionPipe } from 'src/modules/common/pipes/normalize-denominations.pipe';
import { MarcaRepository } from './infraestructure/persistence/repositories/marca.repository';
import { DataSource } from 'typeorm';
import { TypeOrmUnitOfWork } from 'src/modules/common/unit-of-work/type-orm-unit-of-works1';
import { IUnitOfWork } from 'src/modules/common/unit-of-work/iunit-of-work.';
import { UsuarioModule } from 'src/modules/gestion-usuario/usuario/usuario.module';
import { MarcaService } from './application/services/marca.service';
import { PoliticaEliminacionMarca } from './domain/services/politica-eliminacion-marca.service';
import { ProductoModule } from '../producto/producto.module';
import { MARCA_REPOSITORY_TOKEN } from './domain/interfaces/marca.repository.interface';
import { MarcaUniquenessValidator } from './infraestructure/validators/marca-uniqueness.validator';
import { CreateMarcaUseCase } from './application/use-cases/create-marca.use-case';
import { UpdateMarcaUseCase } from './application/use-cases/update-marca.use-case';
import { FindMarcaUseCase } from './application/use-cases/find-marca.use-case';
import { FindDtoByIdMarcaUseCase } from './application/use-cases/find-dto-by-id-marca.use-case';
import { FindEntityByIdMarcaUseCase } from './application/use-cases/find-entity-by-id-marca.use-case';
import { FindByIdConAuditoriaMarcaUseCase } from './application/use-cases/find-by-id-auditoria-marca.use-case';
import { RemoveMarcaUseCase } from './application/use-cases/remove-marca.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([MarcaEntity]),
    UsuarioModule,
    forwardRef(() => ProductoModule),

  ],
  controllers: [MarcaController],
  providers: [
    MarcaService,
    NormalizeDenominacionPipe,
    PoliticaEliminacionMarca,
    MarcaUniquenessValidator,
    CreateMarcaUseCase,
    UpdateMarcaUseCase,
    FindMarcaUseCase,
    FindDtoByIdMarcaUseCase,
    FindEntityByIdMarcaUseCase,
    FindByIdConAuditoriaMarcaUseCase,
    RemoveMarcaUseCase,
    {
      provide: MARCA_REPOSITORY_TOKEN,
      useClass: MarcaRepository,
    },

    {
      provide: 'UnitOfWork',
      useFactory: (dataSource: DataSource): IUnitOfWork => {
        return new TypeOrmUnitOfWork(dataSource);
      },
      inject: [DataSource],
    },
  ],
  exports: [TypeOrmModule, MarcaService],
})
export class MarcaModule {}
