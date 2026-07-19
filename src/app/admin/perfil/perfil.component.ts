import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Auth,
  updatePassword,
  updateProfile,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User,
  updateEmail,
} from '@angular/fire/auth';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [FormsModule, ModalComponent],
  template: `
    <div class="max-w-3xl mx-auto p-md md:p-lg space-y-lg">

      <!-- Profile Header -->
      <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-outline/10 overflow-hidden">
        <div class="bg-primary h-24"></div>
        <div class="px-md pb-md -mt-12 flex flex-col items-center">
          <div class="w-24 h-24 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container border-4 border-surface-container-lowest shadow-lg">
            <span class="material-symbols-outlined" style="font-size: 48px; font-variation-settings: 'FILL' 1;">person</span>
          </div>
          <h2 class="font-headline-lg text-headline-lg text-on-surface mt-sm">{{ usuario()?.nombre || 'Usuario' }}</h2>
          <p class="font-body-md text-body-md text-on-surface-variant">{{ usuario()?.email }}</p>
          <span class="mt-xs inline-flex items-center gap-1 bg-primary/10 text-primary rounded-full px-3 py-1 font-label-sm text-label-sm capitalize">
            <span class="material-symbols-outlined" style="font-size: 14px;">verified</span>
            {{ usuario()?.role || 'admin' }}
          </span>
        </div>
      </div>

      <!-- Info Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <!-- Información personal -->
        <div class="bg-surface-container-lowest rounded-xl border border-outline/10 p-md">
          <h3 class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-md">Información Personal</h3>
          <div class="space-y-md">
            <div>
              <p class="font-label-sm text-label-sm text-on-surface-variant">Nombre completo</p>
              <p class="font-body-md text-body-md text-on-surface bg-surface-container-low border border-outline/10 rounded-lg px-3 py-2 mt-1">
                {{ usuario()?.nombre || '—' }}
              </p>
            </div>
            <div>
              <p class="font-label-sm text-label-sm text-on-surface-variant">Correo electrónico</p>
              <p class="font-body-md text-body-md text-on-surface bg-surface-container-low border border-outline/10 rounded-lg px-3 py-2 mt-1">
                {{ usuario()?.email || '—' }}
              </p>
            </div>
            <div>
              <p class="font-label-sm text-label-sm text-on-surface-variant">Rol</p>
              <p class="font-body-md text-body-md text-on-surface bg-surface-container-low border border-outline/10 rounded-lg px-3 py-2 mt-1 capitalize">
                {{ usuario()?.role || 'admin' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Acciones -->
        <div class="bg-surface-container-lowest rounded-xl border border-outline/10 p-md">
          <h3 class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-md">Acciones</h3>
          <div class="flex flex-col gap-md">
            <button class="w-full flex items-center gap-3 p-sm border border-outline/20 rounded-lg hover:bg-surface-container-low transition-colors text-left"
                    (click)="openEditProfile()">
              <span class="material-symbols-outlined text-primary">edit</span>
              <div>
                <p class="font-label-md text-label-md text-on-surface">Editar Perfil</p>
                <p class="font-body-sm text-body-sm text-on-surface-variant">Actualiza tu nombre y correo</p>
              </div>
            </button>
            <button class="w-full flex items-center gap-3 p-sm border border-outline/20 rounded-lg hover:bg-surface-container-low transition-colors text-left"
                    (click)="openChangePassword()">
              <span class="material-symbols-outlined text-tertiary">lock</span>
              <div>
                <p class="font-label-md text-label-md text-on-surface">Cambiar Contraseña</p>
                <p class="font-body-sm text-body-sm text-on-surface-variant">Actualiza tu contraseña de acceso</p>
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
            <label class="font-label-sm text-label-sm text-on-surface-variant block">Nombre completo</label>
            <input type="text" [(ngModel)]="epNombre" name="epNombre" required
                   class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 px-3 font-body-md text-body-md focus:border-primary focus:bg-white transition-all" />
          </div>
          <div class="space-y-1">
            <label class="font-label-sm text-label-sm text-on-surface-variant block">Correo electrónico</label>
            <input type="email" [(ngModel)]="epEmail" name="epEmail" required
                   class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 px-3 font-body-md text-body-md focus:border-primary focus:bg-white transition-all" />
          </div>
          <div class="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-sm border-t border-outline/10">
            <button type="button"
                    class="border border-outline/20 px-md py-2.5 rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors"
                    (click)="showEditProfile = false">Cancelar</button>
            <button type="submit"
                    class="bg-primary text-on-primary px-md py-2.5 rounded-lg font-label-md text-label-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
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
          <!-- Requisitos -->
          <ul class="text-body-sm font-body-sm text-on-surface-variant space-y-1">
            <li class="flex items-center gap-1" [class.text-primary]="cpNew.length >= 8">
              <span class="material-symbols-outlined" style="font-size:14px">{{ cpNew.length >= 8 ? 'check_circle' : 'radio_button_unchecked' }}</span>
              Mínimo 8 caracteres
            </li>
          </ul>
          <div class="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-sm border-t border-outline/10">
            <button type="button"
                    class="border border-outline/20 px-md py-2.5 rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors"
                    (click)="showChangePassword = false">Cancelar</button>
            <button type="submit"
                    class="bg-primary text-on-primary px-md py-2.5 rounded-lg font-label-md text-label-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
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
    </div>
  `,
})
export class PerfilComponent {
  private readonly auth = inject(Auth);
  private readonly firestore = inject(Firestore);
  private readonly router = inject(Router);
  protected readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);

  // Estado del usuario leído del AuthService (reactivo)
  readonly usuario = computed(() => this.authService.getUsuario());

  // Edit profile
  showEditProfile = false;
  epNombre = '';
  epEmail = '';
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

  openEditProfile(): void {
    this.epNombre = this.usuario()?.nombre ?? '';
    this.epEmail = this.usuario()?.email ?? '';
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
    if (!this.epEmail.trim()) {
      this.epFeedback.set('El correo no puede estar vacío.');
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
      let emailChanged = false;
      const newEmail = this.epEmail.trim();
      if (newEmail !== currentUser.email) {
        emailChanged = true;
        // 1. Actualizar correo en Firebase Auth
        await updateEmail(currentUser, newEmail);
      }

      // 2. Actualizar displayName en Firebase Auth
      await updateProfile(currentUser, { displayName: this.epNombre.trim() });

      // 3. Actualizar nombre y correo en el documento de Firestore
      const userDocRef = doc(this.firestore, `usuarios/${currentUser.uid}`);
      const updateData: any = { nombre: this.epNombre.trim() };
      if (emailChanged) {
        updateData.email = newEmail;
        updateData.username = newEmail;
      }
      await updateDoc(userDocRef, updateData);

      this.epFeedback.set('Perfil actualizado correctamente.');
      this.epSuccess.set(true);
      this.toast.show('Perfil actualizado', 'success');
      setTimeout(() => {
        this.showEditProfile = false;
        this.epFeedback.set('');
      }, 1200);
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        this.epFeedback.set('Por seguridad, reautenticate (cambiá tu contraseña o iniciá sesión de nuevo) antes de cambiar el correo.');
      } else {
        this.epFeedback.set('Error al actualizar el perfil. Intentá de nuevo.');
      }
      this.epSuccess.set(false);
    } finally {
      this.epSaving.set(false);
      // El flag _ignoringNextNull se limpia solo vía timeout en markProfileUpdate()
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
      // Reautenticar antes de cambiar la contraseña (requisito de Firebase)
      const credential = EmailAuthProvider.credential(currentUser.email, this.cpCurrent);
      await reauthenticateWithCredential(currentUser, credential);

      // Cambiar contraseña
      await updatePassword(currentUser, this.cpNew);

      this.cpFeedback.set('Contraseña cambiada exitosamente.');
      this.cpSuccess.set(true);
      this.cpCurrent = '';
      this.cpNew = '';
      this.cpConfirm = '';
      this.toast.show('Contraseña actualizada', 'success');
      setTimeout(() => {
        this.showChangePassword = false;
        this.cpFeedback.set('');
      }, 1500);
    } catch (err: any) {
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
