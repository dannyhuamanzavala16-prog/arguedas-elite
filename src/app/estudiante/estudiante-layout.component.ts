import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';

@Component({
  selector: 'app-estudiante-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './estudiante-layout.component.html',
  styleUrl: './estudiante-layout.component.css',
})
export class EstudianteLayoutComponent {
  protected sidebarOpen = signal(false);

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  protected auth = inject(AuthService);

  readonly sidebarLinks = [
    { path: '/estudiante/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/estudiante/asistencia', icon: 'calendar_today', label: 'Asistencia' },
    { path: '/estudiante/materiales', icon: 'folder_open', label: 'Materiales' },
    { path: '/estudiante/perfil', icon: 'person', label: 'Perfil' },
  ];

  get displayName(): string {
    const name = this.auth.getUsername();
    return name ? `Estudiante: ${name.charAt(0).toUpperCase() + name.slice(1)}` : 'Estudiante';
  }
}
