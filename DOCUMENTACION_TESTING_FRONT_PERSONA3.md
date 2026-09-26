# Testing automatizado frontend: Persona 3

## Alcance

Este documento describe el testing automatizado realizado para el alcance de Persona 3:

- `Proyecto1_Front/src/componentes/gestion-producto/producto/`
- `Proyecto1_Front/src/componentes/gestion-producto/precios/`

Se trabajó con Vitest, jsdom y React Testing Library. Los tests montan componentes reales cuando corresponde y reemplazan sus fronteras externas (por ejemplo, servicios HTTP, autenticación o contextos) para comprobar comportamientos visibles sin depender del backend.

La cobertura se limita a esas dos carpetas; no representa la cobertura de todo el frontend.

## Estado verificado

En la última ejecución completa registrada:

- **34 archivos de test/suites**.
- **114 tests exitosos**.
- **70,23% de cobertura de líneas** para el alcance de Persona 3.
- El build de producción del frontend terminó correctamente.
- ESLint terminó correctamente para el setup y los tests nuevos revisados.

Vitest tiene configurado un umbral mínimo de **70% de líneas** para este alcance. La configuración no exige actualmente 70% de ramas, funciones o statements. Una nueva ejecución completa debe volver a pasar ese umbral; si baja, Vitest reportará fallo.

## Qué cubren los tests

### Producto

- Formato de precios y cantidades, incluyendo casos numéricos y valores inválidos.
- Permisos de producto para roles permitidos y denegados.
- Esquemas de validación de producto y de relaciones (proveedores y productos alternativos).
- Cálculo de precios y comportamiento de controles de edición.
- Carga de catálogo, búsqueda normal y rápida, filtros y paginación.
- Éxito y error de llamadas al servicio de producto.
- Historial de precios: carga, estado vacío, ordenamiento y fallo de servicio.
- Acciones de producto, selección/configuración de catálogos y renderizado de tarjetas/tablas.
- Modal de cambio de precio, incluidos validación, actualización exitosa y fallo de API.
- Alta de proveedores y productos alternativos, rechazo de duplicados y eliminación.

### Precios

- Cambio masivo: filtros por marca/línea, tipo porcentaje/monto, monto negativo, botones deshabilitados sin productos y errores de interacción.
- Hook de cambio masivo: carga paginada, aplicación, guardado, actualización local y fallos de API/loading.
- Pantalla de cambio masivo: búsqueda, previsualización, guardado, alertas, edición y eliminación.
- Edición manual: validación y resultado del cambio.
- Servicios de cambio masivo y lista de precios: requests, payloads, token y propagación de errores.
- Lista de precios heredada: búsqueda, limpieza, impresión y error de catálogo. La ruta sigue desactivada en el router; los tests verifican el código fuente sin reactivar la pantalla.
- Importaciones: validaciones de cotización y archivo, formularios IVECO/Nex-Pro, páginas, comparación y carga de archivos.

## Ubicación de los tests

Hay 34 archivos de test repartidos entre `producto/` y `precios/`. Los casos representativos para revisar son:

- `Proyecto1_Front/src/componentes/gestion-producto/producto/utils/formato-precio.test.ts`
- `Proyecto1_Front/src/componentes/gestion-producto/producto/utils/calculo-precio-productos.test.tsx`
- `Proyecto1_Front/src/componentes/gestion-producto/producto/interfaces/validaciones-producto.test.ts`
- `Proyecto1_Front/src/componentes/gestion-producto/producto/services/producto-service.test.ts`
- `Proyecto1_Front/src/componentes/gestion-producto/producto/utils/consultar-producto.test.tsx`
- `Proyecto1_Front/src/componentes/gestion-producto/producto/modales/modal-cambiar-precio.test.tsx`
- `Proyecto1_Front/src/componentes/gestion-producto/producto/utils/registrar-items-relacionados.test.tsx`
- `Proyecto1_Front/src/componentes/gestion-producto/precios/cambio-precios-masivo/hooks/useCambioPrecios.test.tsx`
- `Proyecto1_Front/src/componentes/gestion-producto/precios/cambio-precios-masivo/util/cambio-precios-masivo.test.tsx`
- `Proyecto1_Front/src/componentes/gestion-producto/precios/cambio-precios-masivo/cambio-precios.manual.test.tsx`
- `Proyecto1_Front/src/componentes/gestion-producto/precios/importacion-precios-forms.test.tsx`
- `Proyecto1_Front/src/componentes/gestion-producto/precios/importacion-precio-pages.test.tsx`

## Comandos de verificación

Ejecutar desde cualquier directorio usando las rutas desde la raíz del workspace:

```powershell
# Suite completa y gate de cobertura
yarn --cwd Proyecto1_Front test --coverage

# Build de producción
yarn --cwd Proyecto1_Front build

# Lint de los tests (ejemplo; se puede pasar una lista de archivos)
yarn --cwd Proyecto1_Front eslint src/componentes/gestion-producto/producto/utils/formato-precio.test.ts src/componentes/gestion-producto/precios/cambio-precios-masivo/hooks/useCambioPrecios.test.tsx
```

## Comandos para capturas de tests

Para que la terminal muestre cada caso con nombre y resultado, ejecutar los siguientes comandos individualmente. Usa `--reporter=verbose` y no agregues `--silent` para que la salida sea visible.

```powershell
# Reglas de formato: casos válidos e inválidos
yarn --cwd Proyecto1_Front test --reporter=verbose src/componentes/gestion-producto/producto/utils/formato-precio.test.ts

# Esquema del producto: validación de éxito y rechazo
yarn --cwd Proyecto1_Front test --reporter=verbose src/componentes/gestion-producto/producto/interfaces/validaciones-producto.test.ts

# Cálculo visual de precios y controles del formulario
yarn --cwd Proyecto1_Front test --reporter=verbose src/componentes/gestion-producto/producto/utils/calculo-precio-productos.test.tsx

# Cambio masivo: paginación, cálculo, guardado y fallos
yarn --cwd Proyecto1_Front test --reporter=verbose src/componentes/gestion-producto/precios/cambio-precios-masivo/hooks/useCambioPrecios.test.tsx

# Pantalla masiva: flujo de usuario y manejo de errores
yarn --cwd Proyecto1_Front test --reporter=verbose src/componentes/gestion-producto/precios/cambio-precios-masivo/util/cambio-precios-masivo.test.tsx

# API de producto: rutas, headers, payloads y errores
yarn --cwd Proyecto1_Front test --reporter=verbose src/componentes/gestion-producto/producto/services/producto-service.test.ts
```

Al terminar cada comando, Vitest muestra el nombre de las pruebas aprobadas, el total de tests y el resultado de la suite; esa salida se puede capturar directamente desde la terminal integrada de VS Code.

## Notas

- El valor de 70,23% corresponde a la última ejecución completa registrada; cualquier cambio en fuentes o tests puede modificarlo. Repetir `test --coverage` es la forma de obtener el valor vigente.
- Se probaron comportamientos del frontend. La transacción y reglas de dominio del backend pertenecen a las pruebas Jest del backend y no forman parte de este porcentaje.
- La cobertura es útil para orientar el testeo, pero no sustituye la revisión de escenarios de negocio ni garantiza por sí sola que todos los casos de aceptación estén probados.
