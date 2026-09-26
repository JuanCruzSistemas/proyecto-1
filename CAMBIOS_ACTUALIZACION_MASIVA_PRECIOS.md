# Actualización masiva de precios

## Objetivo

Documentar los cambios realizados en el flujo de actualización masiva de precios para CR-006, alineándolo con el modelo de dominio actual: cada producto tiene un único precio persistido.

## Comportamiento implementado

- La actualización puede aplicarse por porcentaje o por monto fijo.
- El porcentaje debe ser cero o positivo.
- El monto fijo puede ser positivo o negativo.
- El alcance puede ser global cuando no se selecciona una línea, o limitarse a una línea seleccionada.
- La búsqueda pagina en bloques de 500 hasta cargar todos los productos alcanzados.
- La previsualización y el guardado rechazan precios negativos.
- El backend valida todos los productos antes de comenzar a escribir. Las escrituras ocurren en una transacción; si una falla, se revierte el lote completo.
- El precio actualizado recalcula el margen del producto.
- Los endpoints masivos requieren autenticación y rol `Root`, `Administrador` o `Empleado`.
- No se implementó historial de precios; esa integración con CR-007 quedó fuera del alcance acordado.

## Restricción del dominio de margen

El margen existente admite valores de 0% a 100%. Por ello, al recalcularlo, el precio nuevo debe estar entre el costo y el doble del costo. Si el costo es cero, solo se admite precio cero.

Ejemplo para un producto con costo de $1.000: se acepta un precio entre $1.000 y $2.000; $900 y $2.100 se rechazan aunque sean precios positivos. Esta limitación es más restrictiva que el criterio de CR-006 que solo exige rechazar precios negativos.

## Archivos modificados

### Backend

- `Proyecto1_Back/proyecto/src/modules/gestion-productos/producto/application/dto/aplicar-cambios-masivos.dto.ts`: valida que el valor sea numérico, permite montos negativos y rechaza porcentajes negativos.
- `Proyecto1_Back/proyecto/src/modules/gestion-productos/producto/application/dto/aplicar-cambios-masivos.dto.spec.ts`: prueba validación de monto negativo, porcentaje negativo y monto no numérico.
- `Proyecto1_Back/proyecto/src/modules/gestion-productos/producto/application/use-cases/aplicar-cambio-masivo.use-case.ts`: calcula el único precio nuevo y valida que respete las reglas de precio y margen.
- `Proyecto1_Back/proyecto/src/modules/gestion-productos/producto/application/use-cases/guardar-cambio-masivo.use-case.ts`: valida el lote antes de persistir y ejecuta las actualizaciones dentro de una transacción con rollback.
- `Proyecto1_Back/proyecto/src/modules/gestion-productos/producto/application/use-cases/guardar-cambio-masivo.use-case.spec.ts`: prueba que no haya escrituras si falla la validación y que se revierta la transacción ante un fallo de persistencia.
- `Proyecto1_Back/proyecto/src/modules/gestion-productos/producto/domain/entities/producto.entity.ts`: recalcula el margen al cambiar el precio y conserva las restricciones actuales del dominio.
- `Proyecto1_Back/proyecto/src/modules/gestion-productos/producto/domain/entities/producto.entity.spec.ts`: prueba recálculo y rechazo de precios fuera del rango permitido sin mutar el producto.
- `Proyecto1_Back/proyecto/src/modules/gestion-productos/movimiento-stock/infraestructure/persistence/cambio-precios.controller.ts`: exige guardia de autenticación y roles autorizados en los endpoints masivos.
- `Proyecto1_Back/proyecto/src/main.ts`: elimina la impresión interna de rutas de Express al iniciar el servidor.

### Frontend

- `Proyecto1_Front/src/componentes/gestion-producto/precios/cambio-precios-masivo/cambio-precios-masivo-service.tsx`: dirige las consultas CRUD de lectura a `producto` y corrige el import de tipos; las llamadas PATCH siguen usando `cambio-precios`.
- `Proyecto1_Front/src/componentes/gestion-producto/precios/cambio-precios-masivo/hooks/useCambioPrecios.ts`: carga todas las páginas de productos y restablece `loading` en caso de éxito o error.
- `Proyecto1_Front/src/componentes/gestion-producto/precios/cambio-precios-masivo/componentes/filtros-cambio-precios.tsx`: conserva filtros de marca y línea; elimina sublínea, que no existe en el backend; permite monto negativo.
- `Proyecto1_Front/src/componentes/gestion-producto/precios/cambio-precios-masivo/util/cambio-precios-masivo.tsx`: adapta la grilla al precio único y presenta errores de búsqueda, cálculo y guardado.
- `Proyecto1_Front/src/componentes/gestion-producto/precios/cambio-precios-masivo/cambio-precios.manual.tsx`: adapta la edición manual a precio actual y precio nuevo.
- `Proyecto1_Front/src/componentes/herramientas/formateo-de-campos/porcentaje-input-simple.tsx`: agrega la opción `allowNegative`, utilizada únicamente para monto fijo.
- `Proyecto1_Front/src/interfaces/gestion-producto/producto/interfaces-producto.tsx`: actualiza el tipo de producto de la grilla para reflejar `costo`, `precio` y `precioNuevo`.
- `Proyecto1_Front/src/componentes/gestion-producto/precios/lista_precios/componentes/filtros-cambio-precios.tsx`: hace opcionales los callbacks de aplicar y guardar no utilizados por esa pantalla.
- `Proyecto1_Front/src/App.tsx`: elimina la ruta pública de `lista-precios`, que estaba duplicada e incompleta.
- `Proyecto1_Front/src/componentes/menu/menuItems-definicion.ts`: agrega el acceso a actualización masiva y alinea los roles del menú.
- `Proyecto1_Front/src/pages/administracion-page.tsx`: elimina el `FiltrosProvider` duplicado; permanece el provider raíz de `main.tsx`.

## Decisiones de alcance

- Se eligió alinear la interfaz al precio único del dominio; no se agregaron cuatro niveles de precios ni migraciones de base de datos.
- Se quitó el filtro de sublínea porque el backend no tiene entidad ni endpoint para esa jerarquía. Se mantiene el alcance requerido de línea/global.
- La ruta `lista-precios` quedó desactivada, pero sus archivos no se borraron.
- No se agregó historial de precios.
- Se mantuvo el rango actual del margen. Esto puede rechazar reducciones o aumentos positivos que la historia, por sí sola, no restringe.

## Verificación ejecutada

- `yarn --cwd Proyecto1_Back/proyecto build`: correcto.
- `yarn --cwd Proyecto1_Front build`: correcto. Vite muestra avisos existentes sobre la antigüedad de `caniuse-lite` y el tamaño del bundle.
- Pruebas focalizadas de entidad, DTO y guardado masivo: 3 suites, 21 pruebas exitosas.
- El chequeo de tipos filtrado no encontró errores en los archivos de actualización masiva después de las correcciones. El proyecto mantiene errores TypeScript en otros módulos que no forman parte de este cambio.

## Pendiente para cumplimiento literal de CR-006

Para que CR-006 quede completamente alineada con su texto original aún habría que decidir si el historial individual se incorpora mediante CR-007 y si se permite recalcular margen fuera del rango actual. Mientras esas reglas no cambien, el historial no se registra y los precios por debajo del costo o por encima de dos veces el costo se rechazan.