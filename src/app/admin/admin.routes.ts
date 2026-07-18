import { Routes } from '@angular/router';
import { roleGuard } from '../auth/guards/role.guard';
import { AdminLayoutComponent } from './admin-layout.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [roleGuard('admin')],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard.component').then((m) => m.AdminDashboardComponent),
      },
      {
        path: 'estudiantes',
        loadComponent: () =>
          import('./estudiantes/estudiantes.component').then((m) => m.EstudiantesComponent),
      },
      {
        path: 'docentes',
        loadComponent: () =>
          import('./docentes/docentes.component').then((m) => m.DocentesComponent),
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
