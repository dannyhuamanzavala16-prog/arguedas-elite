import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
        <div class="px-md pb-md -mt-12">
          <div class="w-24 h-24 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container border-4 border-surface-container-lowest shadow-lg mx-auto">
            <span class="material-symbols-outlined" style="font-size: 48px;">person</span>
          </div>
          <h2 class="font-headline-lg text-headline-lg text-center text-on-surface mt-sm">{{ displayName }}</h2>
          <p class="font-body-md text-body-md text-center text-on-surface-variant">{{ authService.getUsername() || 'usuario' }}&#64;elite.edu</p>
        </div>
      </div>

      <!-- Info Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <div class="bg-surface-container-lowest rounded-xl border border-outline/10 p-md">
          <h3 class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-md">Información Personal</h3>
          <div class="space-y-md">
            <div>
              <p class="font-label-sm text-label-sm text-on-surface-variant">Nombre completo</p>
              <p class="font-body-md text-body-md text-on-surface bg-surface-container-low border border-outline/10 rounded-lg px-3 py-2 mt-1">{{ displayName }}</p>
            </div>
            <div>
              <p class="font-label-sm text-label-sm text-on-surface-variant">Correo electrónico</p>
              <p class="font-body-md text-body-md text-on-surface bg-surface-container-low border border-outline/10 rounded-lg px-3 py-2 mt-1">{{ authService.getUsername() || 'usuario' }}&#64;elite.edu</p>
            </div>
            <div>
              <p class="font-label-sm text-label-sm text-on-surface-variant">Rol</p>
              <p class="font-body-md text-body-md text-on-surface bg-surface-container-low border border-outline/10 rounded-lg px-3 py-2 mt-1 capitalize">{{ authService.getUserRole() }}</p>
            </div>
          </div>
        </div>

        <div class="bg-surface-container-lowest rounded-xl border border-outline/10 p-md">
          <h3 class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-md">Acciones</h3>
          <div class="flex flex-col gap-md">
            <button class="w-full flex items-center gap-3 p-sm border border-outline/20 rounded-lg hover:bg-surface-container-low transition-colors text-left"
                    (click)="showEditProfile = true">
              <span class="material-symbols-outlined text-primary">edit</span>
              <div><p class="font-label-md text-label-md text-on-surface">Editar Perfil</p><p class="font-body-sm text-body-sm text-on-surface-variant">Actualiza tu nombre y correo</p></div>
            </button>
            <button class="w-full flex items-center gap-3 p-sm border border-outline/20 rounded-lg hover:bg-surface-container-low transition-colors text-left"
                    (click)="showChangePassword = true">
              <span class="material-symbols-outlined text-tertiary">lock</span>
              <div><p class="font-label-md text-label-md text-on-surface">Cambiar Contraseña</p><p class="font-body-sm text-body-sm text-on-surface-variant">Actualiza tu contraseña de acceso</p></div>
            </button>
          </div>
        </div>
      </div>

      <!-- Edit Profile Modal -->
      <app-modal [isOpen]="showEditProfile" (close)="showEditProfile = false">
        <div class="p-md border-b border-outline/10 flex justify-between items-center">
          <h3 class="font-headline-sm text-headline-sm text-on-surface">Editar Perfil</h3>
          <button class="w-9 h-9 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors" (click)="showEditProfile = false">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <form class="p-md space-y-md" (ngSubmit)="handleEditProfile()">
          @if (epFeedback) {
            <div class="text-body-sm font-body-sm text-center rounded-lg px-4 py-2"
                 [class.text-green-800]="epSuccess" [class.bg-green-100]="epSuccess"
                 [class.text-red-800]="!epSuccess" [class.bg-red-100]="!epSuccess">
              {{ epFeedback }}
            </div>
          }
          <div class="space-y-1">
            <label class="font-label-sm text-label-sm text-on-surface-variant block">Nombre completo</label>
            <input type="text" [(ngModel)]="epNombre" name="epNombre" required
                   class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 px-3 font-body-md text-body-md focus:border-primary focus:bg-white transition-all" />
          </div>
          <div class="space-y-1">
            <label class="font-label-sm text-label-sm text-on-surface-variant block">Email</label>
            <input type="email" [(ngModel)]="epEmail" name="epEmail" required
                   class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 px-3 font-body-md text-body-md focus:border-primary focus:bg-white transition-all" />
          </div>
          <div class="flex justify-end gap-2 pt-sm border-t border-outline/10">
            <button type="button" class="border border-outline/20 px-md py-2.5 rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors" (click)="showEditProfile = false">Cancelar</button>
            <button type="submit" class="bg-primary text-on-primary px-md py-2.5 rounded-lg font-label-md text-label-md hover:bg-primary/90 transition-colors">Guardar</button>
          </div>
        </form>
      </app-modal>

      <!-- Change Password Modal -->
      <app-modal [isOpen]="showChangePassword" (close)="showChangePassword = false">
        <div class="p-md border-b border-outline/10 flex justify-between items-center">
          <h3 class="font-headline-sm text-headline-sm text-on-surface">Cambiar Contraseña</h3>
          <button class="w-9 h-9 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors" (click)="showChangePassword = false">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <form class="p-md space-y-md" (ngSubmit)="handleChangePassword()">
          @if (cpFeedback) {
            <div class="text-body-sm font-body-sm text-center rounded-lg px-4 py-2"
                 [class.text-green-800]="cpSuccess" [class.bg-green-100]="cpSuccess"
                 [class.text-red-800]="!cpSuccess" [class.bg-red-100]="!cpSuccess">
              {{ cpFeedback }}
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
          <div class="flex justify-end gap-2 pt-sm border-t border-outline/10">
            <button type="button" class="border border-outline/20 px-md py-2.5 rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors" (click)="showChangePassword = false">Cancelar</button>
            <button type="submit" class="bg-primary text-on-primary px-md py-2.5 rounded-lg font-label-md text-label-md hover:bg-primary/90 transition-colors">Cambiar Contraseña</button>
          </div>
        </form>
      </app-modal>
    </div>
  `,
})
export class PerfilComponent {
  protected authService = inject(AuthService);
  private readonly toast = inject(ToastService);

  showEditProfile = false;
  showChangePassword = false;

  epNombre = '';
  epEmail = '';
  epFeedback = '';
  epSuccess = false;

  cpCurrent = '';
  cpNew = '';
  cpConfirm = '';
  cpFeedback = '';
  cpSuccess = false;
  showCurrent = false;
  showNew = false;
  showConfirm = false;

  get displayName(): string {
    const name = this.authService.getUsername();
    return name ? name.charAt(0).toUpperCase() + name.slice(1) : 'Usuario';
  }

  handleEditProfile(): void {
    if (!this.epNombre || !this.epEmail) {
      this.epFeedback = 'Todos los campos son obligatorios.';
      this.epSuccess = false;
      return;
    }
    if (!this.epEmail.includes('@')) {
      this.epFeedback = 'Ingresa un correo electrónico válido.';
      this.epSuccess = false;
      return;
    }
    this.epFeedback = 'Perfil actualizado correctamente.';
    this.epSuccess = true;
    setTimeout(() => { this.showEditProfile = false; this.epFeedback = ''; }, 1200);
  }

  handleChangePassword(): void {
    if (!this.cpCurrent || !this.cpNew || !this.cpConfirm) {
      this.cpFeedback = 'Todos los campos son obligatorios.';
      this.cpSuccess = false;
      return;
    }
    if (this.cpNew.length < 8) {
      this.cpFeedback = 'La nueva contraseña debe tener al menos 8 caracteres.';
      this.cpSuccess = false;
      return;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(this.cpNew)) {
      this.cpFeedback = 'La contraseña debe incluir mayúscula, minúscula y número.';
      this.cpSuccess = false;
      return;
    }
    if (this.cpNew !== this.cpConfirm) {
      this.cpFeedback = 'Las contraseñas nuevas no coinciden.';
      this.cpSuccess = false;
      return;
    }
    if (this.cpCurrent === this.cpNew) {
      this.cpFeedback = 'La nueva contraseña debe ser diferente a la actual.';
      this.cpSuccess = false;
      return;
    }
    this.cpFeedback = 'Contraseña cambiada exitosamente.';
    this.cpSuccess = true;
    this.cpCurrent = '';
    this.cpNew = '';
    this.cpConfirm = '';
    setTimeout(() => { this.showChangePassword = false; this.cpFeedback = ''; }, 1200);
  }
}
