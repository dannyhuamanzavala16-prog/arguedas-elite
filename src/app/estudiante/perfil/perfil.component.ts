import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Auth,
  updatePassword,
  updateProfile,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User,
} from '@angular/fire/auth';
import { Firestore, doc, updateDoc, docData } from '@angular/fire/firestore';
import { AuthService } from '../../auth/services/auth.service';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ToastService } from '../../shared/components/toast/toast.service';

interface PerfilExtendido {
  telefono?: string;
  fechaNacimiento?: string;
  direccion?: string;
}

@Component({
  selector: 'app-perfil-estudiante',
  standalone: true,
  imports: [FormsModule, ModalComponent],
  template: `
    <div class="max-w-4xl mx-auto p-md md:p-lg space-y-lg">
      <!-- Profile Header Card -->
      <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
        <div class="h-32 bg-primary relative">
          <div class="absolute inset-0 opacity-10"
               style="background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0); background-size: 24px 24px;">
          </div>
        </div>
        <div class="px-md pb-md -mt-16 text-center relative z-10">
          <div class="inline-block p-1 bg-surface-container-lowest rounded-full shadow-lg mb-sm">
            <div class="w-32 h-32 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container border-4 border-surface-container-lowest">
              <span class="font-headline-lg text-headline-lg font-bold select-none">{{ initiales() }}</span>
            </div>
          </div>
          <h2 class="font-headline-md text-headline-md text-primary">{{ usuario()?.nombre || 'Estudiante' }}</h2>
          <p class="font-body-md text-body-md text-on-surface-variant">{{ usuario()?.email }}</p>
          <span class="mt-xs inline-flex items-center gap-1 bg-primary/10 text-primary rounded-full px-3 py-1 font-label-sm text-label-sm capitalize">
            <span class="material-symbols-outlined" style="font-size: 14px;">verified</span>
            {{ usuario()?.role || 'estudiante' }}
          </span>
          <div class="grid grid-cols-2 gap-sm border-t border-outline-variant/20 pt-md max-w-xs mx-auto mt-md">
            <div class="text-center">
              <p class="text-label-sm text-on-surface-variant uppercase tracking-wider">Ciclo</p>
              <p class="font-bold text-primary">2024-II</p>
            </div>
            <div class="text-center">
              <p class="text-label-sm text-on-surface-variant uppercase tracking-wider">Turno</p>
              <p class="font-bold text-primary">Mañana</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Datos Personales + Seguridad -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <!-- Form Section -->
        <div class="lg:col-span-2 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
          <div class="px-md py-sm border-b border-outline-variant/10 bg-surface-container-low">
            <h3 class="font-headline-sm text-headline-sm text-primary">Datos Personales</h3>
            <p class="text-on-surface-variant font-body-sm text-body-sm">Mantén tu información actualizada.</p>
          </div>
          <div class="p-md">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-y-base gap-x-lg">
              <div class="border-b border-surface-container py-base">
                <p class="font-label-sm text-label-sm text-on-surface-variant uppercase mb-xs">Nombres Completos</p>
                <p class="font-body-md text-body-md font-semibold">{{ usuario()?.nombre || '—' }}</p>
              </div>
              <div class="border-b border-surface-container py-base">
                <p class="font-label-sm text-label-sm text-on-surface-variant uppercase mb-xs">Correo Electrónico</p>
                <p class="font-body-md text-body-md font-semibold text-primary">{{ usuario()?.email || '—' }}</p>
              </div>
              <div class="border-b border-surface-container py-base">
                <p class="font-label-sm text-label-sm text-on-surface-variant uppercase mb-xs">Teléfono de Contacto</p>
                <p class="font-body-md text-body-md font-semibold">{{ perfilExt()?.telefono || '—' }}</p>
              </div>
              <div class="border-b border-surface-container py-base">
                <p class="font-label-sm text-label-sm text-on-surface-variant uppercase mb-xs">Fecha de Nacimiento</p>
                <p class="font-body-md text-body-md font-semibold">{{ perfilExt()?.fechaNacimiento || '—' }}</p>
              </div>
              <div class="md:col-span-2 border-b border-surface-container py-base">
                <p class="font-label-sm text-label-sm text-on-surface-variant uppercase mb-xs">Dirección de Domicilio</p>
                <p class="font-body-md text-body-md font-semibold">{{ perfilExt()?.direccion || '—' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Acciones -->
        <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 p-md space-y-md">
          <h3 class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Acciones</h3>
          <button class="w-full flex items-center gap-3 p-sm border border-outline/20 rounded-lg hover:bg-surface-container-low transition-colors text-left"
                  (click)="openEditProfile()">
            <span class="material-symbols-outlined text-primary">edit</span>
            <div>
              <p class="font-label-md text-label-md text-on-surface">Editar Perfil</p>
              <p class="font-body-sm text-body-sm text-on-surface-variant">Actualiza tus datos</p>
            </div>
          </button>
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

    <!-- Edit Profile Modal -->
    <app-modal [isOpen]="showEditProfile" (close)="showEditProfile = false">
      <div class="p-md border-b border-outline/10 flex justify-between items-center">
        <h3 class="font-headline-sm text-headline-sm text-on-surface">Editar Perfil</h3>
        <button class="w-9 h-9 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
                (click)="showEditProfile = false">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <form class="p-md space-y-md" (ngSubmit)="handleEditProfile($event)">
        @if (epFeedback()) {
          <div class="text-body-sm font-body-sm text-center rounded-lg px-4 py-2"
               [class.text-green-800]="epSuccess()" [class.bg-green-100]="epSuccess()"
               [class.text-red-800]="!epSuccess()" [class.bg-red-100]="!epSuccess()">
            {{ epFeedback() }}
          </div>
        }
        <div class="space-y-1">
          <label class="font-label-sm text-label-sm text-on-surface-variant block">Nombres Completos</label>
          <input type="text" [(ngModel)]="epNombre" name="epNombre" required
                 class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 px-3 font-body-md text-body-md focus:border-primary focus:bg-white transition-all" />
        </div>
        <div class="space-y-1">
          <label class="font-label-sm text-label-sm text-on-surface-variant block">Teléfono de Contacto</label>
          <input type="tel" [(ngModel)]="epTelefono" name="epTelefono"
                 class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 px-3 font-body-md text-body-md focus:border-primary focus:bg-white transition-all"
                 placeholder="+51 999 999 999" />
        </div>
        <div class="space-y-1">
          <label class="font-label-sm text-label-sm text-on-surface-variant block">Fecha de Nacimiento</label>
          <input type="text" [(ngModel)]="epFechaNacimiento" name="epFechaNacimiento"
                 class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 px-3 font-body-md text-body-md focus:border-primary focus:bg-white transition-all"
                 placeholder="15 de Mayo, 2005" />
        </div>
        <div class="space-y-1">
          <label class="font-label-sm text-label-sm text-on-surface-variant block">Dirección de Domicilio</label>
          <input type="text" [(ngModel)]="epDireccion" name="epDireccion"
                 class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 px-3 font-body-md text-body-md focus:border-primary focus:bg-white transition-all"
                 placeholder="Av. Javier Prado Este 2540, San Borja, Lima" />
        </div>
        <div class="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-sm border-t border-outline/10">
          <button type="button"
                  class="border border-outline/20 px-md py-2.5 rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors w-full sm:w-auto"
                  (click)="showEditProfile = false">Cancelar</button>
          <button type="submit"
                  class="bg-primary text-on-primary px-md py-2.5 rounded-lg font-label-md text-label-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 w-full sm:w-auto"
                  [disabled]="epSaving()">
            @if (epSaving()) {
              <span class="material-symbols-outlined animate-spin" style="font-size:18px">progress_activity</span> Guardando...
            } @else {
              Guardar
            }
          </button>
        </div>
      </form>
    </app-modal>

    <!-- Change Password Modal -->
    <app-modal [isOpen]="showChangePassword" (close)="showChangePassword = false">
      <div class="p-md border-b border-outline/10 flex justify-between items-center">
        <h3 class="font-headline-sm text-headline-sm text-on-surface">Cambiar Contraseña</h3>
        <button class="w-9 h-9 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
                (click)="showChangePassword = false">
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
            <input [type]="showCurrent ? 'text' : 'password'" [(ngModel)]="cpCurrent" name="cpCurrent" required
                   class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 px-3 pr-12 font-body-md text-body-md focus:border-primary focus:bg-white transition-all" />
            <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary"
                    (click)="showCurrent = !showCurrent">
              <span class="material-symbols-outlined">{{ showCurrent ? 'visibility_off' : 'visibility' }}</span>
            </button>
          </div>
        </div>
        <div class="space-y-1">
          <label class="font-label-sm text-label-sm text-on-surface-variant block">Nueva contraseña</label>
          <div class="relative">
            <input [type]="showNew ? 'text' : 'password'" [(ngModel)]="cpNew" name="cpNew" required
                   class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 px-3 pr-12 font-body-md text-body-md focus:border-primary focus:bg-white transition-all" />
            <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary"
                    (click)="showNew = !showNew">
              <span class="material-symbols-outlined">{{ showNew ? 'visibility_off' : 'visibility' }}</span>
            </button>
          </div>
        </div>
        <div class="space-y-1">
          <label class="font-label-sm text-label-sm text-on-surface-variant block">Confirmar nueva contraseña</label>
          <div class="relative">
            <input [type]="showConfirm ? 'text' : 'password'" [(ngModel)]="cpConfirm" name="cpConfirm" required
                   class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 px-3 pr-12 font-body-md text-body-md focus:border-primary focus:bg-white transition-all" />
            <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary"
                    (click)="showConfirm = !showConfirm">
              <span class="material-symbols-outlined">{{ showConfirm ? 'visibility_off' : 'visibility' }}</span>
            </button>
          </div>
        </div>
        <div class="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-sm border-t border-outline/10">
          <button type="button"
                  class="border border-outline/20 px-md py-2.5 rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors w-full sm:w-auto"
                  (click)="showChangePassword = false">Cancelar</button>
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
    return nombre.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || 'E';
  });

  // Datos extendidos del estudiante (teléfono, fechaNacimiento, dirección) — leídos en tiempo real de Firestore
  private readonly _perfilExt = signal<PerfilExtendido | null>(null);
  readonly perfilExt = this._perfilExt.asReadonly();

  // Edit profile
  showEditProfile = false;
  epNombre = '';
  epTelefono = '';
  epFechaNacimiento = '';
  epDireccion = '';
  epFeedback = signal('');
  epSuccess = signal(false);
  epSaving = signal(false);

  // Change password
  showChangePassword = false;
  cpCurrent = '';
  cpNew = '';
  cpConfirm = '';
  cpFeedback = signal('');
  cpSuccess = signal(false);
  cpSaving = signal(false);
  showCurrent = false;
  showNew = false;
  showConfirm = false;

  constructor() {
    // Cuando el estado de auth cambia, suscribirse al documento del usuario en Firestore
    effect(() => {
      const state = this.authService.authState();
      const uid = state.user?.uid;
      if (uid) {
        const docRef = doc(this.firestore, `usuarios/${uid}`);
        docData(docRef).subscribe((data: any) => {
          this._perfilExt.set({
            telefono: data?.telefono ?? '',
            fechaNacimiento: data?.fechaNacimiento ?? '',
            direccion: data?.direccion ?? '',
          });
        });
      }
    });
  }

  openEditProfile(): void {
    this.epNombre = this.usuario()?.nombre ?? '';
    this.epTelefono = this._perfilExt()?.telefono ?? '';
    this.epFechaNacimiento = this._perfilExt()?.fechaNacimiento ?? '';
    this.epDireccion = this._perfilExt()?.direccion ?? '';
    this.epFeedback.set('');
    this.epSuccess.set(false);
    this.showEditProfile = true;
  }

  openChangePassword(): void {
    this.cpCurrent = '';
    this.cpNew = '';
    this.cpConfirm = '';
    this.cpFeedback.set('');
    this.cpSuccess.set(false);
    this.showChangePassword = true;
  }

  async handleEditProfile(event?: Event): Promise<void> {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!this.epNombre.trim()) {
      this.epFeedback.set('El nombre no puede estar vacío.');
      this.epSuccess.set(false);
      return;
    }

    const currentUser: User | null = this.auth.currentUser;
    if (!currentUser) {
      this.epFeedback.set('Sesión expirada. Volvé a iniciar sesión.');
      this.epSuccess.set(false);
      return;
    }

    this.epSaving.set(true);
    this.authService.markProfileUpdate();
    try {
      // 1. Actualizar displayName en Firebase Auth
      await updateProfile(currentUser, { displayName: this.epNombre.trim() });

      // 2. Actualizar en Firestore: nombre + campos extendidos del estudiante
      const userDocRef = doc(this.firestore, `usuarios/${currentUser.uid}`);
      await updateDoc(userDocRef, {
        nombre: this.epNombre.trim(),
        telefono: this.epTelefono.trim(),
        fechaNacimiento: this.epFechaNacimiento.trim(),
        direccion: this.epDireccion.trim(),
      });

      this.epFeedback.set('Perfil actualizado correctamente.');
      this.epSuccess.set(true);
      this.toast.show('Perfil actualizado', 'success');
      setTimeout(() => { this.showEditProfile = false; this.epFeedback.set(''); }, 1200);
    } catch (err: any) {
      console.error(err);
      this.epFeedback.set('Error al actualizar el perfil. Intentá de nuevo.');
      this.epSuccess.set(false);
    } finally {
      this.epSaving.set(false);
    }
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
      setTimeout(() => { this.showChangePassword = false; this.cpFeedback.set(''); }, 1500);
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
    }
  }
}
