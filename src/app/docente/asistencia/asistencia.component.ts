import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AsistenciaService } from '../services/asistencia.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ConfirmService } from '../../shared/components/confirm/confirm.service';

@Component({
  selector: 'app-asistencia',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="p-md md:p-lg max-w-container-max mx-auto w-full flex-1">
      <!-- Header Actions -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-md mb-lg">
        <div>
          <h1 class="font-headline-lg text-headline-md md:text-headline-lg text-primary tracking-tight font-bold">Registro de Asistencia</h1>
        </div>
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-sm w-full md:w-auto">
          <span
            class="hidden sm:flex items-center justify-center gap-1 font-label-sm text-label-sm px-2"
            [class.text-tertiary]="service.syncStatus() === 'guardado'"
            [class.text-on-surface-variant]="service.syncStatus() === 'sincronizando'"
            [class.text-error]="service.syncStatus() === 'error'"
          >
            <span class="material-symbols-outlined text-[16px]">
              {{ service.syncStatus() === 'guardado' ? 'cloud_done' : service.syncStatus() === 'sincronizando' ? 'cloud_sync' : 'cloud_off' }}
            </span>
            {{ service.syncStatus() === 'guardado' ? 'Guardado' : service.syncStatus() === 'sincronizando' ? 'Guardando…' : 'Error al guardar' }}
          </span>
          <button class="w-full md:w-auto px-md py-sm bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary/90 transition-all shadow-md flex items-center justify-center gap-xs disabled:opacity-60 disabled:cursor-not-allowed active:scale-95"
                  (click)="guardar()" [disabled]="isSaving()">
            @if (!isSaving()) {
              <span class="material-symbols-outlined text-[18px]" data-icon="save">save</span>
            } @else {
              <span class="material-symbols-outlined text-[18px] animate-spin" data-icon="sync">sync</span>
            }
            {{ isSaving() ? 'Guardando...' : 'Guardar Asistencia' }}
          </button>
        </div>
      </div>

      <!-- Configuration -->
      <div class="bg-surface-container-lowest rounded-xl shadow-md border border-outline-variant/10 p-md mb-md space-y-md" id="selection-area">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h2 class="font-label-md text-label-md text-primary uppercase tracking-wider font-bold">Configuración de Clase</h2>
          <div class="flex flex-wrap gap-2 w-full sm:w-auto">
            <button class="flex-1 sm:flex-none text-body-sm font-label-sm text-primary hover:bg-primary/5 px-2 py-1.5 rounded border border-primary/20 sm:border-transparent text-center" (click)="marcarTodos(true)">
              Marcar todos presente
            </button>
            <span class="hidden sm:inline text-outline">|</span>
            <button class="flex-1 sm:flex-none text-body-sm font-label-sm text-error hover:bg-error/5 px-2 py-1.5 rounded border border-error/20 sm:border-transparent text-center" (click)="marcarTodos(false)">
              Marcar todos ausente
            </button>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-md">
          <div>
            <label class="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">Seleccionar Curso</label>
            <div class="relative">
              <select [ngModel]="service.curso()" (ngModelChange)="service.actualizarCurso($event)"
                      class="w-full px-md py-sm rounded-lg border border-outline text-body-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none appearance-none bg-surface-bright">
                @for (c of service.cursos; track c) { <option [value]="c">{{ c }}</option> }
              </select>
              <span class="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
            </div>
          </div>
          <div>
            <label class="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">Seleccionar Grupo</label>
            <div class="relative">
              <select [ngModel]="service.grupo()" (ngModelChange)="service.actualizarGrupo($event)"
                      class="w-full px-md py-sm rounded-lg border border-outline text-body-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none appearance-none bg-surface-bright">
                @for (g of service.grupos; track g) { <option [value]="g">{{ g }}</option> }
              </select>
              <span class="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Attendance Table -->
      <div class="bg-surface-container-lowest rounded-xl shadow-md border border-outline-variant/10 overflow-hidden" id="attendance-sheet">
        <!-- Search -->
        <div class="p-md border-b border-outline-variant/10 flex flex-col sm:flex-row gap-md justify-between bg-surface-bright">
          <div class="relative w-full">
            <span class="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant" data-icon="search">search</span>
            <input type="text" [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)"
                   class="w-full pl-xl pr-md py-sm rounded-lg border border-outline text-body-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                   placeholder="Buscar estudiante por nombre o ID..." id="searchInput" />
          </div>
        </div>

        <!-- Desktop Table (hidden on mobile) -->
        <div class="hidden md:block overflow-x-auto scroll-hide">
          @if (service.loading()) {
            <!-- Desktop skeleton loader -->
            <table class="w-full text-left border-collapse animate-pulse">
              <thead>
                <tr class="bg-surface-container border-b border-outline-variant/20">
                  <th class="px-md py-sm font-label-sm text-label-sm uppercase text-on-surface-variant tracking-wider">Estudiante</th>
                  <th class="px-md py-sm font-label-sm text-label-sm uppercase text-on-surface-variant tracking-wider">ID Académico</th>
                  <th class="px-md py-sm font-label-sm text-label-sm uppercase text-on-surface-variant tracking-wider text-center">Presente</th>
                  <th class="px-md py-sm font-label-sm text-label-sm uppercase text-on-surface-variant tracking-wider text-center">Ausente</th>
                  <th class="px-md py-sm font-label-sm text-label-sm uppercase text-on-surface-variant tracking-wider">Notas</th>
                </tr>
              </thead>
              <tbody>
                @for (i of [1, 2, 3, 4, 5]; track i) {
                  <tr class="border-b border-outline-variant/10">
                    <td class="px-md py-sm">
                      <div class="flex items-center gap-md">
                        <div class="w-10 h-10 rounded-full bg-on-surface/10"></div>
                        <div class="h-4 bg-on-surface/10 rounded w-40"></div>
                      </div>
                    </td>
                    <td class="px-md py-sm">
                      <div class="h-3.5 bg-on-surface/10 rounded w-24"></div>
                    </td>
                    <td class="px-md py-sm text-center">
                      <div class="w-5 h-5 rounded-full bg-on-surface/10 mx-auto"></div>
                    </td>
                    <td class="px-md py-sm text-center">
                      <div class="w-5 h-5 rounded-full bg-on-surface/10 mx-auto"></div>
                    </td>
                    <td class="px-md py-sm">
                      <div class="h-4 bg-on-surface/10 rounded w-full"></div>
                    </td>
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
                  <th class="px-md py-sm font-label-sm text-label-sm uppercase text-on-surface-variant tracking-wider text-center">Presente</th>
                  <th class="px-md py-sm font-label-sm text-label-sm uppercase text-on-surface-variant tracking-wider text-center">Ausente</th>
                  <th class="px-md py-sm font-label-sm text-label-sm uppercase text-on-surface-variant tracking-wider">Notas</th>
                </tr>
              </thead>
              <tbody id="studentList">
                @for (est of filtered(); track est.id) {
                  <tr class="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors group">
                    <td class="px-md py-sm">
                      <div class="flex items-center gap-md">
                        <div class="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-label-md text-label-md select-none font-bold">
                          {{ getInitials(est.nombre) }}
                        </div>
                        <span class="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">{{ est.nombre }}</span>
                      </div>
                    </td>
                    <td class="px-md py-sm font-label-sm text-label-sm text-on-surface-variant font-mono">
                      {{ est.id }}
                    </td>
                    <td class="px-md py-sm text-center">
                      <label class="inline-flex items-center cursor-pointer">
                        <input type="radio" [name]="'attendance-' + est.id" value="present"
                               [checked]="est.presente"
                               (change)="service.marcarEstudiante(est.id, true)"
                               class="attendance-radio w-5 h-5 text-tertiary focus:ring-tertiary border-outline" />
                      </label>
                    </td>
                    <td class="px-md py-sm text-center">
                      <label class="inline-flex items-center cursor-pointer">
                        <input type="radio" [name]="'attendance-' + est.id" value="absent"
                               [checked]="!est.presente"
                               (change)="service.marcarEstudiante(est.id, false)"
                               class="attendance-radio w-5 h-5 text-error focus:ring-error border-outline" />
                      </label>
                    </td>
                    <td class="px-md py-sm">
                      <input type="text" placeholder="Agregar nota..."
                             [ngModel]="est.nota"
                             (ngModelChange)="service.actualizarNota(est.id, $event)"
                             class="bg-transparent border-b border-transparent focus:border-primary outline-none text-body-sm py-1 w-full italic opacity-60 focus:opacity-100 transition-all">
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="text-center py-xl text-on-surface-variant font-body-md text-body-md">
                      No se encontraron estudiantes
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>

        <!-- Mobile Cards List (hidden on desktop) -->
        <div class="md:hidden divide-y divide-outline-variant/10">
          @if (service.loading()) {
            <!-- Mobile skeleton loader -->
            @for (i of [1, 2, 3]; track i) {
              <div class="p-md space-y-sm bg-surface-container-lowest animate-pulse">
                <div class="flex items-center gap-md">
                  <div class="w-10 h-10 rounded-full bg-on-surface/10 shrink-0"></div>
                  <div class="min-w-0 flex-1 space-y-2">
                    <div class="h-4 bg-on-surface/10 rounded w-2/3"></div>
                    <div class="h-3 bg-on-surface/10 rounded w-1/3"></div>
                  </div>
                </div>
                <div class="h-9 bg-on-surface/10 rounded-lg w-full"></div>
                <div class="space-y-1">
                  <div class="h-3.5 bg-on-surface/10 rounded w-12"></div>
                  <div class="h-9 bg-on-surface/10 rounded-lg w-full"></div>
                </div>
              </div>
            }
          } @else {
            @for (est of filtered(); track est.id) {
              <div class="p-md space-y-sm bg-surface-container-lowest">
                <!-- Top row: Avatar & Info -->
                <div class="flex items-center gap-md">
                  <div class="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-label-md text-label-md select-none font-bold shrink-0">
                    {{ getInitials(est.nombre) }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="font-label-md text-label-md text-on-surface truncate font-bold">{{ est.nombre }}</p>
                    <p class="font-body-sm text-body-sm text-on-surface-variant font-mono">ID: {{ est.id }}</p>
                  </div>
                </div>

                <!-- Action selection row (Segmented Control style) -->
                <div class="flex bg-surface-container rounded-lg p-0.5 w-full">
                  <button
                    type="button"
                    class="flex-1 py-1.5 px-3 rounded-md font-label-sm text-label-sm transition-all flex items-center justify-center gap-1"
                    [class.bg-white]="est.presente"
                    [class.text-green-700]="est.presente"
                    [class.shadow-sm]="est.presente"
                    [class.text-on-surface-variant]="!est.presente"
                    [class.opacity-60]="!est.presente"
                    (click)="service.marcarEstudiante(est.id, true)"
                  >
                    <span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1;">check_circle</span>
                    Presente
                  </button>
                  <button
                    type="button"
                    class="flex-1 py-1.5 px-3 rounded-md font-label-sm text-label-sm transition-all flex items-center justify-center gap-1"
                    [class.bg-white]="!est.presente"
                    [class.text-red-600]="!est.presente"
                    [class.shadow-sm]="!est.presente"
                    [class.text-on-surface-variant]="est.presente"
                    [class.opacity-60]="est.presente"
                    (click)="service.marcarEstudiante(est.id, false)"
                  >
                    <span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1;">cancel</span>
                    Ausente
                  </button>
                </div>

                <!-- Notes Input -->
                <div>
                  <label class="block font-label-sm text-label-sm text-on-surface-variant mb-0.5">Notas</label>
                  <input type="text" placeholder="Agregar nota (ej. tardanza, justificado)..."
                         [ngModel]="est.nota"
                         (ngModelChange)="service.actualizarNota(est.id, $event)"
                         class="w-full bg-surface-container border border-outline-variant/35 rounded-lg py-2 px-3 font-body-md text-body-sm focus:border-primary focus:bg-white outline-none transition-all italic">
                </div>
              </div>
            } @empty {
              <div class="p-xl text-center text-on-surface-variant font-body-md text-body-md">
                No se encontraron estudiantes
              </div>
            }
          }
        </div>

      </div>
    </div>
  `,
  styles: [`
    .attendance-radio { cursor: pointer; }
    .scroll-hide::-webkit-scrollbar { display: none; }
  `],
})
export class AsistenciaComponent {
  protected readonly service = inject(AsistenciaService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  readonly searchQuery = signal('');
  readonly isSaving = signal(false);

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

  marcarTodos(presente: boolean): void {
    if (presente) {
      void this.service.marcarTodos(true);
      return;
    }

    this.confirm
      .confirm({
        title: 'Marcar todos ausentes',
        desc: 'Se marcará a todos los estudiantes de esta clase como ausentes. ¿Continuar?',
        icon: 'person_off',
        iconBg: 'bg-error-container',
        iconColor: 'text-error',
        confirmText: 'Marcar ausentes',
        confirmClass: 'bg-error text-on-error hover:bg-error/90',
      })
      .subscribe((ok) => {
        if (ok) void this.service.marcarTodos(false);
      });
  }

  async guardar(): Promise<void> {
    this.isSaving.set(true);
    try {
      const ok = await this.service.guardar();
      this.toast.show(
        ok ? 'Asistencia guardada correctamente.' : 'No se pudo guardar la asistencia. Revisá tu conexión.',
        ok ? 'success' : 'error'
      );
    } finally {
      this.isSaving.set(false);
    }
  }
}
