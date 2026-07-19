import { Component, computed, inject, signal, afterNextRender } from '@angular/core';
import { AsistenciaEstudianteService } from '../services/asistencia.service';

@Component({
  selector: 'app-asistencia-estudiante',
  standalone: true,
  template: `
    <div class="flex-1 p-md md:p-lg space-y-lg">
      <!-- Title -->
      <div>
        <h1 class="font-headline-lg text-headline-lg text-primary">Asistencia</h1>
        <p class="font-body-sm text-body-sm text-on-surface-variant">Control de puntualidad y permanencia</p>
      </div>

      @if (loading()) {
        <!-- ── LOADING SKELETON ──────────────────────────────── -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-md items-start animate-pulse">
          <section class="lg:col-span-4 bg-surface-container-lowest rounded-xl p-lg shadow-sm flex flex-col items-center justify-center space-y-md border border-outline-variant/10">
            <div class="h-6 w-40 bg-surface-container rounded"></div>
            <div class="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-surface-container"></div>
            <div class="grid grid-cols-2 gap-md w-full pt-md border-t border-surface-container">
              <div class="text-center space-y-2">
                <div class="h-8 w-16 bg-surface-container rounded mx-auto"></div>
                <div class="h-3 w-14 bg-surface-container rounded mx-auto"></div>
              </div>
              <div class="text-center space-y-2">
                <div class="h-8 w-16 bg-surface-container rounded mx-auto"></div>
                <div class="h-3 w-14 bg-surface-container rounded mx-auto"></div>
              </div>
            </div>
          </section>
          <section class="lg:col-span-8 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
            <div class="px-lg py-md border-b border-surface-container">
              <div class="h-5 w-40 bg-surface-container rounded"></div>
            </div>
            <div class="divide-y divide-surface-container p-lg space-y-md">
              @for (_ of [1,2,3,4,5]; track _) {
                <div class="flex gap-md">
                  <div class="h-4 w-24 bg-surface-container rounded"></div>
                  <div class="h-4 w-48 bg-surface-container rounded"></div>
                  <div class="h-4 w-16 bg-surface-container rounded ml-auto"></div>
                </div>
              }
            </div>
          </section>
        </div>
      } @else {
        <!-- ── BENTO GRID ───────────────────────────────────── -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-md items-start">
          <!-- Gauge Card -->
          <section class="lg:col-span-4 bg-surface-container-lowest rounded-xl p-lg shadow-sm flex flex-col items-center justify-center space-y-md border border-outline-variant/10">
            <h2 class="font-headline-sm text-headline-sm text-primary text-center">Asistencia General</h2>

            <!-- Circular Gauge -->
            <div class="relative w-48 h-48 sm:w-56 sm:h-56">
              <div class="w-full h-full rounded-full flex items-center justify-center transition-all duration-1000 ease-out"
                   [style.background]="gaugeStyle()">
                <div class="text-center">
                  <span class="font-headline-xl text-headline-xl text-primary block">{{ animPercent() }}%</span>
                  <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Global</span>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-md w-full pt-md border-t border-surface-container">
              <div class="text-center">
                <p class="text-headline-sm font-bold text-tertiary">{{ data().presente }}</p>
                <p class="text-xs text-on-surface-variant">Presente</p>
              </div>
              <div class="text-center">
                <p class="text-headline-sm font-bold text-error">{{ data().ausente }}</p>
                <p class="text-xs text-on-surface-variant">Ausente</p>
              </div>
            </div>
          </section>

          <!-- History Table -->
          <section class="lg:col-span-8 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
            <div class="px-lg py-md border-b border-surface-container">
              <h2 class="font-headline-sm text-headline-sm text-primary">Historial Reciente</h2>
            </div>

            @if (data().historial.length === 0) {
              <div class="p-lg text-center text-on-surface-variant">
                <span class="material-symbols-outlined text-4xl mb-sm block">calendar_today</span>
                <p class="font-body-md">Aún no hay registros de asistencia.</p>
                <p class="font-label-sm">Los datos aparecerán cuando el docente registre tu asistencia.</p>
              </div>
            } @else {
              <div class="overflow-x-auto max-h-[560px] overflow-y-auto">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="bg-surface-container-low">
                      <th class="px-lg py-sm font-label-sm text-label-sm text-on-surface-variant uppercase">Fecha</th>
                      <th class="px-lg py-sm font-label-sm text-label-sm text-on-surface-variant uppercase">Curso</th>
                      <th class="px-lg py-sm font-label-sm text-label-sm text-on-surface-variant uppercase text-right">Estado</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-surface-container">
                    @for (entry of data().historial; track entry.fecha + entry.curso) {
                      <tr class="hover:bg-surface-container-low transition-colors group cursor-pointer"
                          (click)="onRowClick($event)">
                        <td class="px-lg py-md font-body-md text-body-md text-on-surface">{{ entry.fecha }}</td>
                        <td class="px-lg py-md font-body-md text-body-md text-on-surface">{{ entry.curso }}</td>
                        <td class="px-lg py-md text-right">
                          <span class="px-sm py-1 rounded-full text-xs font-bold uppercase"
                                [class]="estadoClass(entry.estado)">
                            {{ entry.estado }}
                          </span>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <!-- Pagination Footer -->
              <div class="px-lg py-sm bg-surface-container-low flex justify-between items-center border-t border-surface-container">
                <span class="text-xs text-on-surface-variant">
                  Mostrando {{ data().historial.length }} de {{ data().totalSesiones }} registros
                </span>
                <div class="flex gap-xs">
                  <button class="p-1 hover:bg-white rounded border border-outline-variant/30 transition-colors disabled:opacity-30"
                          disabled>
                    <span class="material-symbols-outlined text-sm">chevron_left</span>
                  </button>
                  <button class="p-1 hover:bg-white rounded border border-outline-variant/30 transition-colors">
                    <span class="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              </div>
            }
          </section>
        </div>
      }
    </div>
  `,
})
export class AsistenciaComponent {
  private readonly service = inject(AsistenciaEstudianteService);

  readonly loading = computed(() => !this.service.loaded());
  readonly data = this.service.asistenciaData;
  protected readonly animPercent = signal(0);

  constructor() {
    afterNextRender(() => {
      setTimeout(() => {
        this.animPercent.set(this.data().porcentaje);
      }, 100);
    });
  }

  protected readonly gaugeStyle = () => {
    const pct = this.animPercent();
    return `radial-gradient(closest-side, white 79%, transparent 80% 100%), conic-gradient(#1a237e ${pct}%, #e2e2e2 0)`;
  };

  protected estadoClass(estado: string): string {
    switch (estado) {
      case 'Presente':
        return 'bg-green-100 text-green-700';
      case 'Ausente':
        return 'bg-red-100 text-red-700';
      case 'Tardanza':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  protected onRowClick(event: MouseEvent): void {
    const row = (event.currentTarget as HTMLElement);
    row.style.transform = 'scale(0.99)';
    setTimeout(() => { row.style.transform = ''; }, 150);
  }
}
