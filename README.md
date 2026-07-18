# Arguedas Elite — Plan de Migración

> Migración del prototipo estático (HTML/CSS/JS) → Angular 21 + Firebase.
> Proyecto generado con `ng new` usando Standalone API, Vite/esbuild y Vitest.

---

## Estructura del proyecto origen (`ESTATICO/`)

```
ESTATICO/
├── index.html                     → Login
├── admin/
│   ├── admin-layout.html          → Layout base admin (sidebar + contenido)
│   ├── estudiantes.html           → CRUD estudiantes
│   ├── docentes.html              → CRUD docentes
│   ├── materiales.html            → Gestión de materiales
│   └── perfil.html                → Perfil del admin
├── docente/
│   ├── docente-layout.html        → Layout base docente
│   ├── asistencia.html            → Registro de asistencia
│   ├── materiales.html            → Gestión de materiales
│   └── perfil.html                → Perfil del docente
├── estudiante/
│   ├── estudiante-layout.html     → Layout base estudiante
│   ├── asistencia.html            → Vista de asistencia
│   ├── materiales.html            → Materiales disponibles
│   └── perfil.html                → Perfil del estudiante
└── assets/
    ├── css/
    │   ├── login.css              → Estilos del login
    │   └── admin.css              → Estilos base del panel
    ├── js/
    │   ├── auth.js                → Lógica de login
    │   ├── tailwind-config.js     → Tema MD3 custom
    │   ├── perfil.js              → Editar perfil (admin)
    │   ├── estudiantes.js         → CRUD estudiantes
    │   ├── docentes.js            → CRUD docentes
    │   ├── materiales.js          → Materiales (admin)
    │   ├── asistencia-docente.js  → Asistencia (docente)
    │   ├── asistencia-estudiante.js → Asistencia (estudiante)
    │   ├── materiales-docente.js  → Materiales (docente)
    │   └── materiales-estudiante.js → Materiales (estudiante)
    ├── components/
    │   ├── admin-sidebar.js        → Sidebar admin
    │   ├── docente-sidebar.js      → Sidebar docente
    │   ├── estudiante-sidebar.js   → Sidebar estudiante
    │   ├── docente-mobile-nav.js   → Bottom nav docente
    │   ├── estudiante-mobile-nav.js → Bottom nav estudiante
    │   ├── modal.js               → Modal genérico
    │   ├── toast.js               → Notificaciones
    │   ├── confirm.js             → Confirmación
    │   ├── pagination.js          → Paginación
    │   └── profile-utils.js       → Utilidades de perfil
    ├── data/
    │   └── estudiantes.mock.json  → Mock de 20 estudiantes
    └── img/
        └── logo.png               → Logo de la academia
```

**Total: 39 archivos** (15 HTML + 21 JS + 2 CSS + 1 JSON + 1 PNG).

---

## Fases de migración

Cada fase está diseñada para ser **autocontenida** — al final de cada una tenés algo funcional.

---

### Fase 0 — Preparación del proyecto Angular

**Objetivo:** Dejar el proyecto Angular listo con Tailwind, tema visual, fuentes y estructura de directorios.

**Pasos:**

1. **Instalar Tailwind CSS**
   ```bash
   npm install -D tailwindcss @tailwindcss/postcss
   ```
   Crear `postcss.config.js` con el plugin de Tailwind.

2. **Configurar el tema MD3 custom**
   - Crear `tailwind.config.ts` extrayendo los colores, fuentes, spacing y border-radius del archivo `tailwind-config.js` del proyecto estático.
   - Agregar las directivas `@tailwind` en `src/styles.css`.

3. **Agregar fuentes en `src/index.html`**
   - Google Fonts: `Inter` (pesos 400, 500, 600, 700, 800, 900).
   - Material Symbols Outlined (íconos).

4. **Crear estructura de directorios**
   ```
   src/app/
   ├── auth/                  → Login, servicios
   ├── shared/                → Componentes compartidos
   │   ├── components/        → Modal, Toast, Confirm, Pagination
   │   └── models/            → Interfaces
   ├── admin/                 → Módulo admin
   ├── docente/               → Módulo docente
   └── estudiante/            → Módulo estudiante
   ```

5. **Configurar estilos globales**
   - Pasar `login.css` y `admin.css` a `src/styles.css`.

---

