# Arquitectura — Arguedas Elite

> Angula 21.2 — Standalone Components — Firebase — Tailwind CSS
> Actualizado: Julio 2026

---

## Stack técnico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework | Angular (standalone) | ^21.2.0 |
| UI / CSS | Tailwind CSS + PostCSS | ^3.4.19 |
| Backend | Firebase (Auth + Firestore + Storage) | ^12.16.0 |
| Angular/Fire | @angular/fire | ^21.0.0-rc.0 |
| Testing | Vitest + jsdom | ^4.0.8 |
| Build | Angular CLI + Vite/esbuild (via @angular/build) | ^21.2.19 |

---

## Estructura de directorios

```
src/
├── main.ts                          # Entry point (bootstrap App)
├── index.html
├── styles.css                       # Tailwind directives + global styles
│
├── environments/
│   ├── environment.ts               # Firebase creds (dev)
│   ├── environment.prod.ts          # Firebase creds (prod)
│   └── environment.example.ts       # Template con placeholders
│
├── app/
│   ├── app.ts                       # Componente raíz (standalone)
│   ├── app.html                     # <router-outlet /> + toast + confirm
│   ├── app.css
│   ├── app.config.ts                # Providers globales
│   ├── app.routes.ts                # Rutas raíz
│   ├── app.spec.ts                  # Test unitario
│   │
│   ├── auth/                        # ── Autenticación ──
│   │   ├── login/
│   │   │   ├── login.component.ts
│   │   │   ├── login.component.html
│   │   │   └── login.component.css
│   │   ├── services/
│   │   │   └── auth.service.ts      # Firebase Auth + Firestore
│   │   └── guards/
│   │       ├── auth.guard.ts        # Verifica sesión activa
│   │       └── role.guard.ts        # Verifica rol específico
│   │
│   ├── admin/                       # ── Panel Administrador ──
│   │   ├── admin.routes.ts
│   │   ├── admin-layout.component.ts/.html/.css
│   │   ├── dashboard/
│   │   ├── estudiantes/
│   │   ├── docentes/
│   │   ├── materiales/
│   │   ├── perfil/
│   │   └── services/
│   │       ├── estudiantes.service.ts
│   │       ├── docentes.service.ts
│   │       └── materiales.service.ts
│   │
│   ├── docente/                     # ── Panel Docente ──
│   │   ├── docente.routes.ts
│   │   ├── docente-layout.component.ts/.html/.css
│   │   ├── dashboard/
│   │   ├── asistencia/
│   │   ├── materiales/
│   │   ├── perfil/
│   │   └── services/
│   │       ├── asistencia.service.ts
│   │       └── materiales.service.ts
│   │
│   ├── estudiante/                  # ── Panel Estudiante ──
│   │   ├── estudiante.routes.ts
│   │   ├── estudiante-layout.component.ts/.html/.css
│   │   ├── dashboard/
│   │   ├── asistencia/
│   │   ├── materiales/
│   │   ├── perfil/
│   │   └── services/                # (vacío — datos hardcoded)
│   │
│   └── shared/                      # ── Compartido ──
│       ├── components/
│       │   ├── toast/
│       │   │   ├── toast.service.ts
│       │   │   └── toast-container.component.ts
│       │   ├── confirm/
│       │   │   ├── confirm.service.ts
│       │   │   └── confirm-dialog.component.ts
│       │   ├── modal/
│       │   │   └── modal.component.ts
│       │   └── pagination/
│       │       └── pagination.component.ts
│       ├── models/
│       │   ├── usuario.model.ts
│       │   ├── estudiante.model.ts
│       │   ├── docente.model.ts
│       │   └── material.model.ts
│       ├── services/
│       │   ├── firestore.service.ts     # CRUD genérico (abstracto)
│       │   ├── storage.service.ts       # localStorage wrapper
│       │   └── mock-data.service.ts     # Datos mock + helpers
│       └── utils/                       # (vacío)
```

---

## Sistema de rutas

### Árbol completo

```
/login                              → LoginComponent (página pública)

/administrador                      → [authGuard] → AdminLayoutComponent
  /administrador/dashboard          → [roleGuard('admin')] AdminDashboardComponent
  /administrador/estudiantes        → [roleGuard('admin')] EstudiantesComponent
  /administrador/docentes           → [roleGuard('admin')] DocentesComponent
  /administrador/materiales         → [roleGuard('admin')] MaterialesComponent
  /administrador/perfil             → [roleGuard('admin')] PerfilComponent

/docente                            → [authGuard] → DocenteLayoutComponent
  /docente/dashboard                → [roleGuard('docente')] DocenteDashboardComponent
  /docente/asistencia               → [roleGuard('docente')] AsistenciaComponent
  /docente/materiales               → [roleGuard('docente')] MaterialesComponent
  /docente/perfil                   → [roleGuard('docente')] PerfilComponent

/estudiante                         → [authGuard] → EstudianteLayoutComponent
  /estudiante/dashboard             → [roleGuard('estudiante')] EstudianteDashboardComponent
  /estudiante/asistencia            → [roleGuard('estudiante')] AsistenciaComponent
  /estudiante/materiales            → [roleGuard('estudiante')] MaterialesComponent
  /estudiante/perfil                → [roleGuard('estudiante')] PerfilComponent

/                                   → redirectTo /login
/**                                 → redirectTo /login
```

