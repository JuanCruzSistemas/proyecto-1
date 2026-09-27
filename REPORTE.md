# Reporte: Historial de precios no aparece en el front

**Rama analizada:** `develop` (commit `21a2ea2`)
**Resumen:** el backend funciona bien. El problema está en el front: **no hay ningún botón que abra el historial**, y aunque lo hubiera, el modal se abriría con datos incorrectos. No se ve ningún error porque Vite no chequea tipos: la app levanta igual aunque TypeScript tenga errores.

Todas las rutas son relativas a `Proyecto1_Front/src/componentes/gestion-producto/producto/`.

---

## 1. Faltan los botones (causa principal)

| Archivo | Problema |
|---|---|
| `componentes/producto-action.tsx` | Solo tiene 3 botones: Info, Editar y Eliminar. Importa los íconos `Tag` y `History` pero nunca los usa. |
| `componentes/datos-tabla.tsx` | Sus props no incluyen `onHistorial` ni `onCambioPrecios`, así que no se los pasa a `ProductoActions`. |
| `utils/consultar-producto.tsx:588` | Le pasa `onHistorial`, `onCambioPrecios`, `onMovimientos` y `onNotificar` a `DatosTabla`, que no los acepta. **Es el error silencioso** (TS2322). |
| `componentes/datos-card.tsx` | En móvil, las acciones están comentadas. |

## 2. El modal recibe el producto equivocado

- En `consultar-producto.tsx`, `handleMostrarHistorialPrecios` y `handleMostrarCambioPrecios` guardan el producto en **`productoInfo`**.
- `producto-modales.tsx` lee **`productoSeleccionado`**, que solo se llena al editar. Como su valor inicial es `{}`, el modal abre con `id` undefined:
  - el historial muestra "No hay registros" o se queda en "Cargando…" para siempre;
  - el cambio de precio se envía sin id.

## 3. `modales/producto-modales.tsx` quedó duplicado

Parece un merge mal resuelto en el commit `b72abfe`:

- Los modales de Alta, Actualizar, Auditoría y Cambiar Precio aparecen **dos veces**, así que se abren dos modales superpuestos.
- El historial se renderiza con **dos componentes distintos a la vez**: `ModalHistorialPrecios` y `TablaHistorialPrecio`.

## 4. Los campos del front no coinciden con los del backend

El backend devuelve: `precioAnterior/Nuevo`, `costoAnterior/Nuevo`, `margenAnterior/Nuevo`, `motivo`, `fecha`, `usuarioNombre`, `usuarioId`.

- `modales/modal-historial-precios.tsx` lee `costo` y `porcentajeGanancia`, que no existen, así que mostraría `$NaN` y "-".
- `componentes/tabla-historial-precio.tsx` lee `usuario.mail`, que tampoco existe, así que siempre muestra "Sistema". Además, el margen llega como fracción (`0.46`) y se muestra como "0.46%" en lugar de "46%".

## 5. Menores

- Al cerrar el historial se ejecuta `limpiarFiltros()`, así que se pierden los filtros de búsqueda.
- Los modales de movimientos de stock y de alternativos reciben sus flags, pero no hay nada que los renderice.
- `npx tsc --noEmit -p tsconfig.app.json` marca **123 errores** en todo el front, y ninguno se ve al correr la app.

---

## Qué hay que hacer

1. Agregar los botones **Historial** y **Cambiar precio** en `producto-action.tsx` y pasar esas props desde `datos-tabla.tsx`.
2. Borrar los bloques duplicados de `producto-modales.tsx` y dejar un solo componente para el historial. Recomendamos `TablaHistorialPrecio`, que es el que más se acerca al DTO.
3. Unificar `productoInfo` y `productoSeleccionado` en los handlers de historial y cambio de precio.
4. Ajustar los campos: `usuarioNombre` y margen × 100.
5. Opcional: habilitar las acciones en móvil y agregar `tsc --noEmit` al build para que estos errores no pasen desapercibidos.