### Fase 1 — Login y autenticación

**Objetivo:** Replicar la pantalla de login con su lógica de autenticación simulada.

**Archivos origen:** `index.html`, `assets/js/auth.js`, `assets/js/tailwind-config.js`

**En Angular:**

| Origen | Destino |
|---|---|
| `index.html` (login) | `src/app/auth/login/login.component.ts` |
| `auth.js` (lógica) | `src/app/auth/services/auth.service.ts` |
| — | `src/app/guards/auth.guard.ts` |
| — | `src/app/guards/role.guard.ts` |

**Detalle de tareas:**

- [ ] Generar `LoginComponent` standalone con template del login (logo, formulario, botón, error).
- [ ] Crear `AuthService` con:
  - Método `login(username, password)` que devuelva un `Observable<boolean>` — lógica simulada.
  - `getUserRole(): 'admin' | 'docente' | 'estudiante' | null`
  - `isLoggedIn(): boolean`
  - `logout()`
  - Guardar sesión en `localStorage` (como el JS original).
- [ ] Crear `AuthGuard` (`canActivate`) que redirija a `/login` si no hay sesión.
- [ ] Crear `RoleGuard` (`canActivate`) que verifique el rol y redirija si no coincide.
- [ ] Configurar rutas en `app.routes.ts`:
  ```ts
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
  ```

---

### Fase 2 — Layouts y navegación por rol

**Objetivo:** Replicar los layouts con sidebar y bottom nav para cada rol.

**Archivos origen:** `admin/admin-layout.html`, `docente/docente-layout.html`, `estudiante/estudiante-layout.html`, todos los `*-sidebar.js`, `*-mobile-nav.js`

**En Angular:**

| Origen | Destino |
|---|---|
| `admin-layout.html` + `admin-sidebar.js` | `src/app/admin/admin-layout.component.ts` |
| `docente-layout.html` + `docente-sidebar.js` + `docente-mobile-nav.js` | `src/app/docente/docente-layout.component.ts` |
| `estudiante-layout.html` + `estudiante-sidebar.js` + `estudiante-mobile-nav.js` | `src/app/estudiante/estudiante-layout.component.ts` |

**Detalle de tareas:**

- [ ] Crear `AdminLayoutComponent` standalone con `<router-outlet>` para contenido anidado.
  - Sidebar fijo con links activos (`data-active` del JS original → `routerLinkActive`).
  - Botón de cerrar sesión.
- [ ] Crear `DocenteLayoutComponent` standalone con sidebar + bottom nav móvil.
- [ ] Crear `EstudianteLayoutComponent` standalone con sidebar + bottom nav móvil.
- [ ] Configurar rutas anidadas:
  ```ts
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' },
    children: [
      { path: 'estudiantes', component: ... },
      { path: 'docentes', component: ... },
      ...
    ]
  }
  ```

---

### Fase 3 — Componentes compartidos

**Objetivo:** Replicar los componentes reutilizables del estático como componentes Angular.

**Archivos origen:** `assets/components/{modal,toast,confirm,pagination}.js`

| Origen | Destino Angular |
|---|---|
| `modal.js` → `abrirModal()`, `cerrarModal()` | `src/app/shared/components/modal/modal.component.ts` + `ModalService` |
| `toast.js` → `mostrarToast(msg, tipo)` | `src/app/shared/components/toast/toast.component.ts` + `ToastService` |
| `confirm.js` → `mostrarConfirm(opts)` | `src/app/shared/components/confirm/confirm.component.ts` + `ConfirmService` |
| `pagination.js` → `Paginacion.renderizarBotones()` | `src/app/shared/components/pagination/pagination.component.ts` |
| `profile-utils.js` | `src/app/shared/utils/profile.utils.ts` |

**Detalle de tareas:**

- [ ] `ModalComponent` standalone con `@Input()` para contenido, `@Output()` para cerrar. Cierre con Escape y backdrop click.
- [ ] `ToastComponent` standalone con servicio que maneje cola de notificaciones, auto-ocultación a los 2.5s, tipos `success`/`error`.
- [ ] `ConfirmComponent` standalone con `@Input()` para config (ícono, título, mensaje, texto botones), `@Output()` para confirmar/cancelar.
- [ ] `PaginationComponent` standalone con `@Input()`: `totalItems`, `itemsPerPage`, `currentPage`; `@Output()`: `pageChange`. Lógica de elipsis para más de 5 páginas.

