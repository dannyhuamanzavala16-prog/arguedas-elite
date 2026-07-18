import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css',
})
export class AdminLayoutComponent {
  protected auth = inject(AuthService);

  readonly navLinks = [
    { path: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/admin/estudiantes', icon: 'school', label: 'Estudiantes' },
    { path: '/admin/docentes', icon: 'group', label: 'Docentes' },
    { path: '/admin/materiales', icon: 'book', label: 'Materiales' },
    { path: '/admin/perfil', icon: 'person', label: 'Perfil' },
  ];

  get displayName(): string {
    const name = this.auth.getUsername();
    return name ? `Admin: ${name.charAt(0).toUpperCase() + name.slice(1)}` : 'Admin';
  }
}
