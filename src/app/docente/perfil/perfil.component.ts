import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { distinctUntilChanged, map, of, switchMap } from 'rxjs';
import {
  Auth,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User,
} from '@angular/fire/auth';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { AuthService } from '../../auth/services/auth.service';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ToastService } from '../../shared/components/toast/toast.service';

interface PerfilExtendido {
  telefono?: string;
  especializacion?: string;
  fechaNacimiento?: string;
  foto?: string;
}

@Component({
  selector: 'app-perfil-docente',
  standalone: true,
  imports: [FormsModule, ModalComponent],
  template: `
    <div class="max-w-4xl mx-auto p-md md:p-lg space-y-lg">
      <!-- Profile Identity Card -->
      <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
        <div class="bg-primary h-24"></div>
        <div class="px-md pb-md -mt-12 flex flex-col items-center">
          @if (perfilExt()?.foto) {
            <div class="w-24 h-24 rounded-full overflow-hidden border-4 border-surface-container-lowest shadow-lg">
              <img [src]="perfilExt()?.foto" alt="Foto de perfil" class="w-full h-full object-cover" />
            </div>
          } @else {
            <div class="w-24 h-24 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container border-4 border-surface-container-lowest shadow-lg">
              <span class="font-headline-lg text-headline-lg font-bold select-none">{{ initiales() }}</span>
            </div>
          }
          <h2 class="font-headline-lg text-headline-lg text-center text-on-surface mt-sm">{{ usuario()?.nombre || 'Docente' }}</h2>
          <p class="font-body-md text-body-md text-center text-on-surface-variant">{{ usuario()?.email }}</p>
          <span class="mt-xs inline-flex items-center gap-1 bg-primary/10 text-primary rounded-full px-3 py-1 font-label-sm text-label-sm capitalize">
            <span class="material-symbols-outlined" style="font-size: 14px;">verified</span>
            {{ usuario()?.role || 'docente' }}
          </span>
        </div>
      </div>

      <!-- Info Cards -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <!-- Datos Personales -->
        <div class="lg:col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden">
          <div class="px-md py-sm border-b border-outline-variant/10 bg-surface-container-low">
            <h3 class="font-headline-sm text-headline-sm text-primary">Datos Personales</h3>
          </div>
          <div class="p-md">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-y-base gap-x-lg">
              <div class="border-b border-surface-container py-base">
                <p class="font-label-sm text-label-sm text-on-surface-variant uppercase mb-xs">Nombre Completo</p>
                <p class="font-body-md text-body-md font-semibold">{{ usuario()?.nombre || '—' }}</p>
              </div>
              <div class="border-b border-surface-container py-base">
                <p class="font-label-sm text-label-sm text-on-surface-variant uppercase mb-xs">Correo Institucional</p>
                <p class="font-body-md text-body-md font-semibold text-primary">{{ usuario()?.email || '—' }}</p>
              </div>
              <div class="border-b border-surface-container py-base">
                <p class="font-label-sm text-label-sm text-on-surface-variant uppercase mb-xs">Teléfono de Contacto</p>
                <p class="font-body-md text-body-md font-semibold">{{ perfilExt()?.telefono || '—' }}</p>
              </div>
              <div class="border-b border-surface-container py-base">
                <p class="font-label-sm text-label-sm text-on-surface-variant uppercase mb-xs">Especialización</p>
                <p class="font-body-md text-body-md font-semibold">{{ perfilExt()?.especializacion || '—' }}</p>
              </div>
              <div class="border-b border-surface-container py-base">
                <p class="font-label-sm text-label-sm text-on-surface-variant uppercase mb-xs">Fecha de Nacimiento</p>
                <p class="font-body-md text-body-md font-semibold">{{ perfilExt()?.fechaNacimiento || '—' }}</p>
              </div>
              <div class="border-b border-surface-container py-base">
                <p class="font-label-sm text-label-sm text-on-surface-variant uppercase mb-xs">Rol</p>
                <p class="font-body-md text-body-md font-semibold capitalize">{{ usuario()?.role || 'docente' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Acciones -->
        <div class="bg-surface-container-lowest rounded-xl border border-outline-variant/10 p-md space-y-md">
          <h3 class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Acciones</h3>
          <button class="w-full flex items-center gap-3 p-sm border border-outline/20 rounded-lg hover:bg-surface-container-low transition-colors text-left"
                  (click)="openChangePassword()">
            <span class="material-symbols-outlined text-tertiary">lock</span>
            <div>
              <p class="font-label-md text-label-md text-on-surface">Cambiar Contraseña</p>
              <p class="font-body-sm text-body-sm text-on-surface-variant">Actualiza tu acceso</p>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Change Password Modal -->
    <app-modal [isOpen]="showChangePassword()" (close)="showChangePassword.set(false)">
      <div class="p-md border-b border-outline/10 flex justify-between items-center">
        <h3 class="font-headline-sm text-headline-sm text-on-surface">Cambiar Contraseña</h3>
        <button class="w-9 h-9 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
                (click)="showChangePassword.set(false)">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <form class="p-md space-y-md" (ngSubmit)="handleChangePassword($event)">
        @if (cpFeedback()) {
          <div class="text-body-sm font-body-sm text-center rounded-lg px-4 py-2"
               [class.text-green-800]="cpSuccess()" [class.bg-green-100]="cpSuccess()"
               [class.text-red-800]="!cpSuccess()" [class.bg-red-100]="!cpSuccess()">
            {{ cpFeedback() }}
          </div>
        }
        <div class="space-y-1">
          <label class="font-label-sm text-label-sm text-on-surface-variant block">Contraseña actual</label>
          <div class="relative">
            <input [type]="showCurrent() ? 'text' : 'password'" [(ngModel)]="cpCurrent" name="cpCurrent" required
                   class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 px-3 pr-12 font-body-md text-body-md focus:border-primary focus:bg-white transition-all" />
            <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary"
                    (click)="showCurrent.update(v => !v)">
              <span class="material-symbols-outlined">{{ showCurrent() ? 'visibility_off' : 'visibility' }}</span>
            </button>
          </div>
        </div>
        <div class="space-y-1">
          <label class="font-label-sm text-label-sm text-on-surface-variant block">Nueva contraseña</label>
          <div class="relative">
            <input [type]="showNew() ? 'text' : 'password'" [(ngModel)]="cpNew" name="cpNew" required
                   class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 px-3 pr-12 font-body-md text-body-md focus:border-primary focus:bg-white transition-all" />
            <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary"
                    (click)="showNew.update(v => !v)">
              <span class="material-symbols-outlined">{{ showNew() ? 'visibility_off' : 'visibility' }}</span>
            </button>
          </div>
        </div>
        <div class="space-y-1">
          <label class="font-label-sm text-label-sm text-on-surface-variant block">Confirmar nueva contraseña</label>
          <div class="relative">
            <input [type]="showConfirm() ? 'text' : 'password'" [(ngModel)]="cpConfirm" name="cpConfirm" required
                   class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 px-3 pr-12 font-body-md text-body-md focus:border-primary focus:bg-white transition-all" />
            <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary"
                    (click)="showConfirm.update(v => !v)">
              <span class="material-symbols-outlined">{{ showConfirm() ? 'visibility_off' : 'visibility' }}</span>
            </button>
          </div>
        </div>
        <div class="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-sm border-t border-outline/10">
          <button type="button"
                  class="border border-outline/20 px-md py-2.5 rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors w-full sm:w-auto"
                  (click)="showChangePassword.set(false)">Cancelar</button>
          <button type="submit"
                  class="bg-primary text-on-primary px-md py-2.5 rounded-lg font-label-md text-label-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 w-full sm:w-auto"
                  [disabled]="cpSaving()">
            @if (cpSaving()) {
              <span class="material-symbols-outlined animate-spin" style="font-size:18px">progress_activity</span> Cambiando...
            } @else {
              Cambiar Contraseña
            }
          </button>
        </div>
      </form>
    </app-modal>
  `,
})
export class PerfilComponent {
  private readonly auth = inject(Auth);
  private readonly firestore = inject(Firestore);
  protected readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);

  // Datos básicos del usuario (nombre, email, rol) — reactivos desde AuthService
  readonly usuario = computed(() => this.authService.getUsuario());

  readonly initiales = computed(() => {
    const nombre = this.usuario()?.nombre ?? '';
    return nombre.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || 'D';
  });

  // Datos extendidos del docente (teléfono, especialización, etc.) — leídos en tiempo real de Firestore
  private readonly perfilDoc = toSignal(
    toObservable(this.authService.authState).pipe(
      map((state) => state.user?.uid ?? null),
      distinctUntilChanged(),
      switchMap((uid) =>
        uid ? docData(doc(this.firestore, `usuarios/${uid}`)) : of(null)
      )
    ),
    { initialValue: null }
  );

  readonly perfilExt = computed<PerfilExtendido | null>(() => {
    const data = this.perfilDoc() as Record<string, any> | null | undefined;
    if (!data) return null;
    return {
      telefono: data['telefono'] ?? '',
      especializacion: data['especializacion'] ?? '',
      fechaNacimiento: data['fechaNacimiento'] ?? '',
      foto: data['foto'] ?? '',
    };
  });

  // Change password
  readonly showChangePassword = signal(false);
  cpCurrent = '';
  cpNew = '';
  cpConfirm = '';
  cpFeedback = signal('');
  cpSuccess = signal(false);
  cpSaving = signal(false);
  readonly showCurrent = signal(false);
  readonly showNew = signal(false);
  readonly showConfirm = signal(false);

  openChangePassword(): void {
    this.cpCurrent = '';
    this.cpNew = '';
    this.cpConfirm = '';
    this.cpFeedback.set('');
    this.cpSuccess.set(false);
    this.showChangePassword.set(true);
  }

  async handleChangePassword(event?: Event): Promise<void> {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!this.cpCurrent || !this.cpNew || !this.cpConfirm) {
      this.cpFeedback.set('Todos los campos son obligatorios.');
      this.cpSuccess.set(false);
      return;
    }
    if (this.cpNew.length < 8) {
      this.cpFeedback.set('La nueva contraseña debe tener al menos 8 caracteres.');
      this.cpSuccess.set(false);
      return;
    }
    if (!/[a-z]/.test(this.cpNew) || !/[A-Z]/.test(this.cpNew) || !/\d/.test(this.cpNew)) {
      this.cpFeedback.set('La contraseña debe incluir mayúscula, minúscula y número.');
      this.cpSuccess.set(false);
      return;
    }
    if (this.cpNew !== this.cpConfirm) {
      this.cpFeedback.set('Las contraseñas nuevas no coinciden.');
      this.cpSuccess.set(false);
      return;
    }
    if (this.cpCurrent === this.cpNew) {
      this.cpFeedback.set('La nueva contraseña debe ser diferente a la actual.');
      this.cpSuccess.set(false);
      return;
    }

    const currentUser: User | null = this.auth.currentUser;
    if (!currentUser || !currentUser.email) {
      this.cpFeedback.set('Sesión expirada. Volvé a iniciar sesión.');
      this.cpSuccess.set(false);
      return;
    }

    this.cpSaving.set(true);
    this.authService.markProfileUpdate();
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, this.cpCurrent);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, this.cpNew);

      this.cpFeedback.set('Contraseña cambiada exitosamente.');
      this.cpSuccess.set(true);
      this.cpCurrent = '';
      this.cpNew = '';
      this.cpConfirm = '';
      this.toast.show('Contraseña actualizada', 'success');
      setTimeout(() => { this.showChangePassword.set(false); this.cpFeedback.set(''); }, 1500);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        this.cpFeedback.set('La contraseña actual es incorrecta.');
      } else if (err.code === 'auth/too-many-requests') {
        this.cpFeedback.set('Demasiados intentos. Esperá unos minutos.');
      } else {
        this.cpFeedback.set('Error al cambiar la contraseña. Intentá de nuevo.');
      }
      this.cpSuccess.set(false);
    } finally {
      this.cpSaving.set(false);
      // El flag _ignoringNextNull se limpia solo vía timeout en markProfileUpdate()
    }
  }
}
