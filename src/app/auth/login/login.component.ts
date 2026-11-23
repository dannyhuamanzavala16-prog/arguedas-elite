import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { FirebaseError } from 'firebase/app';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements AfterViewInit {
  username = '';
  password = '';

  readonly isLoading = signal(false);
  readonly showError = signal(false);
  readonly errorMessage = signal('');
  readonly showPassword = signal(false);

  private blobs: HTMLElement[] = [];
  private readonly reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly host: ElementRef<HTMLElement>,
  ) {
    // Si ya hay una sesión activa, el login no tiene sentido
    void this.authService.isInitialized.then(() => {
      if (this.authService.isLoggedIn()) {
        void this.router.navigateByUrl(this.authService.getDefaultRoute());
      }
    });
  }

  ngAfterViewInit(): void {
    this.blobs = Array.from(
      this.host.nativeElement.querySelectorAll<HTMLElement>('.blur-3xl')
    );
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.reduceMotion || !this.blobs.length) {
      return;
    }

    const x = (event.clientX - window.innerWidth / 2) * 0.01;
    const y = (event.clientY - window.innerHeight / 2) * 0.01;

    for (const blob of this.blobs) {
      blob.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }
  }

  onSubmit(form: NgForm): void {
    if (form.invalid || this.isLoading()) {
      return;
    }

    this.hideError();
    this.isLoading.set(true);

    const email = `${this.username.trim()}@arguedas.edu.pe`;

    this.authService.login(email, this.password).subscribe({
      next: (success) => {
        this.isLoading.set(false);

        if (success) {
          void this.router.navigateByUrl(this.authService.getDefaultRoute());
        } else {
          this.showErrorMessage(
            'Tu cuenta no tiene un perfil asignado. Contactá al administrador.'
          );
        }
      },
      error: (err: FirebaseError) => {
        this.isLoading.set(false);
        console.error('[Login] Firebase error code:', err?.code, err);
        this.showErrorMessage(this.getFirebaseErrorMessage(err?.code));
      },
    });
  }

  togglePassword(): void {
    this.showPassword.update((visible) => !visible);
  }

  hideError(): void {
    this.showError.set(false);
    this.errorMessage.set('');
  }

  private getFirebaseErrorMessage(code?: string): string {
    const messages: Record<string, string> = {
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/invalid-credential': 'Usuario o contraseña incorrectos',
      'auth/invalid-email': 'Usuario inválido',
      'auth/too-many-requests': 'Demasiados intentos. Intentá de nuevo más tarde',
      'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
    };
    return (code && messages[code]) || 'Error de autenticación. Intentá de nuevo';
  }

  private showErrorMessage(message: string): void {
    this.errorMessage.set(message);
    this.showError.set(true);
  }
}
