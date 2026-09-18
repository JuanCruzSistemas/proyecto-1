import {config} from 'dotenv';
import { DataSource } from 'typeorm';


config({
  path: `.env`,
  override: true,
});

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  // Mismo caso que en app.module.ts: `producto.orm-entity.ts` no matchea `*.entity.ts`.
  // Ver MODIFICACIONES.md.
  entities: [
    __dirname + '/src/**/*.entity.ts',
    __dirname + '/src/**/*.orm-entity.ts',
  ],
  migrations: [__dirname + '/src/migrations/*{.ts,.js}'],

  synchronize: false,
  logging: true,
});