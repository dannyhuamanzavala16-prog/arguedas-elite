import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, collectionData, query, orderBy } from '@angular/fire/firestore';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { ASISTENCIA_CURSOS } from '../../shared/services/mock-data.service';
import { EstudianteAsistencia } from '../../shared/services/mock-data.service';

const ITEMS_PER_PAGE = 8;

interface SesionAsistencia {
  id: string;
  fecha: string;
  curso: string;
  grupo: string;
  estudiantes: EstudianteAsistencia[];
  updatedAt?: string;
}

@Component({
  selector: 'app-admin-asistencia',
  standalone: true,
  imports: [FormsModule, PaginationComponent],
  template: `
    <div class="max-w-container-max mx-auto p-md md:p-lg">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-md mb-lg">
        <div>
          <h2 class="font-headline-xl text-headline-md md:text-headline-xl text-primary-container mb-2">Registro de Asistencia</h2>
          <p class="font-body-md text-body-md text-on-surface-variant">Visualizá el registro completo de asistencia de todos los estudiantes.</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-surface-container-lowest rounded-xl p-md border border-outline/10 mb-md">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-md items-end">
          <div>
            <label class="font-label-sm text-label-sm text-on-surface-variant block mb-1">Curso</label>
            <select [(ngModel)]="filterCurso"
                    class="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2 px-3 font-body-md text-body-md">
              <option value="">Todos los cursos</option>
              @for (c of cursos; track c) { <option [value]="c">{{ c }}</option> }
            </select>
          </div>
          <div>
            <label class="font-label-sm text-label-sm text-on-surface-variant block mb-1">Fecha</label>
            <input type="date" [(ngModel)]="filterFecha"
                   class="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2 px-3 font-body-md text-body-md" />
          </div>
          <div class="flex items-end gap-2">
            <button class="flex-1 bg-primary text-on-primary px-md py-2 rounded-lg font-label-md text-label-md hover:bg-primary/90 transition-colors"
                    (click)="applyFilters()">Aplicar</button>
            <button class="flex-1 border border-outline/20 px-md py-2 rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors"
                    (click)="clearFilters()">Limpiar</button>
          </div>
        </div>
      </div>

      <!-- Sessions Table -->
      <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-outline/10 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-surface-container-low">
                <th class="px-md py-sm font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Fecha</th>
                <th class="px-md py-sm font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Curso</th>
                <th class="px-md py-sm font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Grupo</th>
                <th class="px-md py-sm font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Presentes</th>
                <th class="px-md py-sm font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Ausentes</th>
                <th class="px-md py-sm font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Total</th>
                <th class="px-md py-sm font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">Detalle</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline/5">
              @for (ses of paginated(); track ses.id) {
                <tr class="hover:bg-surface-container-low transition-colors">
                  <td class="px-md py-md font-label-md text-label-md text-on-surface">{{ ses.fecha }}</td>
                  <td class="px-md py-md font-body-md text-body-md">{{ ses.curso }}</td>
                  <td class="px-md py-md font-body-md text-body-md">{{ ses.grupo }}</td>
                  <td class="px-md py-md">
                    <span class="font-label-md text-label-md text-green-700 font-bold">{{ contarPresentes(ses) }}</span>
                  </td>
                  <td class="px-md py-md">
                    <span class="font-label-md text-label-md text-red-600 font-bold">{{ contarAusentes(ses) }}</span>
                  </td>
                  <td class="px-md py-md font-label-md text-label-md text-on-surface">{{ ses.estudiantes.length }}</td>
                  <td class="px-md py-md text-right">
                    <button class="w-9 h-9 flex items-center justify-center rounded-lg text-primary hover:bg-primary/10 transition-colors"
                            title="Ver detalle"
                            (click)="toggleDetalle(ses.id)">
                      <span class="material-symbols-outlined">{{ detalleAbierto() === ses.id ? 'expand_less' : 'expand_more' }}</span>
                    </button>
                  </td>
                </tr>
                @if (detalleAbierto() === ses.id) {
                  <tr class="bg-surface-container-low/50">
                    <td colspan="7" class="px-md py-md">
                      <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                          <thead>
                            <tr class="bg-surface-container-low">
                              <th class="px-sm py-1 font-label-sm text-label-sm text-on-surface-variant">Estudiante</th>
                              <th class="px-sm py-1 font-label-sm text-label-sm text-on-surface-variant">Estado</th>
                              <th class="px-sm py-1 font-label-sm text-label-sm text-on-surface-variant">Nota/Observación</th>
                            </tr>
                          </thead>
                          <tbody>
                            @for (est of ses.estudiantes; track est.id) {
                              <tr class="border-t border-outline/5">
                                <td class="px-sm py-1.5 font-body-sm text-body-sm">{{ est.nombre }}</td>
                                <td class="px-sm py-1.5">
                                  <span class="inline-flex items-center gap-1 font-label-sm text-label-sm"
                                        [class.text-green-700]="est.presente"
                                        [class.text-red-600]="!est.presente">
                                    <span class="material-symbols-outlined" style="font-size: 14px;">
                                      {{ est.presente ? 'check_circle' : 'cancel' }}
                                    </span>
                                    {{ est.presente ? 'Presente' : 'Ausente' }}
                                  </span>
                                </td>
                                <td class="px-sm py-1.5 font-body-sm text-body-sm text-on-surface-variant">{{ est.nota || '—' }}</td>
                              </tr>
                            }
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                }
              } @empty {
                <tr>
                  <td colspan="7" class="text-center py-xl text-on-surface-variant font-body-md text-body-md">
                    No se encontraron registros de asistencia
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="p-md bg-surface-container-low flex flex-col sm:flex-row justify-between items-center gap-md">
          <span class="font-body-sm text-body-sm text-on-surface-variant">
            Mostrando {{ paginated().length }} de {{ totalItems() }} sesiones
          </span>
          <app-pagination [totalItems]="totalItems()" [itemsPerPage]="ITEMS_PER_PAGE"
                          [currentPage]="currentPage()" (pageChange)="onPageChange($event)" />
        </div>
      </div>
    </div>
  `,
})
export class AdminAsistenciaComponent {
  private readonly firestore = inject(Firestore);

