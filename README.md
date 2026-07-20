# Arguedas Elite — Plataforma de Gestión Académica

> Sistema web para la gestión de estudiantes, docentes, materiales y asistencia de la Academia Arguedas Elite.
>
> 📦 **Stack:** Angular 21 (Standalone) + Firebase Auth + Firestore + Supabase Storage + Tailwind CSS

---

## Tech Stack

| Capa | Tecnología |
|------|-----------|
| **Frontend** | Angular 21.2 — Standalone API, Vite/esbuild |
| **Estilos** | Tailwind CSS 3.4 + PostCSS + Autoprefixer |
| **Autenticación** | Firebase Authentication |
| **Base de datos** | Cloud Firestore (NoSQL) |
| **Archivos** | Supabase Storage (bucket `materiales`) |
| **Test runner** | Vitest + jsdom |
| **Íconos** | Material Symbols Outlined |

---

## Arquitectura

```
src/
├── app/
│   ├── app.ts / .html / .css        → Componente raíz (router-outlet + toast + confirm)
│   ├── app.routes.ts                 → Rutas principales con lazy loading por rol
│   ├── app.config.ts                 → Providers: Firebase, Router
│   │
│   ├── auth/                         → Módulo de autenticación
│   │   ├── login/login.component     → Login con formulario, parallax, animaciones
│   │   ├── guards/auth.guard.ts      → Protege rutas: redirige a /login
│   │   ├── guards/role.guard.ts      → Verifica rol: admin / docente / estudiante
│   │   └── services/auth.service.ts  → Signals: authState, login/logout, loadUserData
│   │
│   ├── admin/                        → Panel del administrador
│   │   ├── admin-layout.component    → Sidebar + header + <router-outlet>
│   │   ├── admin.routes.ts           → Rutas hijas lazy (dashboard, estudiantes, docentes, materiales, perfil)
│   │   ├── dashboard/                → Cards con stats + actividad reciente
│   │   ├── estudiantes/              → CRUD completo con tabla responsive, filtros, paginación
│   │   ├── docentes/                 → CRUD completo con badges de cursos
│   │   ├── materiales/               → Grid de cards, drag-and-drop upload, Supabase Storage
│   │   ├── perfil/                   → Editar perfil + cambio de contraseña con reautenticación
│   │   └── services/                 → estudiantes.service, docentes.service, materiales.service
│   │
│   ├── docente/                      → Panel del docente
│   │   ├── docente-layout.component  → Sidebar + header + <router-outlet>
│   │   ├── docente.routes.ts         → Rutas hijas lazy (dashboard, asistencia, materiales, perfil)
│   │   ├── dashboard/               → Stats: alumnos, asistencia, materiales subidos
│   │   ├── asistencia/              → Radio presente/ausente, notas, marcar todos, guardado en Firestore
│   │   ├── materiales/              → Grid, drag-and-drop, filtros, descarga
│   │   ├── perfil/                  → Datos personales + extendidos, cambiar contraseña
│   │   └── services/                → asistencia.service, materiales.service
│   │
│   ├── estudiante/                   → Panel del estudiante
│   │   ├── estudiante-layout.component → Sidebar + header + <router-outlet>
│   │   ├── estudiante.routes.ts      → Rutas hijas lazy (dashboard, asistencia, materiales, perfil)
│   │   ├── dashboard/               → Banner de bienvenida, stats, actividad reciente
│   │   ├── asistencia/              → Gauge circular animado, historial, skeleton loading
│   │   ├── materiales/              → Grid con colores por tipo, búsqueda, filtros, descarga
│   │   ├── perfil/                  → Datos personales + extendidos, cambiar contraseña
│   │   └── services/                → asistencia.service, dashboard.service, materiales.service
│   │
│   └── shared/                       → Código compartido
│       ├── components/
│       │   ├── modal/               → Modal reutilizable con backdrop, escape key, body scroll lock
│       │   ├── toast/               → Toast service + container con cola y auto-removal 2.5s
│       │   ├── confirm/             → Confirm dialog con Observable-based service
│       │   └── pagination/          → Paginación con elipsis, anterior/siguiente
│       ├── models/
│       │   ├── usuario.model.ts      → UserRole, Usuario
│       │   ├── estudiante.model.ts   → Estudiante (codigo, salon, carrera, estado)
│       │   ├── docente.model.ts      → Docente (codigo, especialidad, cursos, estado)
│       │   └── material.model.ts     → Material (curso, tipo, tamano, storagePath)
│       └── services/
│           ├── firestore.service.ts  → Clase genérica CRUD para Firestore
│           ├── mock-data.service.ts  → Datos de semilla para todas las colecciones
│           ├── seed.service.ts       → Poblar Firestore con datos mock
│           └── storage.service.ts    → Abstracción sobre localStorage
│
├── environments/
│   ├── environment.example.ts        → Template para configurar Firebase
│   ├── environment.ts                → Config desarrollo (gitignored)
│   └── environment.prod.ts           → Config producción (gitignored)
│
├── styles.css                        → Directivas Tailwind + estilos legacy
├── main.ts                           → bootstrapApplication con appConfig
└── index.html                        → Fuentes Inter + Material Symbols
```

---

## Features por rol

