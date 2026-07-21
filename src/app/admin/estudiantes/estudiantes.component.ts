import { Component, computed, inject, signal, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { combineLatest, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { EstudiantesService } from '../services/estudiantes.service';
import { Estudiante } from '../../shared/models/estudiante.model';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { ConfirmService } from '../../shared/components/confirm/confirm.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { FotoService } from '../../shared/services/foto.service';

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
export class EstudiantesComponent implements OnDestroy {
  private readonly service = inject(EstudiantesService);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  private readonly fotoService = inject(FotoService);

  protected readonly loading = signal(true);
  private readonly initSub: Subscription;

  constructor() {
    this.initSub = combineLatest([
      this.service.getAll(),
    ]).pipe(take(1)).subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }

  ngOnDestroy(): void {
    this.initSub.unsubscribe();
  }

  // Search & filters
  filterNombre = '';
  filterCarrera = '';
  filterEstado = '';
  showFilters = false;
  appliedNombre = signal('');
  appliedCarrera = signal('');
  appliedEstado = signal('');

  // Form
  formNombre = '';
  formCiclo: 'I' | 'II' = 'I';
  formTelefono = '';
  formTelefonoApoderado = '';
  formSalon = '';
  formCarrera = '';
  formEstado: 'Activo' | 'Pendiente' = 'Activo';
  editandoCodigo: string | null = null;
  showModal = false;
  /** Vista previa del código que se generará al registrar */
  formCodigoPreview: string | null = null;
  formUsernamePreview: string | null = null;
  formFoto = signal<File | null>(null);
  formFotoPreview = signal<string | null>(null);
  formFotoUrl = '';

  // Pagination
  currentPage = signal(1);

  readonly carreras = computed(() => this.service.getCarreras());

  readonly filtered = computed(() => {
    let list = this.service.estudiantes();
    const fn = this.appliedNombre().toLowerCase().trim();
    if (fn) list = list.filter((e) => e.nombre.toLowerCase().includes(fn));
    const carr = this.appliedCarrera();
    if (carr) list = list.filter((e) => e.carrera === carr);
    const est = this.appliedEstado();
    if (est) list = list.filter((e) => e.estado === est);
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
      this.filterNombre = this.appliedNombre();
      this.filterCarrera = this.appliedCarrera();
      this.filterEstado = this.appliedEstado();
    }
  }

  applyFilters(): void {
    this.appliedNombre.set(this.filterNombre);
    this.appliedCarrera.set(this.filterCarrera);
    this.appliedEstado.set(this.filterEstado);
    this.currentPage.set(1);
  }

  clearFilters(): void {
    this.filterNombre = '';
    this.filterCarrera = '';
    this.filterEstado = '';
    this.appliedNombre.set('');
    this.appliedCarrera.set('');
    this.appliedEstado.set('');
    this.currentPage.set(1);
  }

  // --- Modal ---
  openCreateModal(): void {
    this.editandoCodigo = null;
    this.formNombre = '';
    this.formCiclo = 'I';
    this.formTelefono = '';
    this.formTelefonoApoderado = '';
    this.formSalon = '';
    this.formCarrera = '';
    this.formEstado = 'Activo';
    this.formFoto.set(null);
    this.formFotoPreview.set(null);
    this.formFotoUrl = '';
    this.actualizarPreview();
    this.showModal = true;
  }

  /** Refresca la vista previa del código según el ciclo seleccionado */
  actualizarPreview(): void {
    const preview = this.service.previewNextCodigo(this.formCiclo);
    this.formCodigoPreview = preview.codigo;
    this.formUsernamePreview = preview.docId;
  }

  openEditModal(est: Estudiante): void {
    this.editandoCodigo = est.codigo;
    this.formNombre = est.nombre;
    this.formSalon = est.salon;
    this.formCarrera = est.carrera;
    this.formEstado = est.estado;
    this.formFoto.set(null);
    this.formFotoPreview.set(null);
    this.formFotoUrl = est.foto ?? '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editandoCodigo = null;
    this.formCiclo = 'I';
    this.formCodigoPreview = null;
    this.formUsernamePreview = null;
    this.formFoto.set(null);
    this.formFotoPreview.set(null);
    this.formFotoUrl = '';
  }

  onFotoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.formFoto.set(file);
    const reader = new FileReader();
    reader.onload = () => this.formFotoPreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  clearFoto(): void {
    this.formFoto.set(null);
    this.formFotoPreview.set(null);
    this.formFotoUrl = '';
  }

  async onSubmit(): Promise<void> {
    if (!this.formNombre || !this.formSalon || !this.formCarrera) return;

    const confirmText = this.editandoCodigo ? 'Guardar cambios' : 'Registrar estudiante';

    const confirmed = await new Promise<boolean>((resolve) => {
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
        .subscribe((ok) => resolve(ok));
    });
    if (!confirmed) return;

    try {
      // Subir foto si hay una nueva
      let fotoUrl = this.formFotoUrl;
      const fotoFile = this.formFoto();
      if (fotoFile) {
        const docId = this.editandoCodigo?.replace('#', '') ?? this.formUsernamePreview!;
        fotoUrl = await this.fotoService.subir(fotoFile, 'estudiantes', `${docId}.${fotoFile.name.split('.').pop()}`);
        if (this.formFotoUrl) {
          await this.fotoService.eliminar(this.formFotoUrl).catch(() => {});
        }
      }

      if (this.editandoCodigo) {
        await this.service.actualizar(this.editandoCodigo, {
          nombre: this.formNombre,
          salon: this.formSalon,
          carrera: this.formCarrera,
          estado: this.formEstado,
          foto: fotoUrl,
        });
        this.toast.show('Estudiante actualizado correctamente', 'success');
      } else {
        const codigo = await this.service.crear({
          nombre: this.formNombre,
          telefono: this.formTelefono,
          telefonoApoderado: this.formTelefonoApoderado,
          salon: this.formSalon,
          carrera: this.formCarrera,
          estado: this.formEstado,
          foto: fotoUrl,
        }, this.formCiclo);
        const user = codigo.replace('#', '');
        this.toast.show(
          `✅ Estudiante registrado — Código: ${codigo} | Usuario y clave: ${user}`,
          'success'
        );
      }
      this.closeModal();
    } catch (err) {
      console.error('Error al guardar:', err);
      this.toast.show('Error al guardar. Intente de nuevo.', 'error');
    }
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
      .subscribe(async (ok) => {
        if (!ok) return;
        try {
          await this.service.eliminar(codigo);
          this.toast.show('Estudiante eliminado correctamente', 'success');
        } catch (err) {
          console.error('Error al eliminar:', err);
          this.toast.show('Error al eliminar. Intente de nuevo.', 'error');
        }
      });
  }
}
