import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioModule } from '../../gestion-usuario/usuario/usuario.module';
import { SuperlineaEntity } from './infraestructure/persistence/entities/superlinea.orm-entity';
import { SuperlineaRepository } from './infraestructure/persistence/repositories/superlinea.repository';
import { SUPERLINEA_REPOSITORY } from './domain/interfaces/superlinea.repository.interface';
import { SuperlineaService } from './application/services/superlinea.service';
import { CreateSuperlineaUseCase } from './application/use-cases/create-superlinea.use-case';
import { UpdateSuperlineaUseCase } from './application/use-cases/update-superlinea.use-case';
import { RemoveSuperlineaUseCase } from './application/use-cases/remove-superlinea.use-case';
import { SuperlineaController } from './infraestructure/presentation/controllers/superlinea.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SuperlineaEntity]), UsuarioModule],
  controllers: [SuperlineaController],
  providers: [
    SuperlineaService, CreateSuperlineaUseCase, UpdateSuperlineaUseCase, RemoveSuperlineaUseCase,
    { provide: SUPERLINEA_REPOSITORY, useClass: SuperlineaRepository },
  ],
  exports: [SuperlineaService],
})
export class SuperlineaModule {}
