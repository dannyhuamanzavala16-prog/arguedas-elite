import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from '@angular/fire/auth';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { Observable, Subject, from, map, of, switchMap, Subscription, take } from 'rxjs';
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
  private readonly router = inject(Router);

  private readonly state = signal<AuthState>({
    user: null,
    usuario: null,
    role: null,
  });
  readonly authState = this.state.asReadonly();

  private readonly roleRoutes: Record<UserRole, string> = {
    admin: '/administrador/dashboard',
    docente: '/docente/dashboard',
    estudiante: '/estudiante/dashboard',
  };

  private userSub?: Subscription;
  /** UID del usuario actualmente suscrito — evita re-suscripción innecesaria
   *  cuando Firebase refresca el token (updateProfile/updatePassword). */
  private _currentUid: string | null = null;
  /** Evita que el null transitorio de onAuthStateChanged (causado por
   *  updateProfile al refrescar el token) borre el estado mientras el
   *  usuario sigue logueado. Se activa antes de cada updateProfile. */
  private _ignoringNextNull = false;
  private _ignoreNullTimer?: ReturnType<typeof setTimeout>;

  /** Se emite cada vez que termina de resolverse el perfil de un usuario. */
  private readonly profileLoaded$ = new Subject<void>();
  /** UID cuyo perfil ya fue resuelto (exista o no el documento). */
  private _profileResolvedFor: string | null = null;

  private readonly _isLoaded = signal(false);
  readonly isLoaded = this._isLoaded.asReadonly();

  private resolveInit!: (value: boolean) => void;
  readonly isInitialized = new Promise<boolean>((resolve) => {
    this.resolveInit = resolve;
  });

  constructor() {
    // Escucha cambios en el estado de autenticación de Firebase
    onAuthStateChanged(this.auth, (user) => {
      if (!user && this._ignoringNextNull) {
        return;
      }

      if (user) {
        if (user.uid === this._currentUid) {
          return;
        }
        this.userSub?.unsubscribe();
        this._currentUid = user.uid;
        this.userSub = this.loadUserData(user).subscribe({
          error: () => {
            this.markProfileResolved(user.uid);
            this._isLoaded.set(true);
            this.resolveInit(true);
          },
        });
      } else {
        this.userSub?.unsubscribe();
        this._currentUid = null;
        this._profileResolvedFor = null;
        this.state.set({ user: null, usuario: null, role: null });
        this._isLoaded.set(true);
        this.resolveInit(true);
      }
    });
  }

  /** Llamar ANTES de updateProfile() para suprimir el null transitorio */
  markProfileUpdate(): void {
    this._ignoringNextNull = true;
    clearTimeout(this._ignoreNullTimer);
    // Ventana de seguridad: si Firebase no emite el usuario en 5s, resetea
    this._ignoreNullTimer = setTimeout(() => {
      this._ignoringNextNull = false;
    }, 5000);
  }

  /** Llamar DESPUÉS de que updateProfile() resuelva */
  clearProfileUpdateFlag(): void {
    this._ignoringNextNull = false;
    clearTimeout(this._ignoreNullTimer);
  }

  /** Inicia sesión con email y contraseña.
   *  No vuelve a leer el perfil: espera al listener global de auth
   *  para evitar una lectura duplicada de Firestore. */
  login(email: string, password: string): Observable<boolean> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap((cred) => this.profileFor(cred.user)),
      take(1),
      map((usuario) => usuario !== null),
    );
  }

  /** Cierra sesión */
  async logout(): Promise<void> {
    this.userSub?.unsubscribe();
    this._currentUid = null;
    await signOut(this.auth);
    this.state.set({ user: null, usuario: null, role: null });
  }

  /** Cierra sesión y recién después navega al login.
   *  No usar `routerLink="/login"` junto al logout: la navegación
   *  ocurriría antes de que `signOut` termine y el login redirigiría
   *  de vuelta al dashboard. */
  async logoutAndRedirect(): Promise<void> {
    await this.logout();
    await this.router.navigateByUrl('/login');
  }

  /** Carga los datos del usuario desde Firestore */
  private loadUserData(user: User): Observable<Usuario | null> {
    const userDoc = doc(this.firestore, `usuarios/${user.uid}`);
    return docData(userDoc).pipe(
      map((data: any) => {
        if (!data) {
          this.markProfileResolved(user.uid);
          this._isLoaded.set(true);
          this.resolveInit(true);
          return null;
        }
        const usuario: Usuario = {
          username: data.username ?? user.email ?? '',
          role: data.role,
          nombre: data.nombre ?? user.displayName ?? '',
          email: data.email ?? user.email ?? '',
          foto: data.foto ?? undefined,
        };
        this.state.set({ user, usuario, role: usuario.role });
        this.markProfileResolved(user.uid);
        this._isLoaded.set(true);
        this.resolveInit(true);
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

  /** Espera a que el listener global resuelva el perfil, sin duplicar lecturas. */
  private profileFor(user: User): Observable<Usuario | null> {
    if (this._profileResolvedFor === user.uid) {
      return of(this.state().usuario);
    }
    return this.profileLoaded$.pipe(
      take(1),
      map(() => this.state().usuario),
    );
  }

  private markProfileResolved(uid: string): void {
    this._profileResolvedFor = uid;
    this.profileLoaded$.next();
  }

  isLoggedIn(): boolean {
    return this.state().user !== null;
  }

  /** @deprecated Usá getUsuario()?.nombre o getUsuario()?.email */
  getUsername(): string | null {
    return this.state().usuario?.nombre ?? this.state().usuario?.username ?? this.state().usuario?.email ?? null;
  }

  getDefaultRoute(): string {
    const role = this.getUserRole();
    return role ? this.roleRoutes[role] : '/login';
  }
}