---

### Fase 4 — Módulo Admin

**Objetivo:** Replicar CRUD de estudiantes, CRUD de docentes, gestión de materiales y perfil del admin.

**Archivos origen:** Todos los de `admin/` + sus JS correspondientes.

#### 4a. CRUD Estudiantes

| Origen | Destino |
|---|---|
| `admin/estudiantes.html` | `src/app/admin/estudiantes/estudiantes.component.ts` |
| `estudiantes.js` | `src/app/admin/services/estudiantes.service.ts` |
| `estudiantes.mock.json` | `src/app/shared/models/estudiante.model.ts` |

- [ ] Crear interfaz `Estudiante`.
- [ ] Crear `EstudiantesService` con métodos CRUD (mock por ahora): `listar()`, `crear()`, `actualizar()`, `eliminar()`, `buscar()`.
- [ ] `EstudiantesComponent`: tabla con filtros (nombre, carrera, estado), paginación, modal de crear/editar, confirmación al eliminar.
- [ ] Avatares por iniciales (como el original).

#### 4b. CRUD Docentes

| Origen | Destino |
|---|---|
| `admin/docentes.html` | `src/app/admin/docentes/docentes.component.ts` |
| `docentes.js` | `src/app/admin/services/docentes.service.ts` |

- [ ] Interfaz `Docente` con cursos como `string[]`.
- [ ] `DocentesService` con CRUD mock.
- [ ] `DocentesComponent`: tabla, filtros, modal, badges de cursos.

#### 4c. Gestión de Materiales (Admin)

| Origen | Destino |
|---|---|
| `admin/materiales.html` | `src/app/admin/materiales/materiales.component.ts` |
| `materiales.js` | `src/app/admin/services/materiales.service.ts` |

- [ ] Interfaz `Material`.
- [ ] `MaterialesService` con CRUD mock.
- [ ] `MaterialesComponent`: grid de tarjetas, drop zone para subida, filtros por curso/tipo, paginación.

#### 4d. Perfil (Admin)

| Origen | Destino |
|---|---|
| `admin/perfil.html` | `src/app/admin/perfil/perfil.component.ts` |
| `perfil.js` + `profile-utils.js` | `src/app/admin/perfil/perfil.component.ts` |

- [ ] `PerfilComponent`: formulario de edición de nombre, email, username.
- [ ] Modal de cambio de contraseña con validaciones (8+ chars, mayúscula, minúscula, número).

---

### Fase 5 — Módulo Docente

**Objetivo:** Replicar registro de asistencia, gestión de materiales y perfil del docente.

#### 5a. Registro de Asistencia

| Origen | Destino |
|---|---|
| `docente/asistencia.html` | `src/app/docente/asistencia/asistencia.component.ts` |
| `asistencia-docente.js` | `src/app/docente/services/asistencia.service.ts` |

- [ ] `AsistenciaService`: obtener lista de estudiantes, guardar asistencia (mock).
- [ ] `AsistenciaComponent`: tabla con radios presente/ausente, notas por estudiante, botón "Marcar todos", estadísticas en vivo, guardado simulado con spinner.

#### 5b. Gestión de Materiales (Docente)

| Origen | Destino |
|---|---|
| `docente/materiales.html` | `src/app/docente/materiales/materiales.component.ts` |
| `materiales-docente.js` | `src/app/docente/services/materiales.service.ts` |

- [ ] `MaterialesComponent`: modal de subida/edición, filtros por nombre/formato, ordenamiento.

#### 5c. Perfil (Docente)

| Origen | Destino |
|---|---|
| `docente/perfil.html` | `src/app/docente/perfil/perfil.component.ts` |

- [ ] Misma lógica de perfil compartida (reutilizar utilidades).

---

### Fase 6 — Módulo Estudiante

**Objetivo:** Replicar vista de asistencia, materiales disponibles y perfil del estudiante.

#### 6a. Vista de Asistencia

| Origen | Destino |
|---|---|
| `estudiante/asistencia.html` | `src/app/estudiante/asistencia/asistencia.component.ts` |
| `asistencia-estudiante.js` | — |

- [ ] `AsistenciaComponent`: solo visualización con anillo de progreso (conic-gradient animado).

