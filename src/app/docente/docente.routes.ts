import { Routes } from '@angular/router';
import { roleGuard } from '../auth/guards/role.guard';
import { DocenteLayoutComponent } from './docente-layout.component';

export const docenteRoutes: Routes = [
  {
    path: '',
    component: DocenteLayoutComponent,
    canActivate: [roleGuard('docente')],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard.component').then((m) => m.DocenteDashboardComponent),
      },
      {
        path: 'asistencia',
        loadComponent: () =>
          import('./asistencia/asistencia.component').then((m) => m.AsistenciaComponent),
      },
      {
        path: 'materiales',
        loadComponent: () =>
          import('./materiales/materiales.component').then((m) => m.MaterialesComponent),
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./perfil/perfil.component').then((m) => m.PerfilComponent),
      },
    ],
  },
];
