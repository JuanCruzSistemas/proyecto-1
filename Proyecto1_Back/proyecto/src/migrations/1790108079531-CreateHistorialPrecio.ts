import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateHistorialPrecio1790108079531 implements MigrationInterface {
  name = 'CreateHistorialPrecio1790108079531'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Crea únicamente la tabla historial_precio
    await queryRunner.query(`
      CREATE TABLE \`historial_precio\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`precioAnterior\` decimal(15,5) NOT NULL DEFAULT '0.00000',
        \`precioNuevo\` decimal(15,5) NOT NULL DEFAULT '0.00000',
        \`costoAnterior\` decimal(15,5) NOT NULL DEFAULT '0.00000',
        \`costoNuevo\` decimal(15,5) NOT NULL DEFAULT '0.00000',
        \`margenAnterior\` decimal(5,2) NOT NULL DEFAULT '0.00',
        \`margenNuevo\` decimal(5,2) NOT NULL DEFAULT '0.00',
        \`motivo\` varchar(500) NOT NULL,
        \`fecha\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`producto_id\` int NOT NULL,
        \`usuario_id\` int NOT NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        INDEX \`idx_historial_fecha\` (\`fecha\`),
        INDEX \`idx_historial_producto\` (\`producto_id\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // 2. Agrega las claves foráneas hacia las tablas existentes
    await queryRunner.query(`
      ALTER TABLE \`historial_precio\`
      ADD CONSTRAINT \`FK_historial_precio_producto\`
      FOREIGN KEY (\`producto_id\`) REFERENCES \`producto\`(\`id\`)
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE \`historial_precio\`
      ADD CONSTRAINT \`FK_historial_precio_usuario\`
      FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuario\`(\`id\`)
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`historial_precio\` DROP FOREIGN KEY \`FK_historial_precio_usuario\``);
    await queryRunner.query(`ALTER TABLE \`historial_precio\` DROP FOREIGN KEY \`FK_historial_precio_producto\``);
    await queryRunner.query(`DROP INDEX \`idx_historial_producto\` ON \`historial_precio\``);
    await queryRunner.query(`DROP INDEX \`idx_historial_fecha\` ON \`historial_precio\``);
    await queryRunner.query(`DROP TABLE \`historial_precio\``);
  }
}