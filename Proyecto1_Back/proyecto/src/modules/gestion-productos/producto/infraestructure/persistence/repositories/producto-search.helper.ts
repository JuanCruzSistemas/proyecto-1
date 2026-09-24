import { SelectQueryBuilder } from 'typeorm';
import { ProductoEntity } from '../entities/producto.orm-entity';

/** Cada campo completo agrega una condición AND. Los comodines se buscan literalmente. */
export function aplicarBusquedaParcial(
  query: Pick<SelectQueryBuilder<ProductoEntity>, 'andWhere'>,
  filtros: { denominacion?: string; lineaDenominacion?: string; superlineaDenominacion?: string },
): void {
  const campos = [
    ['denominacion', 'producto.denominacion'],
    ['lineaDenominacion', 'linea.denominacion'],
    ['superlineaDenominacion', 'superlinea.denominacion'],
  ] as const;
  for (const [parametro, columna] of campos) {
    const texto = filtros[parametro]?.trim();
    if (!texto) continue;
    const literal = texto.replace(/[!%_]/g, caracter => '!' + caracter);
    query.andWhere(
      `UPPER(${columna}) LIKE UPPER(:${parametro}) ESCAPE '!'`,
      { [parametro]: '%' + literal + '%' },
    );
  }
}
