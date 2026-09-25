# Tests e2e CR-002 / CR-005 — cambios y hallazgos

## Resultado

```
yarn test:e2e
PASS test/app.e2e-spec.ts
PASS test/cr-002-presentacion.e2e-spec.ts            (9 tests)
PASS test/cr-005-denominacion-automatica.e2e-spec.ts  (6 tests)
Test Suites: 3 passed, 3 total
Tests:       16 passed, 16 total
```

Corren contra la app completa (`AppModule`) y la base MySQL de desarrollo (Docker, puerto 3310). No hay mocks.

### Cómo correrlos

1. Levantar la base: `yarn docker:up` (desde la raíz del repo).
2. Correr `yarn test:e2e` desde `Proyecto1_Back/proyecto`.

Por defecto el login usa el admin del seed (`admin@gmail.com` / `Administrador1?`). Si en tu base local cambió esa contraseña, podés pasar otro usuario con rol Administrador:

```bash
E2E_MAIL=administrador@gmail.com E2E_PASSWORD=12345678 yarn test:e2e
```

Esto hizo falta en la base donde se probó: la contraseña de `admin@gmail.com` ya no era la del seed. En cambio, la de `administrador@gmail.com` (seed-organizacion) sí coincidía. `E2E_LOGS=1` muestra los logs de Nest, que por defecto quedan apagados.

---

## 1. Configuración de Jest e2e

**`test/jest-e2e.json`**: se agregó

```json
"moduleNameMapper": { "^src/(.*)$": "<rootDir>/../src/$1" }
```

Con eso, los imports absolutos `src/...` que usa el proyecto ya se resuelven y la app bootea. Con el mapper alcanzó; no hizo falta pasar esos imports a rutas relativas. El scaffold `app.e2e-spec.ts` pasa.

## 2. Helper compartido: `test/helpers/e2e-app.ts` (nuevo)

- **`crearAppComoMain()`** arranca la app igual que `bootstrap()` en `src/main.ts`: mismo `ValidationPipe`, prefijo `api` y filtros globales **en el mismo orden**. Un `TestingModule` no ejecuta `main.ts`, así que cualquier diferencia hace que los tests prueben algo distinto de producción. Los borradores registraban los filtros en orden inverso al de `main.ts`, y justamente eso ocultaba el bug de la sección 4.
- **`login()`** lee las credenciales de `E2E_MAIL` / `E2E_PASSWORD` y, si faltan, usa las del seed. Si el login falla, lo informa con un error claro.
- Búsquedas para obtener ids a partir de la denominación, porque POST y PUT de Presentación y de Producto no devuelven el id.
- **`limpiarDatosDePrueba()`** hace la limpieza robusta (ver sección 5).

## 3. Correcciones en los tests

Cada cambio se verificó contra el código real.

| Problema en el borrador | Realidad del código | Corrección |
|---|---|---|
| Status de `POST /auth/login` (se dudaba entre 200 y 201) | Es un `@Post` sin `@HttpCode`, así que responde **201** | Se verifica 201 en el helper |
| Denominación `test-cr002-<ts>` | `CreatePresentacionDto` solo acepta `[A-Za-z0-9 áéíóúñ]`, así que con guiones responde **400** | Se usa `test cr002 <ts>` |
| Se esperaba la denominación tal cual se envió | El DTO la pasa a minúsculas y `NormalizeDenominacionPipe` la guarda en **MAYÚSCULAS** | Se compara contra `toUpperCase()` |
| `res.body.id` después de `POST /presentacion` y `POST /producto` | Los dos devuelven solo `{ mensaje }` | El id se busca con `GET /presentacion?denominacion=` y `GET /producto/search-by?denominacion=` |
| `res.body.observacion` después de `PUT /presentacion/:id` | También devuelve solo `{ mensaje }` | Se verifica con `GET /presentacion/:id` |
| `marcas.body[0].id` | Los selectores devuelven `{ data, total }` | Se usa `body.data`, filtrando `sistema !== 1` |
| DELETE con body `{ usuarioDeletedId }` | El controller lee `@Query('usuarioId')`; el body se ignora | Se usa `?usuarioId=<id>` |
| `usuarioCreatedId: 1` fijo | El id depende del usuario logueado | Se toma de `login().usuario.id` |
| CA2 comparaba contra `'denominacion editada a mano'` | Se guarda en mayúsculas y la denominación debe ser única en la tabla; un texto fijo choca en la segunda corrida | Texto con timestamp y comparación en mayúsculas |
| CA1 y CA3 solo verificaban "truthy" o "distinto de" | — | Se compara contra el texto exacto `MARCA LÍNEA PRESENTACIÓN` |
| CA4 comparaba el mensaje con una regex laxa | — | Se compara el mensaje exacto de `PresentacionRequeridaException` |