  readonly ITEMS_PER_PAGE = ITEMS_PER_PAGE;
  readonly cursos = ASISTENCIA_CURSOS;

  filterCurso = '';
  filterFecha = '';
  appliedCurso = signal('');
  appliedFecha = signal('');
  currentPage = signal(1);
  detalleAbierto = signal<string | null>(null);

  private readonly sesiones = signal<SesionAsistencia[]>([]);

  constructor() {
    const q = query(collection(this.firestore, 'asistencias'), orderBy('fecha', 'desc'));
    collectionData(q, { idField: 'id' }).subscribe((data: any[]) => {
      this.sesiones.set(data as SesionAsistencia[]);
    });
  }

  readonly filtered = computed(() => {
    let list = this.sesiones();
    const cur = this.appliedCurso();
    const fec = this.appliedFecha();
    if (cur) list = list.filter((s) => s.curso === cur);
    if (fec) list = list.filter((s) => s.fecha === fec);
    return list;
  });

  readonly paginated = computed(() => {
    const page = this.currentPage();
    const start = (page - 1) * ITEMS_PER_PAGE;
    return this.filtered().slice(start, start + ITEMS_PER_PAGE);
  });
  readonly totalItems = computed(() => this.filtered().length);

  onPageChange(page: number) { this.currentPage.set(page); }

  applyFilters() {
    this.appliedCurso.set(this.filterCurso);
    this.appliedFecha.set(this.filterFecha);
    this.currentPage.set(1);
  }

  clearFilters() {
    this.filterCurso = '';
    this.filterFecha = '';
    this.appliedCurso.set('');
    this.appliedFecha.set('');
    this.currentPage.set(1);
  }

  toggleDetalle(id: string) {
    this.detalleAbierto.set(this.detalleAbierto() === id ? null : id);
  }

  contarPresentes(ses: SesionAsistencia): number {
    return ses.estudiantes.filter((e) => e.presente).length;
  }

  contarAusentes(ses: SesionAsistencia): number {
    return ses.estudiantes.filter((e) => !e.presente).length;
  }
}
