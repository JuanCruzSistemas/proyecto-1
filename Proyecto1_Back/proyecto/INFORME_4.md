# Informe de tests — CR-007 (historial de precios)

**Archivo:** `test/cr-007-historial-precio.e2e-spec.ts`. Es un único archivo; no se modificó nada en `src`.

**Resultado:** 21 de 25 tests pasan. Los 4 que fallan son hallazgos y **se dejaron en rojo a propósito**. El resultado se verificó estable en varias corridas.

```bash
# Requiere la base de desarrollo levantada (yarn docker:up)
yarn test:e2e cr-007
# Si la contraseña del admin del seed cambió en tu base local:
E2E_MAIL=administrador@gmail.com E2E_PASSWORD=12345678 yarn test:e2e cr-007
```

## Qué cubre

- **Parte 1, unitaria** (repositorios y DataSource mockeados, entidades reales):
  - `UpdatePrecioUseCase`: registro con los valores anteriores y nuevos, transacción, rollback si falla el historial, historial no se intenta si falla el precio.
  - `UpdatePrecioDto`.
  - `HistorialPrecioMapper`: escala del margen en ida y vuelta.
- **Parte 2, e2e** (app configurada igual que `main.ts`, base real):
  - Crea su propio producto (marca y línea reales, costo 100, margen 30 %).
  - Usa las rutas reales `PATCH /api/producto/:id/precio` y `GET /api/producto/:id/historial-precio`.
  - Limpieza: el `afterAll` da de baja el producto (el historial queda asociado a él). Se verificó que no quedan datos activos.

| Caso | Resultado real |
|---|---|
| CA1: cambio con motivo | ✅ **200** y un registro con precio (130→150), costo, margen (0.3→0.5), motivo, fecha y usuario |
| CA2: costo 0 o negativo, porcentaje negativo | ✅ **400** (DTO): "El costo debe ser mayor a 0" / "El porcentaje debe ser un número positivo o 0" |
| CA2: margen > 100 % | ✅ **422** (dominio, `MargenInvalidoException`); no se registra nada |
| CA3: cambios separados en el tiempo | ✅ se listan del más reciente al más antiguo |
| CA3: dos cambios en el mismo segundo | ❌ **quedan en orden invertido** |
| CA4: sin motivo o motivo `""` | ✅ **400** "El motivo es obligatorio" |
| CA4: motivo `"   "` (solo espacios) | ❌ **se acepta (200)** y queda registrado un motivo en blanco |
| Transacción real: falla el INSERT del historial | ✅ el precio del producto **no cambia** y no queda registro (rollback) |

## Cuidados específicos

| # | Cuidado | Estado | Evidencia |
|---|---|---|---|
| 1 | Escala del margen (fracción ↔ %) | **Correcto**: `*100` al guardar y `/100` al leer, columna `decimal(5,2)`. 35,5 % se guarda y se lee sin error | unit "ida y vuelta" y e2e "margen de 35,5 %" |
| 2 | `PresentacionRequeridaException` al cambiar precio (CR-005) | **Vigente en el código, sin impacto hoy**: el caso de uso regenera la denominación. Un producto sin presentación y con denominación automática no puede cambiar de precio (422). Hoy no hay productos así en la base, y la API no permite crearlos | unit "cuidado 2" |
| 3 | El cambio masivo (CR-006) no registra historial | **Vigente** ❌: después de `guardar-cambios` el historial no crece | e2e "cuidado 3" |

## Diferencias con lo documentado por el equipo

1. **Motivo obligatorio incompleto (CA4):** el DTO usa `@IsNotEmpty`, que acepta `"   "`, y ni el dominio ni `HistorialPrecio` validan el motivo. Queda registrado un cambio sin motivo real.
2. **El orden no es confiable dentro del mismo segundo (CA3):** `fecha` es `timestamp` sin fracciones de segundo, y el repositorio ordena solo por `fecha DESC`. Dos cambios en el mismo segundo empatan y salen en orden inverso. Se arregla ordenando también por `id` o usando `timestamp(3)`.
3. **Motivo sin límite de largo:** el DTO no tiene `MaxLength`, pero la columna es `varchar(500)`. Un motivo largo hace fallar el guardado del historial con un error de base (5xx) en lugar de un 400. La transacción sí funciona: el precio no queda modificado.
4. **CA2 no recibe un "precio":** el endpoint recibe `costo` y `porcentaje`, así que un precio ≤ 0 no se puede enviar. Lo que se valida es costo > 0 y porcentaje ≥ 0 (DTO), y margen ≤ 100 % (dominio).
5. **Escala del margen en la API:** el historial devuelve el margen como fracción (0.355), pero el producto lo devuelve como porcentaje (35.5). No es un error de datos, pero la misma magnitud se expone en dos escalas distintas.
6. **Confirmado sin diferencias:** las rutas documentadas son las reales; el precio y el historial se guardan en la misma transacción (Unit of Work), y el rollback se verificó contra la base real.
