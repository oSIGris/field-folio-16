# Cooperativa ERP

ERP multi-tenant para la gestión de cooperativas agrícolas y sus socios.
Construido con **React + TypeScript + TanStack Start** y **Supabase** como backend
(base de datos PostgreSQL, autenticación y RLS).

> ⚠️ Este proyecto utiliza **tu propio proyecto de Supabase**, **no** Lovable Cloud.
> Todo el backend (datos, auth y políticas de seguridad) vive en tu instancia de Supabase.

---

## 🧱 Stack tecnológico

- **Frontend:** React 19, TypeScript, TanStack Start (SSR), TanStack Router & Query
- **UI:** Tailwind CSS v4 + shadcn/ui (Radix UI)
- **Tablas:** TanStack Table + TanStack Virtual (grid estilo Excel, virtualizado)
- **Backend:** Supabase (PostgreSQL, Auth, Row-Level Security)
- **Build:** Vite 7
- **Gestor de paquetes:** Bun

---

## 📦 Requisitos previos

- [Bun](https://bun.sh) >= 1.1 (o npm/pnpm si lo prefieres)
- Una cuenta y un proyecto en [Supabase](https://supabase.com)

---

## 🚀 Ejecutar en local

1. **Clona el repositorio**

   ```bash
   git clone <url-del-repo>
   cd <carpeta-del-repo>
   ```

2. **Instala las dependencias**

   ```bash
   bun install
   ```

3. **Configura las variables de entorno**

   Copia la plantilla y rellena con los datos de tu proyecto de Supabase
   (Dashboard → *Project Settings* → *API*):

   ```bash
   cp .env.example .env
   ```

   | Variable | Dónde encontrarla |
   |----------|-------------------|
   | `VITE_SUPABASE_URL` / `SUPABASE_URL` | Project URL |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_PUBLISHABLE_KEY` | `anon` / `publishable` key |
   | `VITE_SUPABASE_PROJECT_ID` | Reference ID del proyecto |
   | `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key — **solo en servidor, nunca commitear** |

4. **Aplica las migraciones a tu base de datos** (ver sección siguiente).

5. **Arranca el servidor de desarrollo**

   ```bash
   bun run dev
   ```

   La app quedará disponible en `http://localhost:3000`.

### Otros scripts

```bash
bun run build       # build de producción
bun run preview     # previsualizar el build
bun run lint        # linter
bun run format      # formatear con Prettier
```

---

## 🗄️ Base de datos y políticas RLS

Todo el esquema SQL (tablas, enums, funciones, triggers y políticas RLS) está
versionado en [`supabase/migrations/`](./supabase/migrations). Cada archivo es una
migración incremental ordenada por timestamp.

### Aplicar las migraciones

Con la [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
# Vincula tu proyecto (una sola vez)
supabase link --project-ref <tu-project-ref>

# Aplica todas las migraciones
supabase db push
```

Alternativamente, puedes copiar el contenido de cada `.sql` y ejecutarlo en orden
desde el **SQL Editor** del dashboard de Supabase.

### Resumen del modelo de datos

| Tabla | Descripción |
|-------|-------------|
| `cooperatives` | Cooperativas (tenants de la aplicación) |
| `profiles` | Perfil de cada usuario autenticado |
| `organization_members` | Pertenencia usuario ↔ cooperativa + rol (`admin`, `gestor`, `consulta`) |
| `socios` | Socios (agricultores) de cada cooperativa |

**Seguridad:** RLS está activado en todas las tablas. El acceso se valida con
funciones `SECURITY DEFINER` (`is_org_member`, `has_org_role`) para que cada
usuario solo pueda ver y editar datos de las cooperativas a las que pertenece.

---

## 🔐 Autenticación

- Registro e inicio de sesión por **email + contraseña** (Supabase Auth).
- Al registrarse, un trigger crea automáticamente el perfil del usuario.
- En el primer acceso, el usuario crea su cooperativa y queda como **administrador**.

---

## 📁 Estructura del proyecto

```
src/
├── components/        # Componentes UI (layout, socios, ui/shadcn)
├── integrations/
│   └── supabase/      # Clientes Supabase (browser, server, admin) + tipos
├── lib/               # Contextos (auth, workspace), hooks y server functions
├── routes/            # Rutas (file-based routing de TanStack Start)
│   └── _authenticated/  # Rutas protegidas (requieren sesión)
└── styles.css         # Design tokens (Tailwind v4)
supabase/
├── migrations/        # Migraciones SQL (esquema + RLS)
└── config.toml        # Configuración del proyecto Supabase
```

---

## ☁️ Despliegue

El frontend (TanStack Start) puede desplegarse en cualquier plataforma compatible
con SSR en edge (p. ej. Cloudflare). El backend permanece siempre en tu proyecto
de Supabase. Recuerda configurar las mismas variables de entorno en tu plataforma
de hosting.

---

## 📝 Licencia

Privado. Todos los derechos reservados.