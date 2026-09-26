# Testing — Persona 4: Línea y Presentación frontend

## Alcance

Este bloque cubre el módulo completo de **Línea** en backend y frontend, y el frontend de **Presentación**. La estrategia prioriza reglas de negocio por encima de comprobaciones de existencia de clases o endpoints.

No incluye el backend de Presentación, que corresponde a la Persona 5, ni el catálogo completo de SuperLíneas, que corresponde a la Persona 2. Línea consume SuperLínea porque su asociación es una regla del CR-003.

## Herramientas

| Área | Herramienta | Objetivo |
|---|---|---|
| Backend unitario | Jest | Entidades, validadores y casos de uso aislados con dependencias simuladas. |
| Backend HTTP/E2E | Jest + Supertest | Ejecutar la aplicación Nest con pipes, guard, controlador y base configurada. |
| Frontend | Vitest + React Testing Library + user-event | Validaciones Yup y acciones visibles de formularios/filtros. |
| Cobertura | Jest / proveedor V8 de Vitest | Medir líneas, funciones y ramas ejecutadas. |

## Archivos de prueba

### Backend unitario

| Archivo | Reglas cubiertas |
|---|---|
| `linea/domain/entities/linea.entity.spec.ts` | Denominación obligatoria, stock mínimo no negativo, asociación a SuperLínea, actualización atómica y baja lógica. |
| `linea/application/use-cases/create-linea.use-case.spec.ts` | Unicidad, SuperLínea activa y no persistir ante rechazo. |
| `linea/application/use-cases/update-linea.use-case.spec.ts` | Conservación/cambio de asociación, SuperLínea inválida, duplicados e inexistencia. |
| `linea/application/use-cases/remove-linea.use-case.spec.ts` | Bloqueo de baja con productos activos, baja lógica y usuario/Línea inexistentes. |
| `linea/application/use-cases/find-linea.use-case.spec.ts` | Mapeo, búsqueda paginada y asociación expuesta al frontend. |
| `linea/infraestructure/validators/linea-uniqueness.validator.spec.ts` | Normalización y duplicidad incluso frente a registros dados de baja. |
| `linea/domain/services/politica-eliminacion-linea.service.spec.ts` | Consulta de productos activos antes de eliminar. |
| `linea/.../controllers/linea.controller.spec.ts` | Delegación de operaciones y parámetros del controlador. |

### Backend E2E

`Proyecto1_Back/proyecto/test/cr-003-linea.e2e-spec.ts` realiza estas operaciones contra Nest y MySQL:

1. Rechaza crear una Línea sin SuperLínea.
2. Crea una Línea vinculada a una SuperLínea activa.
3. Impide repetir su denominación normalizada.
4. Edita atributos sin perder la asociación.
5. Hace baja lógica cuando no hay productos activos.

El test crea una Línea única por ejecución y la elimina al final. Necesita una SuperLínea activa, el usuario administrador de los seeds y la base local levantada.

### Frontend

| Archivo | Comportamiento cubierto |
|---|---|
| `linea/interfaces/interfaces-validaciones-linea.test.tsx` | SuperLínea obligatoria/válida, nombre, stock crítico y carga de edición. |
| `linea/services/linea-service.test.tsx` | Asociación visible entre Línea y SuperLínea, incluida la respuesta ante una asociación ausente. |
| `presentacion/interfaces/interfaces-validaciones-presentacion.test.tsx` | Nombre obligatorio, caracteres admitidos, límite y carga de edición. |
| `herramientas/reutilizables/filtros-simple.test.tsx` | Abrir filtro, buscar con botón/Enter, limpiar e incluir eliminados. Línea y Presentación reutilizan ese componente. |

## Matriz de criterios

| ID | Escenario | Nivel |
|---|---|---|
| L-01 | Crear Línea con SuperLínea activa | Caso de uso + E2E |
| L-02 | Rechazar Línea sin SuperLínea | Formulario + E2E |
| L-03 | Rechazar SuperLínea inválida o dada de baja | Caso de uso |
| L-04 | Cambiar SuperLínea y conservar el cambio | Entidad + caso de uso |
| L-05 | Nombre vacío, solo espacios, duplicado | Entidad + validador + formulario |
| L-06 | Stock mínimo negativo y stock cero | Entidad + formulario |
| L-07 | No eliminar Línea con productos activos | Caso de uso |
| L-08 | Baja lógica de Línea sin productos activos | Entidad + caso de uso + E2E |
| L-09 | Buscar, paginar y ver SuperLínea asociada | Caso de uso + filtro frontend |
| P-01 | Presentación vacía o inválida | Formulario frontend |
| P-02 | Presentación válida y carga en edición | Formulario frontend |

## Ejecución

### Unitarios de Línea

Desde `Proyecto1_Back/proyecto`:

```powershell
npm.cmd test -- linea
```

### Todos los unitarios del backend con cobertura

```powershell
npm.cmd run test:cov
```

### E2E de Línea

Antes: MySQL levantado, migraciones ejecutadas y seeds disponibles. Desde `Proyecto1_Back/proyecto`:

```powershell
npm.cmd run test:e2e -- cr-003-linea
```

Si el usuario seed o la contraseña local son distintos, definir `E2E_MAIL` y `E2E_PASSWORD` para esa terminal. No exponer esas credenciales en documentación ni Git.

### Frontend

Desde `Proyecto1_Front`:

```powershell
yarn test
yarn test:watch
yarn test:coverage
```

El reporte HTML se genera en `Proyecto1_Front/coverage/index.html`. El de Jest se genera en `Proyecto1_Back/proyecto/coverage/lcov-report/index.html`.

## Cobertura propuesta para el informe del grupo

El grupo propone automatizar al menos el 80 % de los criterios de aceptación del alcance y el 100 % de las reglas críticas: datos inválidos, asociaciones obligatorias, duplicados, bajas protegidas, cálculos y consistencia de cambios. Como métrica técnica complementaria, se propone alcanzar al menos 80 % de líneas y funciones y 70 % de ramas en los módulos asignados.

Se justifica un umbral de ramas menor porque las alternativas de error y permisos generan combinaciones extensas; aun así, cada regla crítica debe cubrir tanto el caso válido como el rechazo principal. La cobertura de código no se interpreta como garantía de calidad: se complementa con Supertest para los flujos HTTP y pruebas manuales del checklist end-to-end.

### Medición inicial de esta entrega

Al ejecutar las 23 pruebas frontend de este bloque, los archivos directamente cubiertos alcanzan 100 % de líneas y funciones en `interfaces-validaciones-presentacion.tsx` y `linea-service.tsx`; el esquema de Línea alcanza 100 % de líneas y funciones, con 75 % de ramas. El total del directorio asignado es menor (3,77 % de líneas) porque el reporte incluye además vistas, tablas, modales, hooks y utilidades que todavía no cuentan con pruebas. Por eso este valor **no debe declararse como cobertura final del grupo**: es la línea base desde la que se agregarán pruebas de componentes.

## Límites conocidos

- Las pruebas E2E usan la base indicada por `.env`; para una entrega formal conviene definir una base exclusiva de testing.
- La prueba de bloqueo por productos activos está aislada con mocks en el caso de uso. Debe complementarse con una prueba de integración MySQL cuando el equipo disponga de base de testing.
- Los campos visuales y el diseño responsivo se verifican manualmente; React Testing Library cubre la interacción funcional.