#### 6b. Materiales Disponibles

| Origen | Destino |
|---|---|
| `estudiante/materiales.html` | `src/app/estudiante/materiales/materiales.component.ts` |
| `materiales-estudiante.js` | — |

- [ ] `MaterialesComponent`: búsqueda, filtro por tipo, descarga simulada con toast de progreso.

#### 6c. Perfil (Estudiante)

| Origen | Destino |
|---|---|
| `estudiante/perfil.html` | `src/app/estudiante/perfil/perfil.component.ts` |

---

### Fase 7 — Servicios y datos mock

**Objetivo:** Centralizar todos los servicios con datos mock usando interfaces compartidas.

**Archivos a crear:**

```
src/app/shared/models/
├── usuario.model.ts
├── estudiante.model.ts
├── docente.model.ts
└── material.model.ts

src/app/shared/services/
├── storage.service.ts       → Wrapper de localStorage
└── mock-data.service.ts     → Datos mock centralizados
```

**Patrón a seguir:**
- Cada servicio (ej. `EstudiantesService`) define su interfaz y CRUD.
- Los datos se inicializan desde `mock-data.service.ts`.
- Cuando llegue Firebase, solo se cambia la implementación del servicio (misma interfaz).

---

### Fase 8 — Firebase (futuro)

**Objetivo:** Reemplazar datos mock por Firestore y autenticación simulada por Firebase Auth.

**Pasos:**

1. Instalar Firebase:
   ```bash
   ng add @angular/fire
   ```
2. Configurar `FirebaseModule` con las credenciales del proyecto.
3. Migrar `AuthService`:
   - `login()` → `signInWithEmailAndPassword()`
   - `logout()` → `signOut()`
   - Roles desde claims o colección `usuarios` en Firestore.
4. Migrar servicios CRUD:
   - `EstudiantesService` → `collection('estudiantes')` en Firestore.
   - `DocentesService` → `collection('docentes')`.
   - `MaterialesService` → `collection('materiales')` + Storage para archivos.
   - `AsistenciaService` → `collection('asistencias')`.
5. Desplegar a Firebase Hosting con `firebase deploy`.

---

## Resumen visual del destino

```
src/app/
├── app.ts                          → Componente raíz con <router-outlet>
├── app.routes.ts                   → Configuración de rutas
├── app.config.ts                   → Providers
│
├── auth/
│   ├── login/
│   │   ├── login.component.ts
│   │   └── login.component.html
│   └── services/
│       └── auth.service.ts
│
├── shared/
│   ├── components/
│   │   ├── modal/
│   │   ├── toast/
│   │   ├── confirm/
│   │   └── pagination/
│   ├── models/
│   │   ├── usuario.model.ts
│   │   ├── estudiante.model.ts
│   │   ├── docente.model.ts
│   │   └── material.model.ts
│   └── utils/
│       └── profile.utils.ts
│
├── admin/
│   ├── admin-layout.component.ts   → Sidebar + <router-outlet>
│   ├── estudiantes/
│   ├── docentes/
│   ├── materiales/
│   ├── perfil/
│   └── services/
│       ├── estudiantes.service.ts
│       ├── docentes.service.ts
│       └── materiales.service.ts
│
├── docente/
│   ├── docente-layout.component.ts → Sidebar + bottom nav + <router-outlet>
│   ├── asistencia/
│   ├── materiales/
│   ├── perfil/
│   └── services/
│       └── asistencia.service.ts
│
└── estudiante/
    ├── estudiante-layout.component.ts → Sidebar + bottom nav + <router-outlet>
    ├── asistencia/
    ├── materiales/
    └── perfil/
```

---

## Convenios del proyecto

| Aspecto | Convención |
|---|---|
| API de componentes | Standalone API (sin NgModules) |
| Estilos | CSS plano (no SCSS) + Tailwind utility classes |
| Formularios | Reactive Forms (`@angular/forms`) |
| Test runner | Vitest |
| Build | `ng build` (Vite/esbuild) |
| Git | `feat:`, `fix:`, `refactor:` commits |
| Nomenclatura | `kebab-case` para archivos, `PascalCase` para clases |

---

> **Siguiente paso:** Arrancamos con la **Fase 0** — instalar Tailwind, configurar el tema y crear la estructura de directorios. ¿Listo?