### 👑 Administrador
- Dashboard con estadísticas en tiempo real (estudiantes, docentes, cursos, materiales)
- CRUD de estudiantes — tabla responsive (desktop table + mobile cards), filtros por nombre/carrera/estado, paginación (7 por página), modal crear/editar
- CRUD de docentes — filtros por nombre/especialidad/estado, badges de cursos
- Gestión de materiales — subida drag-and-drop con validación de tipo y tamaño, grid de tarjetas, filtros por curso/tipo
- Perfil — edición de datos + cambio de contraseña con reautenticación

### 👨‍🏫 Docente
- Dashboard — total alumnos, promedio de asistencia, materiales subidos
- Registro de asistencia — selector de curso/grupo, radios presente/ausente, notas por estudiante, botón "Marcar todos", estadísticas en vivo, auto-guardado en Firestore
- Gestión de materiales — subida drag-and-drop, filtros por nombre/formato, ordenamiento
- Perfil — datos personales + extendidos (teléfono, especialización, fecha de nacimiento), cambio de contraseña

### 🎓 Estudiante
- Dashboard — banner de bienvenida personalizado, asistencia del mes, materiales disponibles
- Asistencia — gauge circular animado con conic-gradient, stats presente/ausente, historial con tabla, skeleton loading
- Materiales académicos — grid con íconos por tipo (PDF 📄, DOCX 📝, MP4 🎬), búsqueda, filtro por tipo, descarga simulada
- Perfil — datos personales + extendidos (teléfono, fecha de nacimiento, dirección), cambio de contraseña

---

## Setup

### 1. Requisitos

- Node.js ≥ 18
- npm ≥ 9
- Angular CLI (`npm install -g @angular/cli`)

### 2. Clonar e instalar

```bash
git clone <repo-url>
cd arguedas-elite
npm install
```

### 3. Configurar Firebase

1. Crear un proyecto en [Firebase Console](https://console.firebase.google.com)
2. Habilitar **Authentication** (correo/contraseña)
3. Crear una base de datos **Firestore** (modo prueba)
4. Copiar las credenciales:

```bash
cp src/environments/environment.example.ts src/environments/environment.ts
cp src/environments/environment.example.ts src/environments/environment.prod.ts
```

5. Editar `environment.ts` con las credenciales de tu proyecto Firebase

### 4. Configurar Supabase Storage

1. Crear un proyecto en [Supabase](https://supabase.com)
2. Crear un bucket público llamado `materiales`
3. Copiar las credenciales en `src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  firebase: { /* ... */ },
  supabase: {
    url: 'https://tu-proyecto.supabase.co',
    anonKey: 'tu-anon-key',
  },
};
```

### 5. Servir

```bash
ng serve
# → http://localhost:4200
```

### 6. Poblar la base de datos

> ⚠️ Los componentes detectan colecciones vacías y te permiten seedear datos desde la UI.
> Si preferís hacerlo manualmente, el `SeedService` tiene el método `seedAll()`.

---

## Scripts

| Comando | Descripción |
|---------|-------------|
| `ng serve` | Servidor de desarrollo (http://localhost:4200) |
| `ng build` | Build de producción con Vite/esbuild |
| `ng test` | Ejecutar tests con Vitest |
| `ng watch` | Build en modo watch (dev) |

---

## Convenciones del proyecto

| Aspecto | Convención |
|---------|-----------|
| API de componentes | Standalone API (sin NgModules) |
| Estilos | CSS plano (no SCSS) + Tailwind utility classes |
| Formularios | Reactive Forms (`@angular/forms`) |
| Lazy loading | Por módulo de rol (admin, docente, estudiante) |
| Test runner | Vitest + jsdom |
| Build | `ng build` con `@angular/build:application` (Vite/esbuild) |
| Backend | Firebase Auth + Firestore + Supabase Storage |
| Git | `feat:`, `fix:`, `refactor:` commits |
| Nomenclatura | `kebab-case` para archivos, `PascalCase` para clases |

---

## Estructura de datos

### Colecciones en Firestore

```
estudiantes/          → { id, codigo, nombre, email, salon, carrera, estado }
docentes/             → { id, codigo, nombre, email, especialidad, cursos[], estado }
materiales/           → { id, nombre, curso, tipo, tamano, url, storagePath, fecha, subidoPor }
asistencias/          → { id, fecha, curso, grupo, registro: { estudianteId: presente|ausente } }
usuarios/             → { id, email, nombre, rol, uid }
```

---

## Estado del proyecto

✅ **Completo** — Funcionalidad core implementada y operativa:

- [x] Autenticación con Firebase (login/logout, guards por rol)
- [x] CRUD estudiantes, docentes, materiales (admin)
- [x] Registro de asistencia con Firestore (docente)
- [x] Visualización con gauge circular e historial (estudiante)
- [x] Subida/descarga de archivos con Supabase Storage
- [x] Perfiles de usuario con edición y cambio de contraseña
- [x] Componentes compartidos: Modal, Toast, Confirm, Pagination
- [x] Dashboards con estadísticas por rol
- [x] Diseño responsive con Tailwind CSS
- [x] Lazy loading por módulo de rol
- [ ] Tests unitarios (pendiente completar cobertura)
- [ ] PWA / Service Worker
- [ ] Modo offline con Firestore persistence