### Guard layers

1. **authGuard** — ¿Hay sesión en Firebase? Si no → `/login`
2. **roleGuard(rol)** — ¿El rol del usuario coincide? Si no → `/login`

Ambos se aplican en el routing: `authGuard` en el padre (lazy load), `roleGuard` en el layout hijo.

---

## Flujo de autenticación

```
Login Form
  ↓ username + password
onSubmit()
  ↓ arma email: username@arguedas.edu.pe
AuthService.login(email, password)
  ↓ signInWithEmailAndPassword (Firebase Auth)
loadUserData(user)
  ↓ docData(`usuarios/${uid}`) (Firestore)
state.set({ user, usuario, role })
  ↓
getDefaultRoute() → roleRoutes[role]
  admin      → /administrador/dashboard
  docente    → /docente/dashboard
  estudiante → /estudiante/dashboard
  ↓
router.navigateByUrl(ruta)
```

**Archivos involucrados:**
- `src/app/auth/login/login.component.ts` — línea 46: `navigateByUrl(getDefaultRoute())`
- `src/app/auth/services/auth.service.ts` — línea 44: `login()`, línea 58: `loadUserData()`, línea 26: `roleRoutes`, línea 92: `getDefaultRoute()`

---

## Modelos de datos

### Usuario (`shared/models/usuario.model.ts`)
```typescript
export type UserRole = 'admin' | 'docente' | 'estudiante';

export interface Usuario {
  username: string;
  role: UserRole;
  nombre: string;
  email: string;
}
```

### Estudiante (`shared/models/estudiante.model.ts`)
```typescript
export interface Estudiante {
  codigo: string;
  nombre: string;
  email: string;
  salon: string;
  carrera: string;
  estado: 'Activo' | 'Pendiente';
}
```

### Docente (`shared/models/docente.model.ts`)
```typescript
export interface Docente {
  codigo: string;
  nombre: string;
  email: string;
  especialidad: string;
  cursos: string[];
  estado: 'Activo' | 'Pendiente';
}
```

### Material (`shared/models/material.model.ts`)
```typescript
export interface Material {
  id: string;
  nombre: string;
  curso: string;
  tipo: string;
  tamano: string;
  icono: string;
  colorClase: string;
  fecha: string;
}
```

---

## Servicios

### Core
| Servicio | Archivo | Propósito |
|----------|---------|-----------|
| `AuthService` | `auth/services/auth.service.ts` | Login/logout Firebase, carga usuario desde Firestore, signals de estado, mapeo rol→ruta |
| `FirestoreCollectionService` | `shared/services/firestore.service.ts` | CRUD genérico abstracto sobre cualquier colección Firestore |
| `StorageService` | `shared/services/storage.service.ts` | localStorage wrapper con prefijo `arguedas_` |
| `MockDataService` | `shared/services/mock-data.service.ts` | Datos mock completos + helpers (parseFileType, detectarTipoArchivo, randomSize) |
| `ToastService` | `shared/components/toast/toast.service.ts` | Cola de toasts con signal, auto-removal a 2.5s |
| `ConfirmService` | `shared/components/confirm/confirm.service.ts` | Diálogo de confirmación modal, retorna `Observable<boolean>` |

### Admin CRUD (mock — signals)
| Servicio | Archivo | Métodos clave |
|----------|---------|--------------|
| `EstudiantesService` | `admin/services/estudiantes.service.ts` | `crear()`, `actualizar()`, `eliminar()`, `getByCodigo()`, `getCarreras()` |
| `DocentesService` | `admin/services/docentes.service.ts` | `crear()`, `actualizar()`, `eliminar()`, `getEspecialidades()` |
| `MaterialesService` | `admin/services/materiales.service.ts` | `crear()`, `eliminar()`, `getCursos()`, `getTipos()` |

### Docente CRUD (mock — signals)
| Servicio | Archivo | Métodos clave |
|----------|---------|--------------|
| `AsistenciaService` | `docente/services/asistencia.service.ts` | `marcarEstudiante()`, `marcarTodos()`, `actualizarNota()`, `getStats()`, `guardar()` |
| `MaterialesDocenteService` | `docente/services/materiales.service.ts` | `crear()`, `actualizar()`, `eliminar()`, `getById()` |

---

## Componentes compartidos

| Componente | Inputs | Outputs | Propósito |
|-----------|--------|---------|-----------|
| `ModalComponent` | `isOpen: boolean` | `close: EventEmitter` | Modal genérico con backdrop, escape key, body scroll lock |
| `PaginationComponent` | `totalItems`, `itemsPerPage`, `currentPage` | `pageChange` | Paginación con ellipsis, máximo 5 botones |
| `ToastContainerComponent` | — | — | Renderiza toasts en fixed bottom-right |
| `ConfirmDialogComponent` | — | — | Modal de confirmación con opciones configurables |

