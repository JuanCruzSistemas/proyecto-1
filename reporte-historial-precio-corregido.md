# Reporte: Historial de precios corregido

**Rama:** `fix/historial-precio-front` (desde `develop`)
**Diagnóstico previo:** ver `REPORTE.md`

## Resultado

Ahora la tabla de productos (escritorio) tiene dos botones nuevos por fila:

- 🏷️ **Cambiar precio** (ámbar): abre el modal para actualizar costo y margen con un motivo.
- 🕘 **Historial de precios** (violeta): abre un modal con la tabla de cambios de precio del producto.

---

## Cambios por commit

### 1. `feat: agregar botones de cambio de precio e historial en la tabla de productos`

| Archivo | Cambio |
|---|---|
| `herramientas/reutilizables/action-button.tsx` | Nuevas variantes `price` y `history`. |
| `producto/componentes/producto-action.tsx` | Props opcionales `onCambioPrecios` y `onHistorial`. Cada botón solo aparece si recibe su handler. Se sacaron los íconos importados sin uso. |
| `producto/componentes/datos-tabla.tsx` | Acepta y reenvía esos dos handlers. Se ensanchó la columna de acciones para que entren los 5 botones. |
| `producto/utils/consultar-producto.tsx` | Ya no le pasa a `DatosTabla` props que no existen (`onMovimientos`, `onNotificar`). **Esto corrige el error TS2322 que antes pasaba desapercibido.** |

### 2. `fix: eliminar modales duplicados y usar el producto correcto en historial y cambio de precio`

| Archivo | Cambio |
|---|---|
| `producto/modales/producto-modales.tsx` | Se eliminaron los bloques duplicados: cada modal se renderiza una sola vez. Historial y cambio de precio ahora leen `productoInfo`, que es lo que cargan sus handlers, y solo abren si hay un `id`. Se corrigió `porcentajeActual`: leía `porcentajeGanancia`, que no existe, y ahora lee `porcentaje`. |
| `producto/modales/modal-historial-precios.tsx` | Se simplificó a un contenedor (cabecera + botón cerrar) que muestra `TablaHistorialPrecio`. Antes tenía su propia tabla con campos que no coincidían con el backend. |
| `producto/utils/consultar-producto.tsx` | Cerrar el historial ya no borra los filtros de búsqueda. |

### 3. `fix: alinear tabla de historial de precios con el DTO del backend`

| Archivo | Cambio |
|---|---|
| `producto/componentes/tabla-historial-precio.tsx` | El usuario se toma de `usuarioNombre`; antes leía `usuario.mail` y siempre mostraba "Sistema". El margen se multiplica por 100: el backend lo envía como fracción (`0.46`) y se mostraba "0.46%" en lugar de "46%". Se quitaron los campos que no existen en el DTO. |

---

## Verificación

- **Tests (`vitest`, módulo producto):** 64 pasan y 12 fallan. Antes fallaban 13.
  - Se arregló `ProductosModales > muestra los formularios…`, que fallaba justamente por los modales duplicados.
  - Hay 4 tests nuevos: los botones en `ProductoActions` y `DatosTabla`, que historial y cambio de precio se abran una sola vez, y que no se abran sin producto.
  - Los 12 que siguen fallando (`producto-service.test.ts` y `modal-cambiar-precio.test.tsx`) **ya fallaban antes** y no tienen que ver con estos cambios: en el entorno de test `localStorage` es `undefined`.
- **TypeScript:** ninguno de los archivos modificados tiene errores nuevos. El total del front bajó de 123 a 122; los que quedan son de otros módulos.
- **Falta probar en el navegador:** abrir el historial de un producto con cambios de precio registrados.

## Pendiente (fuera de este fix)

- **Móvil:** las acciones de `datos-card.tsx` siguen comentadas, así que el historial solo está disponible en escritorio.
- **Movimientos de stock y alternativos:** tienen handlers y flags, pero ningún modal los renderiza.
- **Notificar en escritorio:** `onNotificar` solo existe en la vista móvil (card).
- **Tests con `localStorage`:** hay que configurar el entorno de `vitest` (por ejemplo `environment: "jsdom"` o un setup file) para arreglar los 12 tests que fallan.
- **Tipos en el build:** conviene sumar `tsc --noEmit` al build o al lint para que estos errores no vuelvan a pasar desapercibidos. Antes hay que resolver los ~122 errores que ya existen.

---

## Corrección 2: los cambios masivos no aparecían en el historial

**Rama:** `fix/historial-precio-masivo`

**Problema:** el guardado masivo (`PATCH /cambio-precios/guardar-cambios`, en `guardar-cambio-masivo.use-case.ts`) actualizaba los precios pero **no creaba ningún registro de historial**. Solo el cambio individual lo hacía. El test e2e CR-006 **CA4** ya lo marcaba como hallazgo.

**Solución (solo backend):**

| Archivo | Cambio |
|---|---|
| `producto/application/use-cases/guardar-cambio-masivo.use-case.ts` | Por cada producto se crea un `HistorialPrecio` con los valores anteriores y nuevos, y se guarda **en la misma transacción** que el precio: si algo falla, no se guarda nada. El motivo es fijo: *"Actualización masiva de precios"*. |
| `guardar-cambio-masivo.use-case.spec.ts` | Nuevo test: se registra un historial por producto, con el motivo y los valores anteriores correctos. |
| `test/cr-006-cambio-masivo.e2e-spec.ts` | Se adaptó la parte de mocks a la nueva dependencia y ahora verifica que se guardan los historiales. |

**Qué muestra el historial en un cambio masivo:** cambian el precio y el margen; **el costo queda igual**, porque el cambio masivo no lo modifica.

**Verificación:**
- **Tests unitarios del módulo producto:** 515 pasan (1 nuevo) y 4 fallan. Esos 4 **ya fallaban antes** (`update-precio.use-case.spec.ts` y `find-historial-precio.use-case.spec.ts`).
- **Tests con mocks del e2e CR-006:** pasan.
- **Pendiente:** correr el CA4 contra la base de datos y probarlo en el navegador.
