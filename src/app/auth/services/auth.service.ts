import { Injectable, inject, signal } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from '@angular/fire/auth';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { Observable, from, map, of, switchMap } from 'rxjs';
export type { UserRole } from '../../shared/models/usuario.model';
import { UserRole, Usuario } from '../../shared/models/usuario.model';

export interface AuthState {
  user: User | null;
  usuario: Usuario | null;
  role: UserRole | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly firestore = inject(Firestore);

  private readonly state = signal<AuthState>({
    user: null,
    usuario: null,
    role: null,
  });
  readonly authState = this.state.asReadonly();

  private readonly roleRoutes: Record<UserRole, string> = {
    admin: '/admin/estudiantes',
    docente: '/docente/asistencia',
    estudiante: '/estudiante/asistencia',
  };

  constructor() {
    // Escucha cambios en el estado de autenticación de Firebase
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.loadUserData(user);
      } else {
        this.state.set({ user: null, usuario: null, role: null });
      }
    });
  }

  /** Inicia sesión con email y contraseña */
  login(email: string, password: string): Observable<boolean> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap((cred) => this.loadUserData(cred.user)),
      map(() => true),
    );
  }

  /** Cierra sesión */
  async logout(): Promise<void> {
    await signOut(this.auth);
    this.state.set({ user: null, usuario: null, role: null });
  }

  /** Carga los datos del usuario desde Firestore */
  private loadUserData(user: User): Observable<Usuario | null> {
    const userDoc = doc(this.firestore, `usuarios/${user.uid}`);
    return docData(userDoc).pipe(
      map((data: any) => {
        if (!data) return null;
        const usuario: Usuario = {
          username: data.username ?? user.email ?? '',
          role: data.role,
          nombre: data.nombre ?? user.displayName ?? '',
          email: data.email ?? user.email ?? '',
        };
        this.state.set({ user, usuario, role: usuario.role });
        return usuario;
      }),
    );
  }

  getUserRole(): UserRole | null {
    return this.state().role;
  }

  getUsuario(): Usuario | null {
    return this.state().usuario;
  }

  isLoggedIn(): boolean {
    return this.state().user !== null;
  }

  /** @deprecated Usá getUsuario()?.nombre o getUsuario()?.email */
  getUsername(): string | null {
    return this.state().usuario?.username ?? this.state().usuario?.email ?? null;
  }

  getDefaultRoute(): string {
    const role = this.getUserRole();
    return role ? this.roleRoutes[role] : '/login';
  }
}
