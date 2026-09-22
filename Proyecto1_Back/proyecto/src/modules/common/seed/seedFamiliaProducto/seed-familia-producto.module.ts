import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LineaEntity } from 'src/modules/gestion-productos/linea/infraestructure/persistence/entities/linea.orm-entity';
import { MarcaEntity } from 'src/modules/gestion-productos/marca/infraestructure/persistence/entities/marca.orm-entity';

import { SeedFamiliaProductoService } from './seed-familia-producto.service';
import { SeedFamiliaProductoController } from './seed-familia-producto.controller';
import { ProductoEntity } from 'src/modules/gestion-productos/producto/infraestructure/persistence/entities/producto.orm-entity';
import { Usuario } from 'src/modules/gestion-usuario/usuario/domain/entities/usuario.entity';

import { Proveedor } from 'src/modules/organizacion/proveedor/domain/entities/proveedor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [ 
      LineaEntity,
      MarcaEntity,
      ProductoEntity,
      Usuario,
      Proveedor,

    
    ]), // Repositorios que se inyectarán
  ],
  controllers: [SeedFamiliaProductoController], // Agregar el controlador aquí
  providers: [SeedFamiliaProductoService], // Servicio disponible en el módulo
  exports: [SeedFamiliaProductoService], // Exportar si lo usas en otros módulos
})
export class SeedFamiliaProductoModule {}