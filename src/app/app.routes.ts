import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { authGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  // Admin routes (lazy-loaded when we create the module)
  {
    path: 'administrador',
    canActivate: [authGuard],
    loadChildren: () => import('./admin/admin.routes').then((m) => m.adminRoutes),
  },

  // Docente routes
  {
    path: 'docente',
    canActivate: [authGuard],
    loadChildren: () => import('./docente/docente.routes').then((m) => m.docenteRoutes),
  },

  // Estudiante routes
  {
    path: 'estudiante',
    canActivate: [authGuard],
    loadChildren: () => import('./estudiante/estudiante.routes').then((m) => m.estudianteRoutes),
  },

  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];
