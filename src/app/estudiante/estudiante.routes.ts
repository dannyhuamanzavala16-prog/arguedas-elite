import { Routes } from '@angular/router';
import { roleGuard } from '../auth/guards/role.guard';

export const estudianteRoutes: Routes = [
  {
    path: '',
    canActivate: [roleGuard('estudiante')],
    loadComponent: () => import('./asistencia/asistencia.component').then((m) => m.AsistenciaComponent),
  },
  {
    path: 'asistencia',
    canActivate: [roleGuard('estudiante')],
    loadComponent: () => import('./asistencia/asistencia.component').then((m) => m.AsistenciaComponent),
  },
  {
    path: 'materiales',
    canActivate: [roleGuard('estudiante')],
    loadComponent: () => import('./materiales/materiales.component').then((m) => m.MaterialesComponent),
  },
  {
    path: 'perfil',
    canActivate: [roleGuard('estudiante')],
    loadComponent: () => import('./perfil/perfil.component').then((m) => m.PerfilComponent),
  },
];
