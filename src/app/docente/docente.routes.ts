import { Routes } from '@angular/router';
import { roleGuard } from '../auth/guards/role.guard';

export const docenteRoutes: Routes = [
  {
    path: '',
    canActivate: [roleGuard('docente')],
    loadComponent: () => import('./asistencia/asistencia.component').then((m) => m.AsistenciaComponent),
  },
  {
    path: 'asistencia',
    canActivate: [roleGuard('docente')],
    loadComponent: () => import('./asistencia/asistencia.component').then((m) => m.AsistenciaComponent),
  },
  {
    path: 'materiales',
    canActivate: [roleGuard('docente')],
    loadComponent: () => import('./materiales/materiales.component').then((m) => m.MaterialesComponent),
  },
  {
    path: 'perfil',
    canActivate: [roleGuard('docente')],
    loadComponent: () => import('./perfil/perfil.component').then((m) => m.PerfilComponent),
  },
];
