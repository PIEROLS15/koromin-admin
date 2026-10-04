# KoroMin Admin

Panel administrativo para pedidos, inventario, ventas, finanzas y usuarios de KoroMin Anime Merch.

## Stack

- Next.js 16 con App Router.
- React 19.
- TypeScript estricto.
- Prisma + PostgreSQL.
- NextAuth con Google OAuth y Prisma Adapter.
- Tailwind CSS 4 + Radix UI.
- Zod para validación.
- Zustand para drafts cliente cuando el flujo lo requiera.

## Requisitos

- Node.js 22.
- pnpm 11.
- PostgreSQL.

## Variables de Entorno

Copia `.env.example` a `.env` y completa los valores reales:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/koromin?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="change-me"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
POSTGRES_DB="koromin"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="postgres"
POSTGRES_PORT="5432"
APP_PORT="3000"
```

`GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` son obligatorias. La aplicación falla temprano si no existen. En producción, reemplaza `NEXTAUTH_SECRET` por un valor fuerte y privado.

## Desarrollo

```bash
pnpm install
pnpm prisma:generate
pnpm dev
```

## Base de Datos

El esquema vive en `prisma/schema.prisma`.

Para producción no uses `prisma db push --accept-data-loss`. El runtime Docker ejecuta `prisma migrate deploy`, por lo que las migraciones deben versionarse en `prisma/migrations` antes de desplegar.

Flujo recomendado:

```bash
pnpm prisma:migrate
pnpm prisma:generate
```

Si ya tienes una base local creada antes de usar migraciones, `migrate deploy` puede fallar con `P3005` porque la base no está vacía y no tiene historial en `_prisma_migrations`.

Si puedes perder datos locales, recrea el volumen:

```bash
docker compose down
docker volume rm koromin-admin_koromin_postgres_data
docker compose up -d --build
```

Si necesitas conservar datos, marca la migración inicial como aplicada contra esa base:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/koromin?schema=public" pnpm prisma migrate resolve --applied 20261003000000_init
docker compose restart app
```

## Calidad

```bash
pnpm lint
pnpm test:unit
pnpm test:integration
pnpm build
```

## Pruebas

La suite usa Vitest para pruebas unitarias e integración/backend, y Playwright para E2E.

La base de datos de pruebas corre aislada en Docker con el servicio `db-test`, puerto local `5433` y base `koromin_test`.

Flujo local recomendado:

```bash
pnpm db:test:up
pnpm prisma:generate
pnpm db:test:migrate
pnpm test:unit
pnpm test:integration
pnpm build
pnpm test:e2e
```

`test:integration` y `test:e2e` cargan `.env.test`. Los helpers de integración fallan temprano si `DATABASE_URL` no apunta a `koromin_test`.

Para detener la base de pruebas:

```bash
pnpm db:test:down
```

## Autorización

El acceso server-side se centraliza en `src/lib/auth/guards.ts`:

- `requireActiveUser()` valida sesión, existencia de usuario y estado `ACTIVE`.
- `requirePermission(permission)` valida usuario activo y permiso por rol.

Los permisos por rol están en `src/lib/permissions/permissions.ts`.

## Docker

El `Dockerfile` usa build standalone de Next.js. En runtime aplica migraciones con:

```bash
pnpm prisma migrate deploy
```

El healthcheck `/api/health` valida que la app pueda consultar PostgreSQL.
