import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth/services/auth.service';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ToastService } from '../../shared/components/toast/toast.service';

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
              <span class="material-symbols-outlined" style="font-size: 64px;">person</span>
            </div>
          </div>
          <h2 class="font-headline-md text-headline-md text-primary">{{ displayName }}</h2>
          <div class="grid grid-cols-2 gap-sm border-t border-outline-variant/20 pt-md max-w-xs mx-auto">
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
        <div class="lg:col-span-2 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 p-lg">
          <div class="flex justify-between items-center mb-xl">
            <div>
              <h3 class="font-headline-md text-headline-md text-primary">Datos Personales</h3>
              <p class="text-on-surface-variant font-body-sm text-body-sm">Mantén tu información actualizada.</p>
            </div>
            <button class="flex items-center gap-xs px-md py-sm border-2 border-primary text-primary font-label-md text-label-md rounded-lg hover:bg-primary/5 transition-all"
                    (click)="openEditProfile()">
              <span class="material-symbols-outlined text-[18px]">edit</span>
              Editar
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div class="space-y-xs">
              <label class="text-label-sm text-on-surface-variant font-semibold uppercase">Nombres Completos</label>
              <input class="w-full bg-surface-container-low border-outline-variant/30 rounded-lg font-body-md text-body-md text-on-surface px-3 py-2" readonly
                     [value]="displayName" />
            </div>
            <div class="space-y-xs">
              <label class="text-label-sm text-on-surface-variant font-semibold uppercase">Correo Electrónico</label>
              <input class="w-full bg-surface-container-low border-outline-variant/30 rounded-lg font-body-md text-body-md text-on-surface px-3 py-2" readonly
                     [value]="email" />
            </div>
            <div class="space-y-xs">
              <label class="text-label-sm text-on-surface-variant font-semibold uppercase">Teléfono de Contacto</label>
              <input class="w-full bg-surface-container-low border-outline-variant/30 rounded-lg font-body-md text-body-md text-on-surface px-3 py-2" readonly
                     [value]="telefonoDefault" />
            </div>
            <div class="space-y-xs">
              <label class="text-label-sm text-on-surface-variant font-semibold uppercase">Fecha de Nacimiento</label>
              <input class="w-full bg-surface-container-low border-outline-variant/30 rounded-lg font-body-md text-body-md text-on-surface px-3 py-2" readonly
                     [value]="fechaNacimientoDefault" />
            </div>
            <div class="md:col-span-2 space-y-xs">
              <label class="text-label-sm text-on-surface-variant font-semibold uppercase">Dirección de Domicilio</label>
              <input class="w-full bg-surface-container-low border-outline-variant/30 rounded-lg font-body-md text-body-md text-on-surface px-3 py-2" readonly
                     [value]="direccionDefault" />
            </div>
          </div>
        </div>

        <!-- Seguridad -->
        <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 p-md space-y-md">
          <h4 class="font-headline-sm text-headline-sm text-primary flex items-center gap-base">
            <span class="material-symbols-outlined text-tertiary">shield</span>
            Seguridad y Cuenta
          </h4>
          <button class="w-full text-left p-sm border border-outline-variant/30 rounded-lg hover:bg-surface-container-low transition-colors flex justify-between items-center group"
                  (click)="showChangePassword = true">
            <span class="text-body-md">Cambiar Contraseña</span>
            <span class="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">chevron_right</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <app-modal [isOpen]="showEditProfile" (close)="closeEditProfile()">
      <div class="p-md border-b border-outline/10 flex justify-between items-center">
        <h3 class="font-headline-sm text-headline-sm text-on-surface">Editar Perfil</h3>
        <button class="w-9 h-9 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
                (click)="closeEditProfile()">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <form class="p-md space-y-md" (ngSubmit)="handleEditProfile($event)">
        @if (epFeedback) {
          <div class="text-body-sm font-body-sm text-center rounded-lg px-4 py-2"
               [class.text-green-800]="epSuccess" [class.bg-green-100]="epSuccess"
               [class.text-red-800]="!epSuccess" [class.bg-red-100]="!epSuccess">
            {{ epFeedback }}
          </div>
        }
        <div class="space-y-1">
          <label class="font-label-sm text-label-sm text-on-surface-variant block">Nombres Completos</label>
          <input type="text" [(ngModel)]="epNombre" name="epNombre" required
                 class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 px-3 font-body-md text-body-md focus:border-primary focus:bg-white transition-all" />
        </div>
        <div class="space-y-1">
          <label class="font-label-sm text-label-sm text-on-surface-variant block">Correo Electrónico</label>
          <input type="email" [(ngModel)]="epEmail" name="epEmail" required
                 class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 px-3 font-body-md text-body-md focus:border-primary focus:bg-white transition-all" />
        </div>
        <div class="space-y-1">
          <label class="font-label-sm text-label-sm text-on-surface-variant block">Teléfono de Contacto</label>
          <input type="tel" [(ngModel)]="epTelefono" name="epTelefono" required
                 class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 px-3 font-body-md text-body-md focus:border-primary focus:bg-white transition-all"
                 placeholder="+51 999 999 999" />
        </div>
        <div class="space-y-1">
          <label class="font-label-sm text-label-sm text-on-surface-variant block">Fecha de Nacimiento</label>
          <input type="text" [(ngModel)]="epFechaNacimiento" name="epFechaNacimiento" required
                 class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 px-3 font-body-md text-body-md focus:border-primary focus:bg-white transition-all"
                 placeholder="15 de Mayo, 2005" />
        </div>
        <div class="space-y-1">
          <label class="font-label-sm text-label-sm text-on-surface-variant block">Dirección de Domicilio</label>
          <input type="text" [(ngModel)]="epDireccion" name="epDireccion" required
                 class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 px-3 font-body-md text-body-md focus:border-primary focus:bg-white transition-all"
                 placeholder="Av. Javier Prado Este 2540, San Borja, Lima" />
        </div>
        <div class="flex justify-end gap-2 pt-sm border-t border-outline/10">
          <button type="button" class="border border-outline/20 px-md py-2.5 rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors"
                  (click)="closeEditProfile()">Cancelar</button>
          <button type="submit" class="bg-primary text-on-primary px-md py-2.5 rounded-lg font-label-md text-label-md hover:bg-primary/90 transition-colors">Guardar</button>
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
        @if (cpFeedback) {
          <div class="text-body-sm font-body-sm text-center rounded-lg px-4 py-2"
               [class.text-green-800]="cpSuccess" [class.bg-green-100]="cpSuccess"
               [class.text-red-800]="!epSuccess" [class.bg-red-100]="!epSuccess">
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
          <button type="button" class="border border-outline/20 px-md py-2.5 rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors"
                  (click)="showChangePassword = false">Cancelar</button>
          <button type="submit" class="bg-primary text-on-primary px-md py-2.5 rounded-lg font-label-md text-label-md hover:bg-primary/90 transition-colors">Cambiar Contraseña</button>
        </div>
      </form>
    </app-modal>
  `,
})
export class PerfilComponent {
  protected authService = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly telefonoDefault = '+51 987 654 321';
  readonly fechaNacimientoDefault = '15 de Mayo, 2005';
  readonly direccionDefault = 'Av. Javier Prado Este 2540, San Borja, Lima';

  showEditProfile = false;
  showChangePassword = false;

  epNombre = '';
  epEmail = '';
  epTelefono = '';
  epFechaNacimiento = '';
  epDireccion = '';
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
    return name ? name.charAt(0).toUpperCase() + name.slice(1) : 'Estudiante';
  }

  get email(): string {
    const user = this.authService.getUsername();
    return user ? `${user}.elite@edu.pe` : 'estudiante@edu.pe';
  }

  openEditProfile(): void {
    this.epNombre = this.displayName;
    this.epEmail = this.email;
    this.epTelefono = this.telefonoDefault;
    this.epFechaNacimiento = this.fechaNacimientoDefault;
    this.epDireccion = this.direccionDefault;
    this.epFeedback = '';
    this.showEditProfile = true;
  }

  closeEditProfile(): void {
    this.showEditProfile = false;
    this.epFeedback = '';
  }

  handleEditProfile(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!this.epNombre || !this.epEmail || !this.epTelefono || !this.epFechaNacimiento || !this.epDireccion) {
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
    setTimeout(() => {
      this.showEditProfile = false;
      this.epFeedback = '';
    }, 1200);
  }

  handleChangePassword(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
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
    setTimeout(() => {
      this.showChangePassword = false;
      this.cpFeedback = '';
    }, 1200);
  }
}