---

## Firebase

| Servicio | Configurado | En uso |
|----------|-------------|--------|
| **Auth** | ✅ `provideAuth(() => getAuth())` | ✅ Login real con Firebase Auth |
| **Firestore** | ✅ `provideFirestore(() => getFirestore())` | ⚠️ Solo lectura en `usuarios/{uid}` al login |
| **Storage** | ✅ `provideStorage(() => getStorage())` | ❌ No se usa aún |

**Estado actual:** Firebase Auth funciona para login real. Firestore se consulta solo para el documento del usuario. **Toda la data de negocio (estudiantes, docentes, materiales, asistencia) es mock** — los servicios usan `MockDataService` y signals locales.

---

## Testing

| Framework | Vitest ^4.0.8 + jsdom |
|-----------|----------------------|
| **Archivos de test** | 1 archivo: `src/app/app.spec.ts` |
| **Cobertura** | Solo creacción del AppComponent y verificación de router-outlet |
| **Pendiente** | Tests para servicios, guards, componentes CRUD |

---

## Patrones y decisiones arquitectónicas

- **Standalone Components** — sin NgModules, bootstrap directo en `main.ts`
- **Signals** — estado reactivo con signals (`signal()`, `computed()`) en vez de RxJS BehaviorSubjects
- **Lazy Loading** — cada módulo de rol carga lazy
- **Functional Guards** — `authGuard` y `roleGuard()` son funciones, no clases
- **Layout pattern** — cada rol tiene un layout component que wrappea hijos con sidebar
- **Mock-first** — servicios con datos mock reemplazables por Firestore real
- **No se renombraron carpetas físicas** — `admin/` como carpeta existe, la ruta URL es `/administrador`

---

## Índice rápido de archivos

### Autenticación
| Buscar | Archivo |
|--------|---------|
| Login form | `auth/login/login.component.ts` |
| Auth service (login, logout, role) | `auth/services/auth.service.ts` |
| Guard de sesión | `auth/guards/auth.guard.ts` |
| Guard de rol | `auth/guards/role.guard.ts` |
| Tipo UserRole | `shared/models/usuario.model.ts` |

### Rutas
| Buscar | Archivo |
|--------|---------|
| Rutas raíz | `app.routes.ts` |
| Rutas admin | `admin/admin.routes.ts` |
| Rutas docente | `docente/docente.routes.ts` |
| Rutas estudiante | `estudiante/estudiante.routes.ts` |

### Admin
| Buscar | Archivo |
|--------|---------|
| Layout + sidebar | `admin/admin-layout.component.ts` |
| Dashboard | `admin/dashboard/dashboard.component.ts` |
| CRUD estudiantes | `admin/estudiantes/estudiantes.component.ts` |
| CRUD docentes | `admin/docentes/docentes.component.ts` |
| CRUD materiales | `admin/materiales/materiales.component.ts` |
| Perfil | `admin/perfil/perfil.component.ts` |
| Servicio estudiantes | `admin/services/estudiantes.service.ts` |
| Servicio docentes | `admin/services/docentes.service.ts` |
| Servicio materiales | `admin/services/materiales.service.ts` |

### Docente
| Buscar | Archivo |
|--------|---------|
| Layout + sidebar | `docente/docente-layout.component.ts` |
| Dashboard | `docente/dashboard/dashboard.component.ts` |
| Asistencia | `docente/asistencia/asistencia.component.ts` |
| Materiales | `docente/materiales/materiales.component.ts` |
| Perfil | `docente/perfil/perfil.component.ts` |
| Servicio asistencia | `docente/services/asistencia.service.ts` |
| Servicio materiales | `docente/services/materiales.service.ts` |

### Estudiante
| Buscar | Archivo |
|--------|---------|
| Layout + sidebar | `estudiante/estudiante-layout.component.ts` |
| Dashboard | `estudiante/dashboard/dashboard.component.ts` |
| Asistencia | `estudiante/asistencia/asistencia.component.ts` |
| Materiales | `estudiante/materiales/materiales.component.ts` |
| Perfil | `estudiante/perfil/perfil.component.ts` |

### Compartido
| Buscar | Archivo |
|--------|---------|
| Modal genérico | `shared/components/modal/modal.component.ts` |
| Paginación | `shared/components/pagination/pagination.component.ts` |
| Toast | `shared/components/toast/toast.service.ts` |
| Confirm dialog | `shared/components/confirm/confirm.service.ts` |
| Mock data central | `shared/services/mock-data.service.ts` |
| Firestore CRUD genérico | `shared/services/firestore.service.ts` |
| localStorage wrapper | `shared/services/storage.service.ts` |

### Config
| Buscar | Archivo |
|--------|---------|
| Providers globales | `app.config.ts` |
| Tailwind config | `tailwind.config.js` |
| Firebase dev | `environments/environment.ts` |
| Firebase prod | `environments/environment.prod.ts` |
| Estilos globales | `styles.css` |
