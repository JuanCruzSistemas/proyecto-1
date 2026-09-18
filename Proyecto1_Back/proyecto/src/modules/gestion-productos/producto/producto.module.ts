import { forwardRef, Module } from '@nestjs/common';
import { ProductoController } from './infraestructure/presentation/controllers/producto.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NormalizeDenominacionPipe } from 'src/modules/common/pipes/normalize-denominations.pipe';
import { ProductoEntity } from './infraestructure/persistence/entities/producto.orm-entity';
import { LineaModule } from '../linea/linea.module';
import { MarcaModule } from '../marca/marca.module';
import { TypeOrmUnitOfWork } from 'src/modules/common/unit-of-work/type-orm-unit-of-works1';
import { DataSource } from 'typeorm';
import { IUnitOfWork, UNIT_OF_WORK_TOKEN } from 'src/modules/common/unit-of-work/unit-of-work.interface';
import { ProveedorModule } from 'src/modules/organizacion/proveedor/proveedor.module';
import { UsuarioModule } from 'src/modules/gestion-usuario/usuario/usuario.module';
import { CommonModule } from 'src/modules/common/common.module';
import { ProductoService } from './application/services/producto.service';
import { ProductoRepository } from './infraestructure/persistence/repositories/producto.repository';
import { ProductoUniquenessValidator } from './infraestructure/validators/producto-uniqueness.validator';
import { ProductoRelatedEntitiesValidator } from './infraestructure/validators/producto-related-entities.validator';
import { ProductoValidationService } from './domain/services/producto-validation.service';
import { ProductoIntrinsicValidationService } from './domain/services/producto-intrinsic-validation.service';
import { PRODUCTO_REPOSITORY_TOKEN } from './domain/interfaces/producto.repository-interface';
import { CreateProductoUseCase } from './application/use-cases/create-producto.use-case';
import { UpdateProductoUseCase } from './application/use-cases/update-producto.use-case';
import { FindByProductoUseCase } from './application/use-cases/find-by-producto.use-case';
import { FindByIdConAuditoria } from './application/use-cases/find-by-id-auditoria.use-case';
import { FindDtoByIdUseCase } from './application/use-cases/find-dto-by-id.use-case';
import { FindEntityByIdUseCase } from './application/use-cases/find-entity-by-id.use-case';
import { RemoveProductoUseCase } from './application/use-cases/remove-producto.use-case';
import { FindByDenominacionUseCase } from './application/use-cases/find-by-denominiacion.use-case';
import { UpdatePrecioUseCase } from './application/use-cases/update-precio.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductoEntity]),
    CommonModule,
    forwardRef(() => LineaModule),
    forwardRef(() => MarcaModule),
    ProveedorModule,
    UsuarioModule,
  ],

  controllers: [ProductoController],
  
  providers: [
    ProductoService,
    ProductoIntrinsicValidationService,
    ProductoValidationService,
    ProductoRelatedEntitiesValidator,
    ProductoUniquenessValidator,
    CreateProductoUseCase,
    UpdateProductoUseCase,
    FindByProductoUseCase,
    FindByIdConAuditoria,
    FindDtoByIdUseCase,
    FindEntityByIdUseCase,
    RemoveProductoUseCase,
    FindByDenominacionUseCase,
    UpdatePrecioUseCase,
    {
      provide: PRODUCTO_REPOSITORY_TOKEN,
      useClass: ProductoRepository,
    },
    {
      provide: UNIT_OF_WORK_TOKEN,
      useFactory: (dataSource: DataSource): IUnitOfWork => {
        return new TypeOrmUnitOfWork(dataSource);
      },
      inject: [DataSource],
    },
    NormalizeDenominacionPipe,
  ],
  
  exports: [
    TypeOrmModule,
    ProductoService,
    PRODUCTO_REPOSITORY_TOKEN,
  ],
})
export class ProductoModule {}