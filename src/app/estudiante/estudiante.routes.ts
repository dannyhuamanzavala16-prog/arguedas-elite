import { Routes } from '@angular/router';
import { roleGuard } from '../auth/guards/role.guard';
import { EstudianteLayoutComponent } from './estudiante-layout.component';

export const estudianteRoutes: Routes = [
  {
    path: '',
    component: EstudianteLayoutComponent,
    canActivate: [roleGuard('estudiante')],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard.component').then((m) => m.EstudianteDashboardComponent),
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
