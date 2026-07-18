import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { FirebaseError } from 'firebase/app';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';
  showError = false;

  // Parallax offsets
  private moveX = 0;
  private moveY = 0;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent): void {
    this.moveX = (e.clientX - window.innerWidth / 2) * 0.01;
    this.moveY = (e.clientY - window.innerHeight / 2) * 0.01;
    document.querySelectorAll('.blur-3xl').forEach((el) => {
      (el as HTMLElement).style.transform = `translate(${this.moveX}px, ${this.moveY}px)`;
    });
  }

  onSubmit(): void {
    this.hideError();

    this.authService.login(this.username, this.password).subscribe({
      next: (success) => {
        if (success) {
          this.router.navigateByUrl(this.authService.getDefaultRoute());
        }
      },
      error: (err: FirebaseError) => {
        const msg = this.getFirebaseErrorMessage(err.code);
        this.showErrorMessage(msg);
      },
    });
  }

  private getFirebaseErrorMessage(code: string): string {
    const messages: Record<string, string> = {
      'auth/user-not-found': 'No existe una cuenta con este correo',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/invalid-credential': 'Correo o contraseña incorrectos',
      'auth/invalid-email': 'Correo electrónico inválido',
      'auth/too-many-requests': 'Demasiados intentos. Intenta de nuevo más tarde',
      'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
    };
    return messages[code] || 'Error de autenticación. Intenta de nuevo';
  }

  togglePassword(
    inputEl: HTMLInputElement,
    iconEl: HTMLElement
  ): void {
    const isPassword = inputEl.type === 'password';
    inputEl.type = isPassword ? 'text' : 'password';
    iconEl.innerText = isPassword ? 'visibility_off' : 'visibility';
  }

  hideError(): void {
    this.showError = false;
    this.errorMessage = '';
  }

  private showErrorMessage(message: string): void {
    this.errorMessage = message;
    this.showError = true;

    // Trigger re-animation on repeated errors
    const el = document.getElementById('login-error');
    if (el) {
      el.classList.remove('shake');
      // Force reflow
      void el.offsetWidth;
      el.classList.add('shake');
    }
  }
}
