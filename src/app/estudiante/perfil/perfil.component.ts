import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { DashboardEstudianteService } from '../services/dashboard.service';

@Component({
  selector: 'app-perfil-estudiante',
  standalone: true,
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
        </div>
      </div>

      <!-- Datos Personales -->
      <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
        <div class="px-md py-sm border-b border-outline-variant/10 bg-surface-container-low">
          <h3 class="font-headline-sm text-headline-sm text-primary">Mi Perfil</h3>
          <p class="text-on-surface-variant font-body-sm text-body-sm">Información personal del estudiante.</p>
        </div>
        <div class="p-md">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-y-base gap-x-lg">
            <div class="border-b border-surface-container py-base">
              <p class="font-label-sm text-label-sm text-on-surface-variant uppercase mb-xs">Código</p>
              <p class="font-body-md text-body-md font-semibold text-primary">{{ estudiante()?.codigo || '—' }}</p>
            </div>
            <div class="border-b border-surface-container py-base">
              <p class="font-label-sm text-label-sm text-on-surface-variant uppercase mb-xs">Nombres Completos</p>
              <p class="font-body-md text-body-md font-semibold">{{ usuario()?.nombre || '—' }}</p>
            </div>
            <div class="border-b border-surface-container py-base">
              <p class="font-label-sm text-label-sm text-on-surface-variant uppercase mb-xs">Salón</p>
              <p class="font-body-md text-body-md font-semibold">{{ estudiante()?.salon || '—' }}</p>
            </div>
            <div class="border-b border-surface-container py-base">
              <p class="font-label-sm text-label-sm text-on-surface-variant uppercase mb-xs">Carrera</p>
              <p class="font-body-md text-body-md font-semibold">{{ estudiante()?.carrera || '—' }}</p>
            </div>
            <div class="border-b border-surface-container py-base">
              <p class="font-label-sm text-label-sm text-on-surface-variant uppercase mb-xs">Teléfono del estudiante</p>
              <p class="font-body-md text-body-md font-semibold">{{ estudiante()?.telefono || '—' }}</p>
            </div>
            <div class="border-b border-surface-container py-base">
              <p class="font-label-sm text-label-sm text-on-surface-variant uppercase mb-xs">Teléfono del apoderado</p>
              <p class="font-body-md text-body-md font-semibold">{{ estudiante()?.telefonoApoderado || '—' }}</p>
            </div>
            <div class="border-b border-surface-container py-base">
              <p class="font-label-sm text-label-sm text-on-surface-variant uppercase mb-xs">Estado</p>
              <p class="font-body-md text-body-md font-semibold">{{ estudiante()?.estado || '—' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PerfilComponent {
  private readonly authService = inject(AuthService);
  private readonly dashboard = inject(DashboardEstudianteService);

  readonly usuario = computed(() => this.authService.getUsuario());
  readonly estudiante = this.dashboard.estudiante;

  readonly initiales = computed(() => {
    const nombre = this.usuario()?.nombre ?? '';
    return nombre.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || 'E';
  });
}
