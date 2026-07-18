import { Component, signal, effect, afterNextRender } from '@angular/core';

interface HistorialEntry {
  fecha: string;
  curso: string;
  estado: 'Presente' | 'Ausente' | 'Tardanza';
}

const HISTORIAL: HistorialEntry[] = [
  { fecha: '12 Oct, 2023', curso: 'Razonamiento Matemático I', estado: 'Presente' },
  { fecha: '11 Oct, 2023', curso: 'Física Avanzada', estado: 'Presente' },
  { fecha: '10 Oct, 2023', curso: 'Literatura Universal', estado: 'Ausente' },
  { fecha: '09 Oct, 2023', curso: 'Química Orgánica', estado: 'Presente' },
  { fecha: '06 Oct, 2023', curso: 'Aritmética Pre-U', estado: 'Tardanza' },
  { fecha: '05 Oct, 2023', curso: 'Historia del Perú', estado: 'Presente' },
  { fecha: '04 Oct, 2023', curso: 'Geografía Mundial', estado: 'Presente' },
  { fecha: '03 Oct, 2023', curso: 'Razonamiento Verbal', estado: 'Ausente' },
  { fecha: '02 Oct, 2023', curso: 'Trigonometría', estado: 'Tardanza' },
  { fecha: '01 Oct, 2023', curso: 'Álgebra Lineal', estado: 'Presente' },
];

@Component({
  selector: 'app-asistencia-estudiante',
  standalone: true,
  template: `
    <div class="flex-1 p-md md:p-lg space-y-lg">
      <!-- Title for mobile -->
      <div>
        <h1 class="font-headline-lg text-headline-lg text-primary">Asistencia</h1>
        <p class="font-body-sm text-body-sm text-on-surface-variant">Control de puntualidad y permanencia</p>
      </div>

      <!-- Bento Grid -->
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
              <p class="text-headline-sm font-bold text-tertiary">148</p>
              <p class="text-xs text-on-surface-variant">Presente</p>
            </div>
            <div class="text-center">
              <p class="text-headline-sm font-bold text-error">12</p>
              <p class="text-xs text-on-surface-variant">Ausente</p>
            </div>
          </div>
        </section>

        <!-- History Table -->
        <section class="lg:col-span-8 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
          <div class="px-lg py-md border-b border-surface-container">
            <h2 class="font-headline-sm text-headline-sm text-primary">Historial Reciente</h2>
          </div>
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
                @for (entry of historial; track entry.fecha + entry.curso) {
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
            <span class="text-xs text-on-surface-variant">Mostrando {{ historial.length }} de 160 registros</span>
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
        </section>
      </div>
    </div>
  `,
  styles: [`
    .gauge-ring {
      transition: background 1.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
  `],
})
export class AsistenciaComponent {
  protected readonly historial = HISTORIAL;
  protected readonly animPercent = signal(0);

  constructor() {
    afterNextRender(() => {
      setTimeout(() => {
        this.animPercent.set(92);
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
