import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { MaterialesDocenteService } from '../services/materiales.service';
import { AsistenciaService } from '../services/asistencia.service';

@Component({
  selector: 'app-docente-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="p-md md:p-lg space-y-lg max-w-container-max mx-auto w-full">
      <!-- Greeting -->
      <header>
        <h1 class="font-headline-lg text-headline-md md:text-headline-lg text-primary font-bold tracking-tight">
          Hola, {{ nombre() }}
        </h1>
        <p class="font-body-sm text-body-sm text-on-surface-variant capitalize">{{ fechaHoy }}</p>
      </header>

      <!-- Quick actions -->
      <section class="grid grid-cols-1 sm:grid-cols-2 gap-gutter">
        <a
          routerLink="/docente/asistencia"
          class="group flex items-center gap-md bg-primary text-on-primary p-md rounded-xl shadow-md hover:bg-primary/90 transition-all"
        >
          <div class="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-[26px]">how_to_reg</span>
          </div>
          <div class="min-w-0">
            <p class="font-label-md text-label-md font-bold">Tomar asistencia</p>
            <p class="font-body-sm text-body-sm text-on-primary/70">Registrar la clase de hoy</p>
          </div>
          <span class="material-symbols-outlined ml-auto opacity-70 group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
        </a>

        <a
          routerLink="/docente/materiales"
          class="group flex items-center gap-md bg-white p-md rounded-xl custom-shadow border border-outline-variant/20 hover:-translate-y-0.5 transition-all"
        >
          <div class="w-12 h-12 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-[26px]">book</span>
          </div>
          <div class="min-w-0">
            <p class="font-label-md text-label-md font-bold text-primary">Ver materiales</p>
            <p class="font-body-sm text-body-sm text-on-surface-variant">Archivos de tus cursos</p>
          </div>
          <span class="material-symbols-outlined ml-auto text-on-surface-variant opacity-70 group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
        </a>
      </section>

      <!-- Detail grid -->
      <section class="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        <!-- Attendance of today -->
        <div class="bg-white p-md rounded-xl custom-shadow border-l-4 border-tertiary flex flex-col">
          <div class="flex justify-between items-start mb-base">
            <div>
              <p class="text-on-surface-variant font-label-md uppercase tracking-wider">Asistencia de hoy</p>
              <p class="font-label-sm text-label-sm text-on-surface-variant">
                {{ asistenciaService.curso() }} · Grupo {{ asistenciaService.grupo() }}
              </p>
            </div>
            <div class="bg-tertiary/10 p-xs rounded-lg text-tertiary">
              <span class="material-symbols-outlined">verified</span>
            </div>
          </div>

          @if (asistenciaService.loading()) {
            <div class="space-y-sm animate-pulse">
              <div class="h-8 w-24 bg-on-surface/10 rounded"></div>
              <div class="h-4 w-40 bg-on-surface/10 rounded"></div>
            </div>
          } @else if (!asistenciaService.registrada()) {
            <div class="flex-1 flex flex-col justify-center gap-sm">
              <span class="inline-flex w-fit items-center gap-1 px-2 py-1 rounded-full bg-tertiary/10 text-tertiary font-label-sm text-label-sm">
                <span class="material-symbols-outlined text-[16px]">pending</span>
                Sin registrar
              </span>
              <p class="font-body-sm text-body-sm text-on-surface-variant">
                Todavía no tomaste lista de esta clase.
              </p>
              <a routerLink="/docente/asistencia" class="text-primary font-label-md text-label-md hover:underline">
                Tomar asistencia →
              </a>
            </div>
          } @else {
            <div class="flex items-baseline gap-xs">
              <span class="font-headline-lg text-headline-lg text-primary">{{ stats().porcentaje }}%</span>
              <span class="font-body-sm text-body-sm text-on-surface-variant">
                {{ stats().presentes }} de {{ stats().total }} presentes
              </span>
            </div>
            <div class="mt-sm h-2 w-full rounded-full bg-surface-container overflow-hidden">
              <div class="h-full bg-tertiary transition-all" [style.width.%]="stats().porcentaje"></div>
            </div>
            <a routerLink="/docente/asistencia" class="mt-sm text-primary font-label-sm text-label-sm hover:underline">
              Ver detalle →
            </a>
          }
        </div>

        <!-- Recent materials -->
        <div class="bg-white p-md rounded-xl custom-shadow border-l-4 border-secondary flex flex-col">
          <div class="flex justify-between items-start mb-base">
            <p class="text-on-surface-variant font-label-md uppercase tracking-wider">Materiales recientes</p>
            <div class="bg-secondary/10 p-xs rounded-lg text-secondary">
              <span class="material-symbols-outlined">book</span>
            </div>
          </div>

          @if (materialesService.loading()) {
            <div class="space-y-sm animate-pulse">
              @for (i of [1, 2, 3]; track i) {
                <div class="flex items-center gap-sm">
                  <div class="w-9 h-9 rounded-lg bg-on-surface/10"></div>
                  <div class="flex-1 space-y-1">
                    <div class="h-3.5 bg-on-surface/10 rounded w-3/4"></div>
                    <div class="h-3 bg-on-surface/10 rounded w-1/3"></div>
                  </div>
                </div>
              }
            </div>
          } @else if (materialesRecientes().length === 0) {
            <p class="font-body-sm text-body-sm text-on-surface-variant">
              Todavía no hay materiales disponibles.
            </p>
          } @else {
            <ul class="divide-y divide-outline-variant/10">
              @for (mat of materialesRecientes(); track mat.id) {
                <li class="flex items-center gap-sm py-2">
                  <div
                    [class]="'w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ' + (mat.colorClase || 'bg-primary/10 text-primary')"
                  >
                    <span class="material-symbols-outlined text-[20px]">{{ mat.icono || 'description' }}</span>
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="font-label-md text-label-md truncate">{{ mat.nombre }}</p>
                    <p class="font-label-sm text-label-sm text-on-surface-variant truncate">
                      {{ mat.curso }} · {{ mat.fecha }}
                    </p>
                  </div>
                </li>
              }
            </ul>
            <a routerLink="/docente/materiales" class="mt-auto pt-sm text-primary font-label-sm text-label-sm hover:underline">
              Ver todos →
            </a>
          }
        </div>
      </section>
    </div>
  `,
})
export class DocenteDashboardComponent {
  protected readonly auth = inject(AuthService);
  protected readonly asistenciaService = inject(AsistenciaService);
  protected readonly materialesService = inject(MaterialesDocenteService);

  readonly nombre = computed(() => this.auth.getUsuario()?.nombre ?? 'Docente');

  readonly fechaHoy = new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  readonly stats = computed(() => this.asistenciaService.getStats());

  readonly materialesRecientes = computed(() =>
    [...this.materialesService.materiales()]
      .sort((a, b) => (b.createdAt ?? b.fecha ?? '').localeCompare(a.createdAt ?? a.fecha ?? ''))
      .slice(0, 4)
  );
}
