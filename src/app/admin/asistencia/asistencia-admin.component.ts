import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { ASISTENCIA_CURSOS, ASISTENCIA_GRUPOS } from '../../shared/services/mock-data.service';

interface RegistroEstudiante {
  id: string;
  nombre: string;
  presente: boolean | null;
  nota: string;
}

function getDocId(fecha: string, curso: string, grupo: string): string {
  const clean = (str: string) =>
    str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-');
  return `${fecha}_${clean(curso)}_${clean(grupo)}`;
}

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

@Component({
  selector: 'app-admin-asistencia',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="p-md md:p-lg max-w-container-max mx-auto w-full space-y-md">
      <header>
        <h1 class="font-headline-lg text-headline-md text-primary font-bold tracking-tight">Asistencia (consulta)</h1>
        <p class="font-body-sm text-body-sm text-on-surface-variant">Ver registros guardados por fecha, curso y grupo.</p>
      </header>

      <section class="bg-surface-container-lowest rounded-xl shadow-md border border-outline-variant/10 p-md">
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-md items-end">
          <div>
            <label class="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">Fecha</label>
            <input type="date" [ngModel]="fecha()" (ngModelChange)="fecha.set($event)"
              class="w-full px-md py-sm rounded-lg border border-outline text-body-sm outline-none bg-surface-bright" />
          </div>
          <div>
            <label class="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">Curso</label>
            <select [ngModel]="curso()" (ngModelChange)="curso.set($event)"
              class="w-full px-md py-sm rounded-lg border border-outline text-body-sm outline-none bg-surface-bright">
              @for (c of cursos; track c) { <option [value]="c">{{ c }}</option> }
            </select>
          </div>
          <div>
            <label class="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">Grupo</label>
            <select [ngModel]="grupo()" (ngModelChange)="grupo.set($event)"
              class="w-full px-md py-sm rounded-lg border border-outline text-body-sm outline-none bg-surface-bright">
              @for (g of grupos; track g) { <option [value]="g">{{ g }}</option> }
            </select>
          </div>
          <div>
            <button type="button" (click)="buscar()" [disabled]="loading()"
              class="w-full px-md py-sm bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary/90 disabled:opacity-60">
              {{ loading() ? 'Buscando…' : 'Buscar' }}
            </button>
          </div>
        </div>
      </section>

      @if (loading()) {
        <p class="text-on-surface-variant font-body-sm">Cargando…</p>
      } @else if (noEncontrado()) {
        <div class="bg-surface-container rounded-xl p-lg text-center text-on-surface-variant">
          No hay registro de asistencia para esa fecha, curso y grupo.
        </div>
      } @else if (registros().length > 0) {
        <section class="bg-surface-container-lowest rounded-xl shadow-md border border-outline-variant/10 overflow-hidden">
          <div class="p-md border-b border-outline-variant/10 flex flex-wrap gap-md items-center justify-between">
            <p class="font-label-md text-label-md text-primary font-bold">
              {{ stats().presentes }}/{{ stats().total }} presentes ({{ stats().porcentaje }}%)
            </p>
            <p class="font-label-sm text-label-sm text-on-surface-variant">
              Ausentes: {{ stats().ausentes }} · Sin marcar: {{ stats().sinMarcar }}
            </p>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-surface-container border-b border-outline-variant/20">
                  <th class="px-md py-sm font-label-sm text-label-sm uppercase text-on-surface-variant">Estudiante</th>
                  <th class="px-md py-sm font-label-sm text-label-sm uppercase text-on-surface-variant">ID</th>
                  <th class="px-md py-sm font-label-sm text-label-sm uppercase text-on-surface-variant">Estado</th>
                  <th class="px-md py-sm font-label-sm text-label-sm uppercase text-on-surface-variant">Nota</th>
                </tr>
              </thead>
              <tbody>
                @for (r of registros(); track r.id) {
                  <tr class="border-b border-outline-variant/10">
                    <td class="px-md py-sm font-label-md text-label-md">{{ r.nombre }}</td>
                    <td class="px-md py-sm font-mono text-label-sm text-on-surface-variant">{{ r.id }}</td>
                    <td class="px-md py-sm">
                      @if (r.presente === true) {
                        <span class="text-green-700 font-label-sm">Presente</span>
                      } @else if (r.presente === false) {
                        <span class="text-red-700 font-label-sm">Ausente</span>
                      } @else {
                        <span class="text-on-surface-variant font-label-sm">Sin marcar</span>
                      }
                    </td>
                    <td class="px-md py-sm text-body-sm text-on-surface-variant italic">{{ r.nota || '—' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>
      }
    </div>
  `,
})
export class AdminAsistenciaComponent {
  private readonly firestore = inject(Firestore);

  readonly cursos = ASISTENCIA_CURSOS;
  readonly grupos = ASISTENCIA_GRUPOS;

  readonly fecha = signal(getTodayString());
  readonly curso = signal(ASISTENCIA_CURSOS[0]);
  readonly grupo = signal(ASISTENCIA_GRUPOS[1]);

  readonly loading = signal(false);
  readonly noEncontrado = signal(false);
  readonly registros = signal<RegistroEstudiante[]>([]);

  readonly stats = signal({ presentes: 0, ausentes: 0, sinMarcar: 0, porcentaje: 0, total: 0 });

  async buscar(): Promise<void> {
    this.loading.set(true);
    this.noEncontrado.set(false);
    this.registros.set([]);
    try {
      const id = getDocId(this.fecha(), this.curso(), this.grupo());
      const snap = await getDoc(doc(this.firestore, 'asistencias', id));
      if (!snap.exists()) {
        this.noEncontrado.set(true);
        this.stats.set({ presentes: 0, ausentes: 0, sinMarcar: 0, porcentaje: 0, total: 0 });
        return;
      }
      const data = snap.data() as any;
      const list: RegistroEstudiante[] = (data.estudiantes ?? []).map((e: any) => ({
        id: e.id,
        nombre: e.nombre,
        presente: e.presente === true ? true : e.presente === false ? false : null,
        nota: e.nota ?? '',
      }));
      this.registros.set(list);
      const total = list.length;
      const presentes = list.filter((e) => e.presente === true).length;
      const ausentes = list.filter((e) => e.presente === false).length;
      const sinMarcar = total - presentes - ausentes;
      const porcentaje = total > 0 ? Math.round((presentes / total) * 100) : 0;
      this.stats.set({ presentes, ausentes, sinMarcar, porcentaje, total });
    } catch (e) {
      console.error(e);
      this.noEncontrado.set(true);
    } finally {
      this.loading.set(false);
    }
  }
}