### Casos agregados

- **CR-002:**
  - `GET /presentacion/:id` después del alta.
  - Rechazo de caracteres inválidos (400).
  - Verificación de que la presentación queda **asociable** a un producto (el `GET` del producto la devuelve).
  - Después de la baja, ya no aparece en `/listado`.
- **CR-005:**
  - CA2 también cambia la Presentación de un producto con nombre manual y comprueba que la denominación **no** se regenera.
  - Nuevo caso: un producto con denominación automática se puede renombrar a mano en cualquier momento.
  - CA3 se separó en dos casos: cambiar la Presentación, y cambiar la Marca y la Línea.

## 4. Hallazgos en la aplicación (no se ajustaron los tests para taparlos)

### 4.1 Bug (corregido): toda `DomainException` respondía 500 en lugar de 422

`src/main.ts` registraba los filtros así:

```ts
app.useGlobalFilters(new DomainExceptionFilter(), new GlobalExceptionFilter());
```

Nest invierte el orden de los filtros globales (`router-exception-filters.js`: `filters.reverse()`) y usa el primero que coincide. Como `GlobalExceptionFilter` es `@Catch()` y atrapa todo, se evaluaba primero. Una `DomainException` no es `HttpException`, así que terminaba en **500**.

Esto afectaba a **todas** las excepciones de dominio del sistema, no solo a CA4: `PresentacionRequerida`, `CostoInvalido`, `MargenInvalido`, `PrecioInvalido`, `StockInvalido`, `MotivoRequerido` y `DenominacionRequerida`. `DomainExceptionFilter` nunca se ejecutaba.

- **Cómo se detectó:** CA4 recibió 500 contra el backend real. Al invertir el orden solo en el helper, pasó a 422, lo que confirmó la causa.
- **Arreglo (aprobado):** se invirtió el orden en `src/main.ts`, con un comentario que explica el motivo, y lo mismo en el helper de tests.

### 4.2 Observación (sin corregir): el campo `error` del 422 dice `"Error"`

`DomainExceptionFilter` responde `error: exception.name`, pero `DomainException` nunca asigna `this.name`, así que siempre sale `"Error"` y no, por ejemplo, `"PresentacionRequeridaException"`. El `message` sí es claro y específico, que es lo que pide CA4, así que el test verifica status y mensaje. Para corregirlo alcanza con agregar `this.name = new.target.name;` en el constructor de `DomainException`.

### 4.3 Observación (sin corregir): los selectores exigen `denominacion`

`GET /producto/find-all-for-marcas/select` y `.../find-all-for-lineas/select` responden 400 (`denominacion must be a string`) si no se manda el parámetro, aunque el controller lo trate como opcional (`const { denominacion = '' } = dto`). Con `?denominacion=` vacío funciona, y el front seguramente lo manda así. El problema es que `DenominacionBusquedaDto` no marca el campo con `@IsOptional()`.

## 5. Limpieza de datos de prueba

- Cada archivo registra los productos y presentaciones que crea, y el `afterAll` los da de baja por la API: primero productos y después presentaciones, porque una presentación con productos activos no se puede eliminar.
- Cada baja va en su propio `try/catch`: si una falla se sigue con las demás y se informa con `console.warn`. El `app.close()` está en un `finally`.
- **Verificado:** en la corrida en la que CA4 fallaba, la limpieza igual dejó **0** presentaciones y **0** productos de prueba activos.

**Limitación:** la API solo hace **baja lógica** (`deletedAt`). Las filas de prueba quedan en la tabla como eliminadas; no aparecen en listados ni bloquean nada, porque cada corrida usa denominaciones con timestamp. Si se quieren borrar físicamente de la base de desarrollo:

```sql
DELETE FROM producto     WHERE deletedAt IS NOT NULL
  AND (denominacion LIKE '%TEST CR00%' OR denominacion LIKE 'MANUAL CR005%' OR denominacion LIKE 'RENOMBRADO CR005%');
DELETE FROM presentacion WHERE deletedAt IS NOT NULL AND denominacion LIKE 'TEST CR00%';
```

(Revisar antes con un `SELECT`: puede haber `historial_precio` o movimientos de stock que referencien esos productos.)

## Archivos tocados

- `test/jest-e2e.json`: `moduleNameMapper`.
- `test/helpers/e2e-app.ts`: nuevo.
- `test/cr-002-presentacion.e2e-spec.ts`: reescrito sobre el helper.
- `test/cr-005-denominacion-automatica.e2e-spec.ts`: reescrito sobre el helper.
- `src/main.ts`: orden de los filtros globales (bug 4.1).
