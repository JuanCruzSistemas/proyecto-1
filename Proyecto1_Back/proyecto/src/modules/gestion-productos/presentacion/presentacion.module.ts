import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PresentacionEntity } from "./infraestructure/persistence/entities/presentacion.orm-entity";
import { PresentacionController } from "./infraestructure/presentation/controllers/presentacion.controller";
import { NormalizeDenominacionPipe } from "src/modules/common/pipes/normalize-denominations.pipe";
import { PresentacionRepository } from "./infraestructure/persistence/repositories/presentacion.repository";
import { PresentacionService } from "./application/services/presentacion.service";
import { PoliticaEliminacionPresentacion } from "./domain/services/politica-eliminacion-presentacion.service";
import { ProductoModule } from "../producto/producto.module";
import { PRESENTACION_REPOSITORY_TOKEN } from "./domain/repositories/presentacion.repository.interface";
import { PresentacionUniquenessValidator } from "./infraestructure/validators/presentacion-uniqueness.validator";
import { CreatePresentacionUseCase } from "./application/use-cases/create-presentacion.use-case";
import { UpdatePresentacionUseCase } from "./application/use-cases/update-presentacion.use-case";
import { FindPresentacionUseCase } from "./application/use-cases/find-presentacion.use-case";
import { FindDtoByIdPresentacionUseCase } from "./application/use-cases/find-dto-by-id-presentacion.use-case";
import { FindEntityByIdPresentacionUseCase } from "./application/use-cases/find-entity-by-id-presentacion.use-case";
import { RemovePresentacionUseCase } from "./application/use-cases/remove-presentacion.use-case";

@Module({
    imports: [
        TypeOrmModule.forFeature([PresentacionEntity]),
        forwardRef(() => ProductoModule),
    ],
    controllers: [PresentacionController],
    providers: [
        PresentacionService,
        NormalizeDenominacionPipe,
        PoliticaEliminacionPresentacion,
        PresentacionUniquenessValidator,
        CreatePresentacionUseCase,
        UpdatePresentacionUseCase,
        FindPresentacionUseCase,
        FindDtoByIdPresentacionUseCase,
        FindEntityByIdPresentacionUseCase,
        RemovePresentacionUseCase,
        {
            provide: PRESENTACION_REPOSITORY_TOKEN,
            useClass: PresentacionRepository,
        },
    ],
    exports: [
        TypeOrmModule,
        PresentacionService,
        PRESENTACION_REPOSITORY_TOKEN,
        FindEntityByIdPresentacionUseCase,
    ]
})
export class PresentacionModule {}
