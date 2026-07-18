import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EstudiantesService } from '../services/estudiantes.service';
import { Estudiante } from '../../shared/models/estudiante.model';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { ConfirmService } from '../../shared/components/confirm/confirm.service';
import { ToastService } from '../../shared/components/toast/toast.service';

const AVATAR_COLORS = [
  'bg-primary-fixed',
  'bg-tertiary-fixed',
  'bg-outline-variant',
  'bg-primary-fixed-dim',
  'bg-secondary-container/20',
];

const ROWS_PER_PAGE = 7;

@Component({
  selector: 'app-estudiantes',
  standalone: true,
  imports: [FormsModule, ModalComponent, PaginationComponent],
  templateUrl: './estudiantes.component.html',
})
export class EstudiantesComponent {
  private readonly service = inject(EstudiantesService);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  // Search & filters
  filterNombre = '';
  filterCarrera = '';
  filterEstado = '';
  showFilters = false;
  appliedNombre = '';
  appliedCarrera = '';
  appliedEstado = '';

  // Form
  formNombre = '';
  formEmail = '';
  formSalon = '';
  formCarrera = '';
  formEstado: 'Activo' | 'Pendiente' = 'Activo';
  editandoCodigo: string | null = null;
  showModal = false;

  // Pagination
  currentPage = signal(1);

  readonly carreras = computed(() => this.service.getCarreras());

  readonly filtered = computed(() => {
    let list = this.service.estudiantes();
    const fn = this.appliedNombre.toLowerCase().trim();
    if (fn) list = list.filter((e) => e.nombre.toLowerCase().includes(fn));
    if (this.appliedCarrera) list = list.filter((e) => e.carrera === this.appliedCarrera);
    if (this.appliedEstado) list = list.filter((e) => e.estado === this.appliedEstado);
    return list;
  });

  readonly paginated = computed(() => {
    const page = this.currentPage();
    const start = (page - 1) * ROWS_PER_PAGE;
    return this.filtered().slice(start, start + ROWS_PER_PAGE);
  });

  readonly totalItems = computed(() => this.filtered().length);

  getAvatarColor(index: number): string {
    return AVATAR_COLORS[index % AVATAR_COLORS.length];
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((p) => p[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  // --- Filters ---
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
    if (!this.showFilters) {
      // Al cerrar sin aplicar, restaurar valores aplicados
      this.filterNombre = this.appliedNombre;
      this.filterCarrera = this.appliedCarrera;
      this.filterEstado = this.appliedEstado;
    }
  }

  applyFilters(): void {
    this.appliedNombre = this.filterNombre;
    this.appliedCarrera = this.filterCarrera;
    this.appliedEstado = this.filterEstado;
    this.currentPage.set(1);
  }

  clearFilters(): void {
    this.filterNombre = '';
    this.filterCarrera = '';
    this.filterEstado = '';
    this.appliedNombre = '';
    this.appliedCarrera = '';
    this.appliedEstado = '';
    this.currentPage.set(1);
  }

  // --- Modal ---
  openCreateModal(): void {
    this.editandoCodigo = null;
    this.formNombre = '';
    this.formEmail = '';
    this.formSalon = '';
    this.formCarrera = '';
    this.formEstado = 'Activo';
    this.showModal = true;
  }

  openEditModal(est: Estudiante): void {
    this.editandoCodigo = est.codigo;
    this.formNombre = est.nombre;
    this.formEmail = est.email;
    this.formSalon = est.salon;
    this.formCarrera = est.carrera;
    this.formEstado = est.estado;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editandoCodigo = null;
  }

  onSubmit(): void {
    if (!this.formNombre || !this.formEmail || !this.formSalon || !this.formCarrera) return;

    const confirmText = this.editandoCodigo ? 'Guardar cambios' : 'Registrar estudiante';
    this.confirm
      .confirm({
        title: confirmText,
        desc: this.editandoCodigo
          ? 'Se actualizarán los datos de este estudiante.'
          : `Se registrará a "${this.formNombre}" en la carrera de ${this.formCarrera}.`,
        icon: 'save',
        iconBg: 'bg-primary-container/20',
        iconColor: 'text-primary',
        confirmText: this.editandoCodigo ? 'Guardar' : 'Registrar',
        confirmClass: 'bg-primary text-on-primary hover:bg-primary/90',
      })
      .subscribe((ok) => {
        if (!ok) return;

        if (this.editandoCodigo) {
          this.service.actualizar(this.editandoCodigo, {
            nombre: this.formNombre,
            email: this.formEmail,
            salon: this.formSalon,
            carrera: this.formCarrera,
            estado: this.formEstado,
          });
          this.toast.show('Estudiante actualizado correctamente', 'success');
        } else {
          this.service.crear({
            nombre: this.formNombre,
            email: this.formEmail,
            salon: this.formSalon,
            carrera: this.formCarrera,
            estado: this.formEstado,
          });
          this.toast.show('Estudiante registrado correctamente', 'success');
        }
        this.closeModal();
      });
  }

  // --- Delete ---
  confirmDelete(codigo: string): void {
    const est = this.service.getByCodigo(codigo);
    this.confirm
      .confirm({
        title: 'Eliminar estudiante',
        desc: `¿Estás seguro de eliminar a "${est?.nombre || 'este estudiante'}"? Esta acción no se puede deshacer.`,
        icon: 'delete',
        iconBg: 'bg-error-container',
        iconColor: 'text-error',
        confirmText: 'Eliminar',
        confirmClass: 'bg-error text-on-error hover:bg-error/90',
      })
      .subscribe((ok) => {
        if (ok) {
          this.service.eliminar(codigo);
          this.toast.show('Estudiante eliminado correctamente', 'success');
        }
      });
  }
}
