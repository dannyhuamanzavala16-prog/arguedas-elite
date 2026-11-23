import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AsistenciaService } from '../services/asistencia.service';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-asistencia',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="p-md md:p-lg max-w-container-max mx-auto w-full flex-1">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-md mb-lg">
        <div>
          <h1 class="font-headline-lg text-headline-md md:text-headline-lg text-primary tracking-tight font-bold">
            Registro de Asistencia
          </h1>
          <p class="font-body-sm text-body-sm text-on-surface-variant mt-1 capitalize">
            {{ tituloFecha() }} · {{ service.curso() }} · Grupo {{ service.grupo() }}
          </p>
        </div>
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-sm w-full md:w-auto">
          <span
            class="hidden sm:flex items-center justify-center gap-1 font-label-sm text-label-sm px-2"
            [class.text-tertiary]="service.syncStatus() === 'guardado'"
            [class.text-amber-700]="service.syncStatus() === 'pendiente'"
            [class.text-on-surface-variant]="service.syncStatus() === 'sin cambios' || service.syncStatus() === 'guardando'"
            [class.text-error]="service.syncStatus() === 'error'"
          >
            <span class="material-symbols-outlined text-[16px]">
              {{
                service.syncStatus() === 'guardado'
                  ? 'cloud_done'
                  : service.syncStatus() === 'pendiente'
                    ? 'edit_note'
                    : service.syncStatus() === 'guardando'
                      ? 'cloud_sync'
                      : service.syncStatus() === 'error'
                        ? 'cloud_off'
                        : 'cloud'
              }}
            </span>
            {{
              service.syncStatus() === 'guardado'
                ? 'Guardado'
                : service.syncStatus() === 'pendiente'
                  ? 'Cambios sin guardar'
                  : service.syncStatus() === 'guardando'
                    ? 'Guardando…'
                    : service.syncStatus() === 'error'
                      ? 'Error al guardar'
                      : 'Sin cambios'
            }}
          </span>
          <button
            class="w-full md:w-auto px-md py-sm bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary/90 transition-all shadow-md flex items-center justify-center gap-xs disabled:opacity-60 disabled:cursor-not-allowed active:scale-95"
            (click)="guardar()"
            [disabled]="isSaving() || service.syncStatus() === 'sin cambios'"
          >
            @if (!isSaving()) {
              <span class="material-symbols-outlined text-[18px]">save</span>
            } @else {
              <span class="material-symbols-outlined text-[18px] animate-spin">sync</span>
            }
            {{ isSaving() ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </div>

      <!-- Config -->
      <div class="bg-surface-container-lowest rounded-xl shadow-md border border-outline-variant/10 p-md mb-md space-y-md">
        <h2 class="font-label-md text-label-md text-primary uppercase tracking-wider font-bold">Configuración de Clase</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-md">
          <div>
            <label class="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">Fecha</label>
            <input
              type="date"
              [ngModel]="service.fecha()"
              (ngModelChange)="onFechaChange($event)"
              class="w-full px-md py-sm rounded-lg border border-outline text-body-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-surface-bright"
            />
          </div>
          <div>
            <label class="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">Curso</label>
            <div class="relative">
              <select
                [ngModel]="service.curso()"
                (ngModelChange)="onCursoChange($event)"
                class="w-full px-md py-sm rounded-lg border border-outline text-body-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none appearance-none bg-surface-bright"
              >
                @for (c of service.cursos; track c) {
                  <option [value]="c">{{ c }}</option>
                }
              </select>
              <span class="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
            </div>
          </div>
          <div>
            <label class="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">Grupo</label>
            <div class="relative">
              <select
                [ngModel]="service.grupo()"
                (ngModelChange)="onGrupoChange($event)"
                class="w-full px-md py-sm rounded-lg border border-outline text-body-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none appearance-none bg-surface-bright"
              >
                @for (g of service.grupos; track g) {
                  <option [value]="g">{{ g }}</option>
                }
              </select>
              <span class="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
            </div>
          </div>
        </div>
        @if (!service.registrada() && !service.loading()) {
          <p class="font-body-sm text-body-sm text-on-surface-variant bg-surface-container rounded-lg px-md py-sm">
            Esta fecha aún no tiene asistencia registrada. Marca a cada estudiante y guarda.
          </p>
        }
      </div>

      <!-- Table -->
      <div class="bg-surface-container-lowest rounded-xl shadow-md border border-outline-variant/10 overflow-hidden">
        <div class="p-md border-b border-outline-variant/10 flex flex-col sm:flex-row gap-md justify-between bg-surface-bright">
          <div class="relative w-full">
            <span class="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input
              type="text"
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
              class="w-full pl-xl pr-md py-sm rounded-lg border border-outline text-body-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="Buscar estudiante por nombre o ID..."
            />
          </div>
          <div class="font-label-sm text-label-sm text-on-surface-variant self-center whitespace-nowrap">
            {{ stats().presentes }}/{{ stats().total }} presentes
          </div>
        </div>

        <!-- Desktop -->
        <div class="hidden md:block overflow-x-auto">
          @if (service.loading()) {
            <table class="w-full text-left border-collapse animate-pulse">
              <thead>
                <tr class="bg-surface-container border-b border-outline-variant/20">
                  <th class="px-md py-sm font-label-sm text-label-sm uppercase text-on-surface-variant tracking-wider">Estudiante</th>
                  <th class="px-md py-sm font-label-sm text-label-sm uppercase text-on-surface-variant tracking-wider">ID Académico</th>
                  <th class="px-md py-sm font-label-sm text-label-sm uppercase text-on-surface-variant tracking-wider text-center">Asistencia</th>
                  <th class="px-md py-sm font-label-sm text-label-sm uppercase text-on-surface-variant tracking-wider">Notas</th>
                </tr>
              </thead>
              <tbody>
                @for (i of [1, 2, 3, 4, 5]; track i) {
                  <tr class="border-b border-outline-variant/10">
                    <td class="px-md py-sm"><div class="flex items-center gap-md"><div class="w-10 h-10 rounded-full bg-on-surface/10"></div><div class="h-4 bg-on-surface/10 rounded w-40"></div></div></td>
                    <td class="px-md py-sm"><div class="h-3.5 bg-on-surface/10 rounded w-24"></div></td>
                    <td class="px-md py-sm"><div class="h-9 bg-on-surface/10 rounded-lg w-48 mx-auto"></div></td>
                    <td class="px-md py-sm"><div class="h-4 bg-on-surface/10 rounded w-full"></div></td>
                  </tr>
                }
              </tbody>
            </table>
          } @else {
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-surface-container border-b border-outline-variant/20">
                  <th class="px-md py-sm font-label-sm text-label-sm uppercase text-on-surface-variant tracking-wider">Estudiante</th>
                  <th class="px-md py-sm font-label-sm text-label-sm uppercase text-on-surface-variant tracking-wider">ID Académico</th>
                  <th class="px-md py-sm font-label-sm text-label-sm uppercase text-on-surface-variant tracking-wider text-center">Asistencia</th>
                  <th class="px-md py-sm font-label-sm text-label-sm uppercase text-on-surface-variant tracking-wider">Notas</th>
                </tr>
              </thead>
              <tbody>
                @for (est of filtered(); track est.id) {
                  <tr class="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors">
                    <td class="px-md py-sm">
                      <div class="flex items-center gap-md">
                        <div class="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-label-md text-label-md font-bold">
                          {{ getInitials(est.nombre) }}
                        </div>
                        <span class="font-label-md text-label-md text-on-surface">{{ est.nombre }}</span>
                      </div>
                    </td>
                    <td class="px-md py-sm font-label-sm text-label-sm text-on-surface-variant font-mono">{{ est.id }}</td>
                    <td class="px-md py-sm">
                      <div class="flex justify-center gap-2">
                        <button type="button" (click)="service.marcarEstudiante(est.id, true)"
                          class="px-3 py-1.5 rounded-lg text-label-sm font-label-sm border transition-all"
                          [class.bg-green-100]="est.presente === true"
                          [class.border-green-600]="est.presente === true"
                          [class.text-green-800]="est.presente === true"
                          [class.border-outline-variant]="est.presente !== true"
                          [class.text-on-surface-variant]="est.presente !== true"
                        >Presente</button>
                        <button type="button" (click)="service.marcarEstudiante(est.id, false)"
                          class="px-3 py-1.5 rounded-lg text-label-sm font-label-sm border transition-all"
                          [class.bg-red-100]="est.presente === false"
                          [class.border-red-600]="est.presente === false"
                          [class.text-red-800]="est.presente === false"
                          [class.border-outline-variant]="est.presente !== false"
                          [class.text-on-surface-variant]="est.presente !== false"
                        >Ausente</button>
                      </div>
                    </td>
                    <td class="px-md py-sm">
                      <input type="text" placeholder="Nota (opcional)..."
                        [ngModel]="est.nota"
                        (ngModelChange)="service.actualizarNota(est.id, $event)"
                        class="bg-transparent border-b border-transparent focus:border-primary outline-none text-body-sm py-1 w-full italic opacity-80 focus:opacity-100 transition-all"
                      />
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="text-center py-xl text-on-surface-variant font-body-md text-body-md">
                      No se encontraron estudiantes
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>

        <!-- Mobile: simplified cards -->
        <div class="md:hidden divide-y divide-outline-variant/10">
          @if (service.loading()) {
            <div class="p-md text-center text-on-surface-variant font-body-sm">Cargando…</div>
          } @else {
            @for (est of filtered(); track est.id) {
              <div class="p-md space-y-sm">
                <div class="flex items-center gap-md">
                  <div class="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">{{ getInitials(est.nombre) }}</div>
                  <div class="min-w-0">
                    <p class="font-label-md text-label-md font-bold truncate">{{ est.nombre }}</p>
                    <p class="font-body-sm text-body-sm text-on-surface-variant font-mono">{{ est.id }}</p>
                  </div>
                </div>
                <div class="flex gap-2">
                  <button type="button" (click)="service.marcarEstudiante(est.id, true)"
                    class="flex-1 py-2 rounded-lg text-label-sm border"
                    [class.bg-green-100]="est.presente === true"
                    [class.border-green-600]="est.presente === true"
                    [class.text-green-800]="est.presente === true"
                    [class.border-outline-variant]="est.presente !== true"
                  >Presente</button>
                  <button type="button" (click)="service.marcarEstudiante(est.id, false)"
                    class="flex-1 py-2 rounded-lg text-label-sm border"
                    [class.bg-red-100]="est.presente === false"
                    [class.border-red-600]="est.presente === false"
                    [class.text-red-800]="est.presente === false"
                    [class.border-outline-variant]="est.presente !== false"
                  >Ausente</button>
                </div>
                <input type="text" placeholder="Nota (opcional)..."
                  [ngModel]="est.nota"
                  (ngModelChange)="service.actualizarNota(est.id, $event)"
                  class="w-full bg-surface-container border border-outline-variant/35 rounded-lg py-2 px-3 text-body-sm outline-none"
                />
              </div>
            } @empty {
              <div class="p-xl text-center text-on-surface-variant">No se encontraron estudiantes</div>
            }
          }
        </div>
      </div>
    </div>
  `,
  styles: [``],
})
export class AsistenciaComponent {
  protected readonly service = inject(AsistenciaService);
  private readonly toast = inject(ToastService);

  readonly searchQuery = signal('');
  readonly isSaving = signal(false);

  readonly tituloFecha = computed(() => {
    const f = this.service.fecha();
    const d = new Date(f + 'T12:00:00');
    return d.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });
  });

  readonly stats = computed(() => this.service.getStats());

  readonly filtered = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const list = this.service.estudiantes();
    if (!q) return list;
    return list.filter((e) => {
      const nombre = (e.nombre || '').toLowerCase();
      const id = (e.id || '').toLowerCase();
      return nombre.includes(q) || id.includes(q);
    });
  });

  getInitials(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  onFechaChange(value: string): void {
    void this.service.actualizarFecha(value);
  }
  onCursoChange(value: string): void {
    void this.service.actualizarCurso(value);
  }
  onGrupoChange(value: string): void {
    void this.service.actualizarGrupo(value);
  }

  async guardar(): Promise<void> {
    this.isSaving.set(true);
    try {
      const ok = await this.service.guardar();
      if (ok) {
        const s = this.stats();
        this.toast.show(`Asistencia guardada: ${s.presentes}/${s.total} presentes.`, 'success');
      } else {
        this.toast.show('No se pudo guardar la asistencia. Revisá tu conexión.', 'error');
      }
    } finally {
      this.isSaving.set(false);
    }
  }
}
