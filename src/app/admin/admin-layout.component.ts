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
    { path: '/administrador/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/administrador/estudiantes', icon: 'school', label: 'Estudiantes' },
    { path: '/administrador/docentes', icon: 'group', label: 'Docentes' },
    { path: '/administrador/materiales', icon: 'book', label: 'Materiales' },
    { path: '/administrador/perfil', icon: 'person', label: 'Perfil' },
  ];

  get displayName(): string {
    const name = this.auth.getUsername();
    return name ? `Admin: ${name.charAt(0).toUpperCase() + name.slice(1)}` : 'Admin';
  }
}
