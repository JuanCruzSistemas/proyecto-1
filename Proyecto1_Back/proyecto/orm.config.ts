import { config } from 'dotenv';
import { DataSource } from 'typeorm';

// Cargar variables de entorno
config({
  path: `.env`,
  override: true,
});

// Configuración de TypeORM para migraciones
export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3310'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  // Las entidades se cargan automáticamente con estos patrones
  entities: [
    __dirname + '/src/**/*.orm-entity.ts',
    __dirname + '/src/**/*.orm-entity.js',
    __dirname + '/src/**/entities/*.entity.ts',
    __dirname + '/src/**/entities/*.entity.js',
  ],
  
  // Las migraciones se cargan desde esta carpeta
  migrations: [__dirname + '/src/migrations/*{.ts,.js}'],

  // synchronize en false para usar migraciones
  synchronize: false,
  
  // logging para debug (puedes ponerlo en false en producción)
  logging: true,
  
  // Configuraciones adicionales recomendadas
  migrationsRun: false,
  migrationsTableName: 'migrations',
});