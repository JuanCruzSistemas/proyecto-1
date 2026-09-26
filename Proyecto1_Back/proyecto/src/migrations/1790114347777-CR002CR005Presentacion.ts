import { MigrationInterface, QueryRunner } from "typeorm";

export class CR002CR005Presentacion1790114347777 implements MigrationInterface {
    name = 'CR002CR005Presentacion1790114347777'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`presentacion\` (\`id\` int NOT NULL AUTO_INCREMENT, \`denominacion\` varchar(255) NOT NULL, \`observacion\` text NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`usuarioCreatedId\` int NULL, \`usuarioUpdatedId\` int NULL, \`usuarioDeletedId\` int NULL, UNIQUE INDEX \`IDX_16507f51a2d2e59f7e5e4d5e79\` (\`denominacion\`, \`deletedAt\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`producto\` ADD \`presentacionId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`producto\` ADD \`denominacionEditadaManualmente\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`producto\` ADD \`presentacion_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`producto\` ADD CONSTRAINT \`FK_7282b775a6cd16a48f96f242d91\` FOREIGN KEY (\`presentacion_id\`) REFERENCES \`presentacion\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`producto\` DROP FOREIGN KEY \`FK_7282b775a6cd16a48f96f242d91\``);
        await queryRunner.query(`ALTER TABLE \`producto\` DROP COLUMN \`presentacion_id\``);
        await queryRunner.query(`ALTER TABLE \`producto\` DROP COLUMN \`denominacionEditadaManualmente\``);
        await queryRunner.query(`ALTER TABLE \`producto\` DROP COLUMN \`presentacionId\``);
        await queryRunner.query(`DROP INDEX \`IDX_16507f51a2d2e59f7e5e4d5e79\` ON \`presentacion\``);
        await queryRunner.query(`DROP TABLE \`presentacion\``);
    }

}
