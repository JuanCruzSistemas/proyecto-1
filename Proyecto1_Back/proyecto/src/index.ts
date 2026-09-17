import { Linea } from "./modules/gestion-productos/linea/domain/entities/linea.entity";
import { Marca } from "./modules/gestion-productos/marca/domain/entities/marca.entity";
import { MovimientoStock } from "./modules/gestion-productos/movimiento-stock/entities/movimiento-stock.entity";
import { ProductoEntity } from "./modules/gestion-productos/producto/infraestructure/persistence/entities/producto.orm-entity";
import { Auditoria } from "./modules/gestion-sistema/auditoria/entities/auditoria.entity";
import { ConfiguracionSistema } from "./modules/gestion-sistema/configuracion-sistema/domain/entities/configuracion-sistema.entity";
import { Rol } from "./modules/gestion-usuario/rol/domain/entities/rol.entity";
import { Usuario } from "./modules/gestion-usuario/usuario/domain/entities/usuario.entity";
import { CondicionIva } from "./modules/gutil/condicion-iva/domain/entities/condicion-iva.entity";
import { Domicilio } from "./modules/gutil/domicilio/entities/domicilio.entity";
import { Localidad } from "./modules/gutil/localidad/domain/entities/localidad.entity";
import { Provincia } from "./modules/gutil/provincia/domain/entities/provincia.entity";
import { Cliente } from "./modules/organizacion/cliente/domain/entities/cliente.entity";
import { Empresa } from "./modules/organizacion/empresa/domain/entities/empresa.entity";
import { Personal } from "./modules/organizacion/personal/domain/entities/personal.entity";
import { Proveedor } from "./modules/organizacion/proveedor/domain/entities/proveedor.entity";


export const entities = [Marca,
                        Linea, 
                        ProductoEntity,
                        MovimientoStock,
                        Auditoria,
                        ConfiguracionSistema,
                        Rol,
                        Usuario,
                        CondicionIva,
                        Domicilio, 
                        Localidad,
                        Provincia,
                        Usuario,
                        Cliente,
                        Proveedor,
                        Personal,
                        Empresa,
                                       
]; 