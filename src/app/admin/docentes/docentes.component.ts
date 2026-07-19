import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DocentesService } from '../services/docentes.service';
import { Docente } from '../../shared/models/docente.model';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { ConfirmService } from '../../shared/components/confirm/confirm.service';
import { ToastService } from '../../shared/components/toast/toast.service';

const AVATAR_COLORS = ['bg-primary-fixed', 'bg-tertiary-fixed', 'bg-outline-variant', 'bg-primary-fixed-dim', 'bg-secondary-container/20'];
const ROWS_PER_PAGE = 7;

@Component({
  selector: 'app-docentes',
  standalone: true,
  imports: [FormsModule, ModalComponent, PaginationComponent],
  template: `
    <div class="max-w-container-max mx-auto p-md md:p-lg">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-md mb-lg">
        <div>
          <h2 class="font-headline-xl text-headline-md md:text-headline-xl text-primary-container mb-2">Panel de Docentes</h2>
          <p class="font-body-md text-body-md text-on-surface-variant">Administra la base de datos de docentes y sus asignaciones.</p>
        </div>
        <button class="w-full md:w-auto bg-primary text-on-primary px-md py-sm rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                (click)="openCreateModal()">
          <span class="material-symbols-outlined">person_add</span> Registrar Docente
        </button>
      </div>

      <!-- Table Card -->
      <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-outline/10 overflow-hidden">
        <!-- Toolbar -->
        <div class="p-md border-b border-outline/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
          <h3 class="font-headline-sm text-headline-sm text-on-surface">Listado de Docentes</h3>
          <div class="flex items-center gap-sm w-full sm:w-auto">
            <button class="flex-1 sm:flex-none flex items-center justify-center gap-2 border border-outline/20 px-sm py-1.5 rounded-lg text-label-md font-label-md hover:bg-surface-container transition-colors"
                    (click)="toggleFilters()">
              <span class="material-symbols-outlined text-[18px]">filter_list</span> Filtrar
            </button>
            <button class="flex-1 sm:flex-none flex items-center justify-center gap-2 border border-outline/20 px-sm py-1.5 rounded-lg text-label-md font-label-md hover:bg-surface-container transition-colors">
              <span class="material-symbols-outlined text-[18px]">download</span> Exportar
            </button>
          </div>
        </div>

        <!-- Filter Panel -->
        @if (showFilters) {
          <div class="p-md bg-surface-container-low border-b border-outline/10">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
              <div>
                <label class="font-label-sm text-label-sm text-on-surface-variant block mb-1">Buscar por nombre</label>
                <input type="text" [(ngModel)]="filterNombre" placeholder="Escribe un nombre..."
                       class="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2 px-3 font-body-md text-body-md focus:border-primary focus:bg-white transition-all" />
              </div>
              <div>
                <label class="font-label-sm text-label-sm text-on-surface-variant block mb-1">Especialidad</label>
                <select [(ngModel)]="filterEspecialidad"
                        class="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2 px-3 font-body-md text-body-md focus:border-primary focus:bg-white transition-all">
                  <option value="">Todas</option>
                  @for (e of especialidades(); track e) { <option [value]="e">{{ e }}</option> }
                </select>
              </div>
              <div>
                <label class="font-label-sm text-label-sm text-on-surface-variant block mb-1">Estado</label>
                <select [(ngModel)]="filterEstado"
                        class="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2 px-3 font-body-md text-body-md focus:border-primary focus:bg-white transition-all">
                  <option value="">Todos</option>
                  <option value="Activo">Activo</option>
                  <option value="Pendiente">Pendiente</option>
                </select>
              </div>
              <div class="flex items-end gap-2">
                <button class="flex-1 bg-primary text-on-primary px-md py-2 rounded-lg font-label-md text-label-md hover:bg-primary/90 transition-colors"
                        (click)="applyFilters()">Aplicar</button>
                <button class="flex-1 border border-outline/20 px-md py-2 rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors"
                        (click)="clearFilters()">Limpiar</button>
              </div>
            </div>
          </div>
        }

        <!-- Desktop Table (hidden on mobile) -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-surface-container-low">
                <th class="px-md py-sm font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Código</th>
                <th class="px-md py-sm font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Docente</th>
                <th class="px-md py-sm font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Especialidad</th>
                <th class="px-md py-sm font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Cursos</th>
                <th class="px-md py-sm font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Estado</th>
                <th class="px-md py-sm font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline/5">
              @for (doc of paginated(); track doc.codigo; let i = $index) {
                <tr class="hover:bg-surface-container-low transition-colors group">
                  <td class="px-md py-md font-label-md text-label-md text-primary font-bold">{{ doc.codigo }}</td>
                  <td class="px-md py-md">
                    <div class="flex items-center gap-sm">
                      <div class="w-8 h-8 rounded-full {{ getAvatarColor(i) }} flex items-center justify-center font-bold text-xs">
                        {{ getInitials(doc.nombre) }}
                      </div>
                      <div>
                        <p class="font-label-md text-label-md text-on-surface">{{ doc.nombre }}</p>
                        <p class="font-body-sm text-body-sm text-on-surface-variant">{{ doc.email }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-md py-md font-body-md text-body-md">{{ doc.especialidad }}</td>
                  <td class="px-md py-md">
                    <div class="flex flex-wrap gap-1">
                      @for (c of doc.cursos; track c) {
                        <span class="px-xs py-[2px] bg-secondary-container text-on-secondary-container rounded text-label-sm font-label-sm">{{ c }}</span>
                      }
                    </div>
                  </td>
                  <td class="px-md py-md">
                    <span class="px-sm py-1 rounded-full font-label-sm text-label-sm"
                          [class.bg-green-100]="doc.estado === 'Activo'" [class.text-green-700]="doc.estado === 'Activo'"
                          [class.bg-tertiary-fixed]="doc.estado === 'Pendiente'" [class.text-on-tertiary-fixed-variant]="doc.estado === 'Pendiente'">
                      {{ doc.estado }}
                    </span>
                  </td>
                  <td class="px-md py-md text-right">
                    <div class="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button class="w-9 h-9 flex items-center justify-center rounded-lg text-primary hover:bg-primary/10 transition-colors" title="Editar" (click)="openEditModal(doc)">
                        <span class="material-symbols-outlined">edit</span>
                      </button>
                      <button class="w-9 h-9 flex items-center justify-center rounded-lg text-error hover:bg-error/10 transition-colors" title="Eliminar" (click)="confirmDelete(doc.codigo)">
                        <span class="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="6" class="text-center py-xl text-on-surface-variant font-body-md text-body-md">No hay docentes registrados</td></tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Mobile Cards (visible only on mobile) -->
        <div class="md:hidden divide-y divide-outline/5">
          @for (doc of paginated(); track doc.codigo; let i = $index) {
            <div class="p-md space-y-sm">
              <!-- Top row: avatar + name + actions -->
              <div class="flex items-start justify-between gap-sm">
                <div class="flex items-center gap-sm min-w-0">
                  <div class="w-10 h-10 rounded-full {{ getAvatarColor(i) }} flex items-center justify-center font-bold text-xs shrink-0">
                    {{ getInitials(doc.nombre) }}
                  </div>
                  <div class="min-w-0">
                    <p class="font-label-md text-label-md text-on-surface truncate">{{ doc.nombre }}</p>
                    <p class="font-body-sm text-body-sm text-on-surface-variant truncate">{{ doc.email }}</p>
                  </div>
                </div>
                <div class="flex gap-1 shrink-0">
                  <button class="w-9 h-9 flex items-center justify-center rounded-lg text-primary hover:bg-primary/10 transition-colors" (click)="openEditModal(doc)">
                    <span class="material-symbols-outlined" style="font-size: 20px;">edit</span>
                  </button>
                  <button class="w-9 h-9 flex items-center justify-center rounded-lg text-error hover:bg-error/10 transition-colors" (click)="confirmDelete(doc.codigo)">
                    <span class="material-symbols-outlined" style="font-size: 20px;">delete</span>
                  </button>
                </div>
              </div>

              <!-- Details grid -->
              <div class="grid grid-cols-3 gap-xs text-body-sm pl-[52px]">
                <div>
                  <p class="font-label-sm text-label-sm text-on-surface-variant">Código</p>
                  <p class="font-label-md text-label-md text-primary font-bold">{{ doc.codigo }}</p>
                </div>
                <div>
                  <p class="font-label-sm text-label-sm text-on-surface-variant">Especialidad</p>
                  <p class="font-body-sm text-body-sm text-on-surface truncate">{{ doc.especialidad }}</p>
                </div>
                <div class="flex flex-col items-start">
                  <p class="font-label-sm text-label-sm text-on-surface-variant">Estado</p>
                  <span class="px-sm py-0.5 rounded-full font-label-sm text-label-sm mt-0.5"
                        [class.bg-green-100]="doc.estado === 'Activo'" [class.text-green-700]="doc.estado === 'Activo'"
                        [class.bg-tertiary-fixed]="doc.estado === 'Pendiente'" [class.text-on-tertiary-fixed-variant]="doc.estado === 'Pendiente'">
                    {{ doc.estado }}
                  </span>
                </div>
              </div>
              
              <!-- Cursos -->
              <div class="pl-[52px] space-y-1">
                <p class="font-label-sm text-label-sm text-on-surface-variant">Cursos</p>
                <div class="flex flex-wrap gap-1">
                  @for (c of doc.cursos; track c) {
                    <span class="px-xs py-[2px] bg-secondary-container text-on-secondary-container rounded text-label-sm font-label-sm">{{ c }}</span>
                  } @empty {
                    <span class="text-on-surface-variant italic text-body-sm">—</span>
                  }
                </div>
              </div>
            </div>
          } @empty {
            <div class="p-xl text-center text-on-surface-variant font-body-md text-body-md">No hay docentes registrados</div>
          }
        </div>

        <div class="p-md bg-surface-container-low flex flex-col sm:flex-row justify-between items-center gap-md">
          <span class="font-body-sm text-body-sm text-on-surface-variant">Mostrando {{ paginated().length }} de {{ totalItems() }} docentes</span>
          <app-pagination [totalItems]="totalItems()" [itemsPerPage]="7" [currentPage]="currentPage()" (pageChange)="onPageChange($event)" />
        </div>
      </div>

      <!-- Modal -->
      <app-modal [isOpen]="showModal" (close)="closeModal()">
        <div class="p-md border-b border-outline/10 flex justify-between items-center">
          <h3 class="font-headline-sm text-headline-sm text-on-surface">{{ editandoCodigo ? 'Editar Docente' : 'Registrar Docente' }}</h3>
          <button class="w-9 h-9 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors" (click)="closeModal()">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <form class="p-md space-y-md" (ngSubmit)="onSubmit()">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-md">
            <div class="space-y-1">
              <label class="font-label-sm text-label-sm text-on-surface-variant block">Nombre completo</label>
              <input type="text" [(ngModel)]="formNombre" name="nombre" required placeholder="Ej: Juan Pérez"
                     class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 px-3 font-body-md text-body-md focus:border-primary focus:bg-white transition-all" />
            </div>
            <div class="space-y-1">
              <label class="font-label-sm text-label-sm text-on-surface-variant block">Email</label>
              <input type="email" [(ngModel)]="formEmail" name="email" required placeholder="correo@elite.edu"
                     class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 px-3 font-body-md text-body-md focus:border-primary focus:bg-white transition-all" />
            </div>
            <div class="space-y-1">
              <label class="font-label-sm text-label-sm text-on-surface-variant block">Especialidad</label>
              <input type="text" [(ngModel)]="formEspecialidad" name="especialidad" required placeholder="Ej: Matemáticas"
                     class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 px-3 font-body-md text-body-md focus:border-primary focus:bg-white transition-all" />
            </div>
            <div class="space-y-1">
              <label class="font-label-sm text-label-sm text-on-surface-variant block">Cursos (separados por coma)</label>
              <input type="text" [(ngModel)]="formCursos" name="cursos" placeholder="Ej: Álgebra, Trigonometría"
                     class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 px-3 font-body-md text-body-md focus:border-primary focus:bg-white transition-all" />
            </div>
            <div class="space-y-1">
              <label class="font-label-sm text-label-sm text-on-surface-variant block">Estado</label>
              <select [(ngModel)]="formEstado" name="estado" required
                      class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 px-3 font-body-md text-body-md focus:border-primary focus:bg-white transition-all">
                <option value="Activo">Activo</option>
                <option value="Pendiente">Pendiente</option>
              </select>
            </div>
          </div>
          <div class="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-sm border-t border-outline/10">
            <button type="button" class="border border-outline/20 px-md py-2.5 rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors" (click)="closeModal()">Cancelar</button>
            <button type="submit" class="bg-primary text-on-primary px-md py-2.5 rounded-lg font-label-md text-label-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
              <span class="material-symbols-outlined" style="font-size: 18px;">save</span> {{ editandoCodigo ? 'Guardar' : 'Registrar' }}
            </button>
          </div>
        </form>
      </app-modal>
    </div>
  `,
})
export class DocentesComponent {
  private readonly service = inject(DocentesService);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  filterNombre = '';
  filterEspecialidad = '';
  filterEstado = '';
  showFilters = false;
  appliedNombre = signal('');
  appliedEspecialidad = signal('');
  appliedEstado = signal('');

