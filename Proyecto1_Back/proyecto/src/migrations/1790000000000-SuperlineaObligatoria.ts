import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from 'typeorm';

export class SuperlineaObligatoria1790000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'superlinea',
      columns: [
        { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
        { name: 'denominacion', type: 'varchar', length: '255' },
        { name: 'observacion', type: 'text', isNullable: true },
        { name: 'createdAt', type: 'datetime', precision: 6, default: 'CURRENT_TIMESTAMP(6)' },
        { name: 'updatedAt', type: 'datetime', precision: 6, default: 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' },
        { name: 'deletedAt', type: 'datetime', precision: 6, isNullable: true },
        { name: 'usuarioCreatedId', type: 'int', isNullable: true },
        { name: 'usuarioUpdatedId', type: 'int', isNullable: true },
        { name: 'usuarioDeletedId', type: 'int', isNullable: true },
        { name: 'sistema', type: 'int', default: '0' },
      ],
    }));
    await queryRunner.addColumn('linea', new TableColumn({
      name: 'superlineaId', type: 'int', isNullable: true,
    }));
    const result = await queryRunner.query(
      'INSERT INTO superlinea (denominacion, observacion) VALUES (?, ?)',
      ['General', 'Asignación inicial de las líneas existentes. Puede reclasificarlas desde Línea.'],
    );
    // Incluye las líneas dadas de baja: ninguna fila queda sin asociación.
    await queryRunner.query('UPDATE linea SET superlineaId = ?, updatedAt = updatedAt WHERE superlineaId IS NULL', [result.insertId]);
    await queryRunner.changeColumn('linea', 'superlineaId', new TableColumn({
      name: 'superlineaId', type: 'int', isNullable: false,
    }));
    await queryRunner.createForeignKey('linea', new TableForeignKey({
      name: 'FK_linea_superlinea', columnNames: ['superlineaId'],
      referencedTableName: 'superlinea', referencedColumnNames: ['id'], onDelete: 'RESTRICT',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('linea', 'FK_linea_superlinea');
    await queryRunner.dropColumn('linea', 'superlineaId');
    await queryRunner.dropTable('superlinea');
  }
}
