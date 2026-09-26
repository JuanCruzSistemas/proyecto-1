import { MODULE_METADATA } from '@nestjs/common/constants';
import { ProductoModule } from './producto.module';
import { ProductoController } from './infraestructure/presentation/controllers/producto.controller';
import { CambioPreciosController } from './infraestructure/presentation/controllers/cambio-precios.controller';
import { ProductoService } from './application/services/producto.service';
import { ProductoRepository } from './infraestructure/persistence/repositories/producto.repository';
import { HistorialPrecioRepository } from './infraestructure/persistence/repositories/historial-precio.repository';
import { PRODUCTO_REPOSITORY_TOKEN } from './domain/repositories/producto.repository.interface';
import { HISTORIAL_PRECIO_REPOSITORY_TOKEN } from './domain/repositories/historial-precio.repository.interface';
import { UNIT_OF_WORK_TOKEN } from 'src/modules/common/unit-of-work/unit-of-work.interface';
import { CreateProductoUseCase } from './application/use-cases/create-producto.use-case';
import { UpdatePrecioUseCase } from './application/use-cases/update-precio.use-case';
import { GuardarCambioMasivoUseCase } from './application/use-cases/guardar-cambio-masivo.use-case';

describe('ProductoModule', () => {
  const metadata = (key: string) => Reflect.getMetadata(key, ProductoModule);
  const providers = () => metadata(MODULE_METADATA.PROVIDERS) as any[];

  it('registra los controllers de producto y de cambio de precios', () => {
    expect(metadata(MODULE_METADATA.CONTROLLERS)).toEqual([ProductoController, CambioPreciosController]);
  });

  it('registra el servicio y los casos de uso', () => {
    expect(providers()).toEqual(
      expect.arrayContaining([ProductoService, CreateProductoUseCase, UpdatePrecioUseCase, GuardarCambioMasivoUseCase]),
    );
  });

  it('vincula los tokens de repositorio con las implementaciones TypeORM', () => {
    expect(providers()).toContainEqual({ provide: PRODUCTO_REPOSITORY_TOKEN, useClass: ProductoRepository });
    expect(providers()).toContainEqual({ provide: HISTORIAL_PRECIO_REPOSITORY_TOKEN, useClass: HistorialPrecioRepository });
  });

  it('la unidad de trabajo se construye sobre el DataSource inyectado', () => {
    const uow = providers().find((p) => p.provide === UNIT_OF_WORK_TOKEN);
    const dataSource = { createQueryRunner: jest.fn() };

    const instancia = uow.useFactory(dataSource);

    expect(instancia).toBeDefined();
    expect(uow.inject).toHaveLength(1);
  });

  it('exporta el servicio y el repositorio para otros módulos', () => {
    expect(metadata(MODULE_METADATA.EXPORTS)).toEqual(expect.arrayContaining([ProductoService, PRODUCTO_REPOSITORY_TOKEN]));
  });

  it('importa Línea, Marca y Presentación con forwardRef (dependencia circular)', () => {
    const referencias = (metadata(MODULE_METADATA.IMPORTS) as any[])
      .filter((i) => typeof i?.forwardRef === 'function')
      .map((i) => i.forwardRef().name);

    expect(referencias).toEqual(['LineaModule', 'MarcaModule', 'PresentacionModule']);
  });
});
