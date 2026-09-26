import { MODULE_METADATA } from '@nestjs/common/constants';
import { ProductoOperacionModule } from './producto-operacion.module';
import { ProductoOperacionController } from './producto-operacion.controller';
import { ProductoOperacionService } from './producto-operacion.service';

describe('ProductoOperacionModule', () => {
  it('registra su controller y su servicio', () => {
    expect(Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, ProductoOperacionModule)).toEqual([ProductoOperacionController]);
    expect(Reflect.getMetadata(MODULE_METADATA.PROVIDERS, ProductoOperacionModule)).toEqual([ProductoOperacionService]);
  });
});
