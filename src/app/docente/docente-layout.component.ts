import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';

@Component({
  selector: 'app-docente-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './docente-layout.component.html',
  styleUrl: './docente-layout.component.css',
})
export class DocenteLayoutComponent {
  protected auth = inject(AuthService);

  readonly sidebarLinks = [
    { path: '/docente/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/docente/asistencia', icon: 'how_to_reg', label: 'Asistencia' },
    { path: '/docente/materiales', icon: 'book', label: 'Materiales' },
    { path: '/docente/perfil', icon: 'person', label: 'Perfil' },
  ];

  readonly mobileLinks = [
    { path: '/docente/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/docente/asistencia', icon: 'how_to_reg', label: 'Asistencia' },
    { path: '/docente/materiales', icon: 'book', label: 'Materiales' },
  ];

  get displayName(): string {
    const name = this.auth.getUsername();
    return name ? `Docente: ${name.charAt(0).toUpperCase() + name.slice(1)}` : 'Docente';
  }
}
