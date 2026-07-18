import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export type UserRole = 'admin' | 'docente' | 'estudiante';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly USER_KEY = 'arguedas_user';
  private readonly ROLE_KEY = 'arguedas_role';

  private readonly roleRoutes: Record<UserRole, string> = {
    admin: '/admin/estudiantes',
    docente: '/docente/asistencia',
    estudiante: '/estudiante/asistencia',
  };

  login(username: string, _password: string): Observable<boolean> {
    const role = this.resolveRole(username);
    if (role) {
      localStorage.setItem(this.USER_KEY, username.toLowerCase().trim());
      localStorage.setItem(this.ROLE_KEY, role);
      return of(true);
    }
    return of(false);
  }

  private resolveRole(username: string): UserRole | null {
    const map: Record<string, UserRole> = {
      admin: 'admin',
      docente: 'docente',
      estudiante: 'estudiante',
    };
    return map[username.toLowerCase().trim()] ?? null;
  }

  getUserRole(): UserRole | null {
    return localStorage.getItem(this.ROLE_KEY) as UserRole | null;
  }

  getUsername(): string | null {
    return localStorage.getItem(this.USER_KEY);
  }

  isLoggedIn(): boolean {
    return this.getUserRole() !== null;
  }

  getDefaultRoute(): string {
    const role = this.getUserRole();
    return role ? this.roleRoutes[role] : '/login';
  }

  logout(): void {
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.ROLE_KEY);
  }
}
