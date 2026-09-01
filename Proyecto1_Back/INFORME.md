# Informe de dependencias — Proyecto1_Back

Fecha: 2026-08-31

## Alcance

Se analizaron las dependencias del proyecto en busca de **librerías faltantes que provoquen fallas de compilación** (`nest build` / `tsc`). No se ejecutó ningún comando de instalación.

## Método

1. Extracción de todos los imports/`require` usados en `src/` y `test/` y verificación de que cada paquete externo esté declarado en `package.json` y presente en `node_modules`.
2. Verificación cruzada de todas las dependencias listadas en `package.json` (`dependencies` + `devDependencies`) contra el contenido real de `node_modules`.
3. `npx tsc --noEmit -p tsconfig.json` y `npm run build` (`nest build`) para detectar errores de resolución de módulos (`Cannot find module`, `has no exported member`, etc.).
4. `npm ls --all` para detectar `UNMET DEPENDENCY` no opcionales.

## Resultado: no hay dependencias faltantes

- Todos los paquetes importados en el código (`@nestjs/*`, `bcrypt`, `body-parser`, `class-transformer`, `class-validator`, `express`, `google-auth-library`, `nodemailer`, `rxjs`, `supertest`, `typeorm`, etc.) están declarados en `package.json` y presentes en `node_modules`.
- Todas las dependencias declaradas en `package.json` (`dependencies` y `devDependencies`) están instaladas en `node_modules` y resuelven correctamente (verificado archivo por archivo, incluyendo casos con `exports` restrictivo como `@nestjs/jwt`, `reflect-metadata` y `typeorm`, que inicialmente parecían "no resueltos" con `require.resolve` pero están completos).
- `npx tsc --noEmit` y `npm run build` **no arrojaron ningún error de tipo `Cannot find module` / `has no exported member`**. Es decir, ningún error de compilación se origina en un paquete ausente.
- `npm ls --all` solo reporta `UNMET OPTIONAL DEPENDENCY` (binarios nativos de otras plataformas — `sharp`, `@swc/core`, drivers opcionales de `typeorm` como `pg`, `mongodb`, `sqlite3`, etc. — y paquetes opcionales de Jest/Watchpack). Son opcionales por diseño de esos paquetes y **no afectan la compilación** en este entorno.

## Nota: falla de compilación existente (no es un problema de dependencias)

`nest build` sí falla actualmente, pero por un **error de tipos en el código**, no por una librería ausente:

- `src/modules/gestion-usuario/auth/application/services/auth.service.ts` (líneas 83, 86, 159, 162)
- `src/modules/gestion-usuario/auth/auth.module.ts` (línea 20)

`JwtService.sign()` / `JwtModuleOptions.signOptions.expiresIn` (tipado por `@types/jsonwebtoken@9.0.10`) espera `number | StringValue` (una unión de literales tipo `"1h"`, `"30m"`, etc.), pero el código pasa un `string` genérico obtenido de `configService.get<string>(...)`. Es un desajuste de tipos en el código de la aplicación, no una dependencia faltante — todos los paquetes involucrados (`@nestjs/jwt`, `jsonwebtoken`, `@types/jsonwebtoken`) están correctamente instalados.

Se menciona porque es la única causa real de falla de `npm run build` hoy, para que no se confunda con un problema de dependencias.

## Riesgo detectado: cambio de gestor de paquetes (npm → yarn)

No es una "librería faltante" en el sentido estricto, pero es relevante para evitar fallas de build en otros entornos (CI, otra máquina, `npm ci`):

- `package-lock.json` fue **eliminado** (visible en `git status` para `Proyecto1_Back`, `Proyecto1_Front` y la raíz del monorepo).
- Apareció un `yarn.lock` nuevo (no versionado aún) en los tres niveles.
- `node_modules` está presente y funcional localmente, pero si algún entorno (por ejemplo, CI o Docker) usa `npm ci`, **fallará** porque ya no existe `package-lock.json`. Habría que decidir de forma consistente si el proyecto usa npm o yarn, y actualizar scripts/Dockerfile/CI en consecuencia.

## Conclusión

No se detectaron dependencias faltantes que provoquen fallas de compilación. El único build failure actual es un bug de tipado en `auth.service.ts` / `auth.module.ts` (no relacionado a paquetes ausentes). Se recomienda además resolver la inconsistencia npm/yarn antes de que provoque una falla de build en un entorno limpio (sin `node_modules` local).
