import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LineaEntity } from 'src/modules/gestion-productos/linea/infraestructure/persistence/entities/linea.orm-entity';
import { MarcaEntity } from 'src/modules/gestion-productos/marca/infraestructure/persistence/entities/marca.orm-entity';
import { Usuario } from 'src/modules/gestion-usuario/usuario/domain/entities/usuario.entity';
import { Proveedor } from 'src/modules/organizacion/proveedor/domain/entities/proveedor.entity';
import { DeepPartial, Repository } from 'typeorm';
import { SuperlineaEntity } from 'src/modules/gestion-productos/superlinea/infraestructure/persistence/entities/superlinea.orm-entity';

@Injectable()
export class SeedFamiliaProductoService {
  constructor(

    @InjectRepository(LineaEntity)
    private readonly lineaRepository: Repository<LineaEntity>,

    @InjectRepository(MarcaEntity)
    private readonly marcaRepository: Repository<MarcaEntity>,



    @InjectRepository(Proveedor)
    private readonly proveedorRepository: Repository<Proveedor>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,


  ) {}


  async seedLineas() {
    const superlineas = this.lineaRepository.manager.getRepository(SuperlineaEntity);
    let general = await superlineas.findOneBy({ denominacion: 'General' });
    if (!general) general = await superlineas.save(superlineas.create({
      denominacion: 'General', observacion: 'Clasificación inicial', sistema: 0,
    }));
    const entryData = [
      {
        denominacion: 'Aceites',
        sistema: 0,
        usuarioCreatedId: 1,
      },

      {
        denominacion: 'Aceitunas',
        sistema: 0,
        usuarioCreatedId: 1,
      },

      {
        denominacion: 'Azucar',
        sistema: 0,
        usuarioCreatedId: 1,
      },
    
      {
        denominacion: 'BOLSAS',
        sistema: 0,
        usuarioCreatedId: 1,
      },

      {
        denominacion: 'Chocolates',
        sistema: 0,
        usuarioCreatedId: 1,
      },

      {
        denominacion: 'HARINAS',
        sistema: 0,
        usuarioCreatedId: 1,
      },

      {
        denominacion: 'MARGARINAS Y GRASAS',
        sistema: 0,
        usuarioCreatedId: 1,
      },

    
    ];

    for (const data of entryData) {
      const exists = await this.lineaRepository.findOneBy({
        denominacion: data.denominacion.toUpperCase(),
      });

      if (!exists) {
        
        const usuarioCreated = await this.usuarioRepository.findOneBy({
          id: data.usuarioCreatedId,
        });

        if (!usuarioCreated) {
          console.log(
            `⚠️ No se encontró el usuario "${data.usuarioCreatedId}".`,
          );
          continue; // Evita crear la línea sin superlínea
        }

        const linea = this.lineaRepository.create({
          denominacion: data.denominacion.toUpperCase(),
          sistema: data.sistema,
          superlineaId: general.id,

          usuarioCreatedId: usuarioCreated.id,
        } as DeepPartial<LineaEntity>);

        await this.lineaRepository.save(linea);
        console.log(`✅ Linea "${data.denominacion}" creada.`);
      } else {
        console.log(`⚠️ Linea "${data.denominacion}" ya existe.`);
      }
    }
  }

  // Seed de Marcas
  async seedMarcas() {
    const entryData = [
      { denominacion: 'SIN MARCA', usuarioCreatedId: 1, sistema: 0 },
      { denominacion: 'CAROYENSE', usuarioCreatedId: 1, sistema: 0 },
      { denominacion: 'CIRCE', usuarioCreatedId: 1, sistema: 0 },
    
    ];

    for (const data of entryData) {
      const exists = await this.marcaRepository.findOneBy({
        denominacion: data.denominacion,
      });

      if (!exists) {
        const usuarioCreated = await this.usuarioRepository.findOneBy({
          id: data.usuarioCreatedId,
        });

        if (!usuarioCreated) {
          console.log(
            `⚠️ No se encontró el usuario "${data.usuarioCreatedId}".`,
          );
          continue; // Evita crear la línea sin superlínea
        }

        const marca = this.marcaRepository.create({
          denominacion: data.denominacion.toUpperCase(),
          usuarioCreatedId: usuarioCreated.id,
          sistema: data.sistema,
        } as DeepPartial<MarcaEntity>);

        await this.marcaRepository.save(marca);
        console.log(`✅ Marca "${data.denominacion}" creada.`);
      } else {
        console.log(`⚠️ Marca "${data.denominacion}" ya existe.`);
      }
    }
  }


  async runAllSeeds() {
    console.log('🚀 Iniciando todos los seeds...');


   await  this.seedLineas();
    await this.seedMarcas();

    console.log('✅ Todos los seeds completados.');
  }
}