  formNombre = '';
  formEmail = '';
  formEspecialidad = '';
  formCursos = '';
  formEstado: 'Activo' | 'Pendiente' = 'Activo';
  editandoCodigo: string | null = null;
  showModal = false;

  currentPage = signal(1);
  readonly especialidades = computed(() => this.service.getEspecialidades());

  readonly filtered = computed(() => {
    let list = this.service.docentes();
    const fn = this.appliedNombre().toLowerCase().trim();
    if (fn) list = list.filter((d) => d.nombre.toLowerCase().includes(fn));
    const esp = this.appliedEspecialidad();
    if (esp) list = list.filter((d) => d.especialidad === esp);
    const est = this.appliedEstado();
    if (est) list = list.filter((d) => d.estado === est);
    return list;
  });

  readonly paginated = computed(() => {
    const page = this.currentPage();
    const start = (page - 1) * ROWS_PER_PAGE;
    return this.filtered().slice(start, start + ROWS_PER_PAGE);
  });
  readonly totalItems = computed(() => this.filtered().length);

  getAvatarColor(i: number) { return AVATAR_COLORS[i % AVATAR_COLORS.length]; }
  getInitials(name: string) { return name.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase(); }
  onPageChange(page: number) { this.currentPage.set(page); }
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
    if (!this.showFilters) {
      this.filterNombre = this.appliedNombre();
      this.filterEspecialidad = this.appliedEspecialidad();
      this.filterEstado = this.appliedEstado();
    }
  }
  applyFilters() {
    this.appliedNombre.set(this.filterNombre);
    this.appliedEspecialidad.set(this.filterEspecialidad);
    this.appliedEstado.set(this.filterEstado);
    this.currentPage.set(1);
  }
  clearFilters() {
    this.filterNombre = '';
    this.filterEspecialidad = '';
    this.filterEstado = '';
    this.appliedNombre.set('');
    this.appliedEspecialidad.set('');
    this.appliedEstado.set('');
    this.currentPage.set(1);
  }

  openCreateModal(): void {
    this.editandoCodigo = null; this.formNombre = ''; this.formEmail = ''; this.formEspecialidad = ''; this.formCursos = ''; this.formEstado = 'Activo';
    this.showModal = true;
  }

  openEditModal(doc: Docente): void {
    this.editandoCodigo = doc.codigo;
    this.formNombre = doc.nombre; this.formEmail = doc.email; this.formEspecialidad = doc.especialidad;
    this.formCursos = doc.cursos.join(', '); this.formEstado = doc.estado;
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; this.editandoCodigo = null; }

  onSubmit(): void {
    if (!this.formNombre || !this.formEmail || !this.formEspecialidad) return;
    const cursos = this.formCursos.split(',').map(c => c.trim()).filter(c => c);
    const confirmText = this.editandoCodigo ? 'Guardar cambios' : 'Registrar docente';

    this.confirm.confirm({
      title: confirmText,
      desc: this.editandoCodigo ? 'Se actualizarán los datos de este docente.' : `Se registrará a "${this.formNombre}" en la especialidad de ${this.formEspecialidad}.`,
      icon: 'save', iconBg: 'bg-primary-container/20', iconColor: 'text-primary',
      confirmText: this.editandoCodigo ? 'Guardar' : 'Registrar',
      confirmClass: 'bg-primary text-on-primary hover:bg-primary/90',
    }).subscribe(async (ok) => {
      if (!ok) return;
      try {
        if (this.editandoCodigo) {
          await this.service.actualizar(this.editandoCodigo, { nombre: this.formNombre, email: this.formEmail, especialidad: this.formEspecialidad, cursos, estado: this.formEstado });
          this.toast.show('Docente actualizado correctamente', 'success');
        } else {
          await this.service.crear({ nombre: this.formNombre, email: this.formEmail, especialidad: this.formEspecialidad, cursos, estado: this.formEstado });
          this.toast.show('Docente registrado correctamente', 'success');
        }
        this.closeModal();
      } catch (err) {
        console.error('Error al guardar docente:', err);
        this.toast.show('Error al guardar. Intente de nuevo.', 'error');
      }
    });
  }

  confirmDelete(codigo: string): void {
    this.confirm.confirm({
      title: 'Eliminar docente',
      desc: '¿Estás seguro de eliminar a este docente? Esta acción no se puede deshacer.',
      icon: 'delete', iconBg: 'bg-error-container', iconColor: 'text-error',
      confirmText: 'Eliminar', confirmClass: 'bg-error text-on-error hover:bg-error/90',
    }).subscribe(async (ok) => {
      if (!ok) return;
      try {
        await this.service.eliminar(codigo);
        this.toast.show('Docente eliminado correctamente', 'success');
      } catch (err) {
        console.error('Error al eliminar docente:', err);
        this.toast.show('Error al eliminar. Intente de nuevo.', 'error');
      }
    });
  }
}
