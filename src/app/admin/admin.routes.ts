import { Routes } from '@angular/router';
import { roleGuard } from '../auth/guards/role.guard';

export const adminRoutes: Routes = [
  {
    path: '',
    canActivate: [roleGuard('admin')],
    // TODO: Fase 2 — AdminLayoutComponent con children
    loadComponent: () => import('./estudiantes/estudiantes.component').then((m) => m.EstudiantesComponent),
  },
  {
    path: 'estudiantes',
    canActivate: [roleGuard('admin')],
    loadComponent: () => import('./estudiantes/estudiantes.component').then((m) => m.EstudiantesComponent),
  },
  {
    path: 'docentes',
    canActivate: [roleGuard('admin')],
    loadComponent: () => import('./docentes/docentes.component').then((m) => m.DocentesComponent),
  },
  {
    path: 'materiales',
    canActivate: [roleGuard('admin')],
    loadComponent: () => import('./materiales/materiales.component').then((m) => m.MaterialesComponent),
  },
  {
    path: 'perfil',
    canActivate: [roleGuard('admin')],
    loadComponent: () => import('./perfil/perfil.component').then((m) => m.PerfilComponent),
  },
];
