# Proyecto Avanzada – Gestión de Productos e Inventario

## Índice
1. [Tecnologías utilizadas](#1-tecnologías-utilizadas)
2. [Arquitectura y estructura del repositorio](#2-arquitectura-y-estructura-del-repositorio)
3. [Comandos disponibles](#3-comandos-disponibles)
4. [Configuración del entorno local](#4-configuración-del-entorno-local)
5. [Variables de entorno](#5-variables-de-entorno)
6. [Acceso](#6-acceso)
7. [Pruebas básicas](#7-pruebas-básicas)
8. [Autores](#8-autores)

---

## 1. Tecnologías utilizadas

- **Frontend:** React + Vite
- **Backend:** TypeScript + NestJS + TypeORM
- **Base de datos:** MySQL 8 (local vía Docker / producción en [Aiven](https://aiven.io))
- **Gestor de paquetes:** Yarn
- **Contenedores (solo entorno local):** Docker / Docker Compose
- **Orquestación de scripts:** `package.json` raíz con [`concurrently`](https://www.npmjs.com/package/concurrently)

---

## 2. Arquitectura y estructura del repositorio

El sistema se compone de un frontend web (SPA) que se comunica vía HTTP/API directamente con el backend. El backend expone una API REST construida con NestJS y usa TypeORM para mapear la base de datos MySQL.

```
proyecto-avanzada/
├── package.json              # scripts raíz (ver sección 3)
├── Proyecto1_Back/
│   └── proyecto/
│       ├── src/
│       ├── docker-compose.yml
│       └── package.json
└── Proyecto1_Front/
    ├── src/
    └── package.json
```

---

## 3. Comandos disponibles

Desde la raíz del repositorio, con Yarn instalado, están disponibles los siguientes scripts:

| Comando | Qué hace |
|---|---|
| `yarn docker:up` | Levanta los contenedores de Docker (MySQL + phpMyAdmin) definidos en `Proyecto1_Back/proyecto/docker-compose.yml`, en modo detached. |
| `yarn docker:down` | Detiene y elimina los contenedores levantados por `docker:up` (conserva los volúmenes/datos). |
| `yarn docker:clean` | Igual que `docker:down`, pero además borra los volúmenes (`-v`) — reinicia la base de datos local desde cero. |
| `yarn build:back` | Compila el backend (`yarn --cwd Proyecto1_Back/proyecto build`). |
| `yarn build:front` | Compila el frontend (`yarn --cwd Proyecto1_Front build`). |
| `yarn build` | Corre `build:back` y luego `build:front`, en secuencia. |
| `yarn dev:back` | Levanta el backend en modo desarrollo (`start:dev`, con hot-reload). |
| `yarn dev:front` | Levanta el frontend en modo desarrollo (Vite dev server). |
| `yarn dev` | **Comando principal para desarrollo local.** Levanta Docker (`docker:up`) y después corre `dev:back` y `dev:front` en paralelo (con [`concurrently`](https://www.npmjs.com/package/concurrently), coloreando la salida de cada uno). |

---

## 4. Configuración del entorno local

1. Clonar el repositorio y entrar a la carpeta:
```bash
git clone https://github.com/JuanCruzSistemas/proyecto-1
cd proyecto-1
```

2. Instalar dependencias en la raíz (instala `concurrently`, usado por `yarn dev`):
```bash
yarn install
```

3. Instalar dependencias de cada subproyecto:
```bash
cd Proyecto1_Back/proyecto
yarn install
cd ../../Proyecto1_Front
yarn install
```

4. Configurar las variables de entorno (ver sección 5) en `Proyecto1_Back/proyecto/.env`.

5. Levantar todo el entorno de desarrollo (Docker + backend + frontend) con un solo comando desde la raíz:
```bash
yarn dev
```

Si se prefiere levantar cada parte por separado, usar los comandos `docker:up`, `dev:back` y `dev:front` de la sección 3.

---

## 5. Variables de entorno

Variables esperadas por el backend (`Proyecto1_Back/proyecto/.env`):

```ini
DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
DB_DATABASE=
DB_TYPE=mysql
DB_SSL=
PORT=
JWT_SECRET=
JWT_EXPIRATION_ACCESS=
JWT_EXPIRATION_REFRESH=
PUNTO_VENTA_ACTIVO_ID=
```

- En **local**, `DB_HOST`/`DB_PORT`/`DB_USERNAME`/`DB_PASSWORD` apuntan al MySQL levantado por `yarn docker:up` (ver puertos exactos en `Proyecto1_Back/proyecto/docker-compose.yml`).
- En **producción**, esas mismas variables apuntan a la instancia de MySQL gestionada en **Aiven**, configuradas directamente en el panel de variables de entorno de Render — no en un archivo `.env` del repositorio.
- `JWT_SECRET` debe generarse propio por entorno.

---

## 6. Acceso

### Entorno local
- Frontend: http://localhost:5173

### Despliegue en la nube
- **Frontend (Vercel):** https://proyecto-1-puce.vercel.app/
- **Backend (Render):** https://proyecto-1-k2se.onrender.com
- **Base de datos (Aiven, MySQL):** gestionada, sin acceso público — accesible solo mediante las credenciales configuradas en el backend.

---

## 7. Pruebas básicas

- Frontend y backend levantan correctamente tanto en local (`yarn dev`) como en producción.
- Conexión estable entre el backend y la base de datos MySQL (local vía Docker, producción vía Aiven).
- Acceso público verificado mediante las URLs de despliegue (Vercel + Render).
- Comunicación entre frontend y backend verificada (el frontend en Vercel consume directamente la API en Render).
- Funcionalidades básicas del catálogo de productos operativas.

---

## 8. Autores
- Albarracín, Trinidad
- Magallanes, Agustín
- Mansilla, Santiago
- Nardi, Elisa María
- Olguín, Juan Cruz