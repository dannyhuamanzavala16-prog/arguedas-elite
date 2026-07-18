import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../shared/components/toast/toast.service';

interface MaterialEstudiante {
  id: string;
  titulo: string;
  curso: string;
  tipo: string;
  tamano: string;
  fecha: string;
  icono: string;
  iconBg: string;
  iconColor: string;
  esVideo?: boolean;
  duracion?: string;
  badgeColor?: string;
}

const MOCK: MaterialEstudiante[] = [
  { id: '1', titulo: 'Guía de Álgebra: Polinomios', curso: 'Matemática Avanzada', tipo: 'PDF', tamano: '2.4 MB', fecha: 'Agregado ayer', icono: 'picture_as_pdf', iconBg: 'bg-error-container/20', iconColor: 'text-error', badgeColor: '#dc2626' },
  { id: '2', titulo: 'Ensayo: Literatura Peruana', curso: 'Lenguaje y Literatura', tipo: 'DOCX', tamano: '850 KB', fecha: '15 Oct 2024', icono: 'description', iconBg: 'bg-primary-fixed/20', iconColor: 'text-primary', badgeColor: '#1a237e' },
  { id: '3', titulo: 'Clase Grabada: Física Cuántica', curso: 'Física Elemental y Avanzada', tipo: 'MP4', tamano: '312 MB', fecha: '45:12 min', icono: 'play_circle', iconBg: 'bg-tertiary-container/20', iconColor: 'text-tertiary', esVideo: true, duracion: '45:12 min', badgeColor: '#ea580c' },
  { id: '4', titulo: 'Compendio de Historia Universal', curso: 'Ciencias Sociales', tipo: 'PDF', tamano: '5.1 MB', fecha: '12 Oct 2024', icono: 'picture_as_pdf', iconBg: 'bg-error-container/20', iconColor: 'text-error', badgeColor: '#dc2626' },
  { id: '5', titulo: 'Vocabulario Inglés: Nivel B2', curso: 'Idiomas Extranjeros', tipo: 'PDF', tamano: '1.2 MB', fecha: '08 Oct 2024', icono: 'picture_as_pdf', iconBg: 'bg-error-container/20', iconColor: 'text-error', badgeColor: '#dc2626' },
  { id: '6', titulo: 'Solucionario Simulacro UNMSM', curso: 'Preparación Integral', tipo: 'MP4', tamano: '312 MB', fecha: '05 Oct 2024', icono: 'movie', iconBg: 'bg-tertiary-container/20', iconColor: 'text-tertiary', badgeColor: '#ea580c' },
];

type FilterType = 'all' | 'PDF' | 'DOCX' | 'VIDEO' | 'MP4';

@Component({
  selector: 'app-materiales-estudiante',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="p-md md:p-lg max-w-container-max mx-auto w-full">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-md mb-lg">
        <div>
          <h2 class="font-headline-lg text-headline-lg text-primary">Materiales Académicos</h2>
          <p class="font-body-md text-body-md text-on-surface-variant mt-xs">Accede a tus guías de estudio, separatas y grabaciones de clase.</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-base">
          <div class="relative flex-1 sm:flex-none">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="applyFilters()"
                   class="pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all w-full sm:w-72 font-body-sm text-body-sm"
                   placeholder="Buscar material..." />
          </div>
          <div class="relative">
            <button class="flex items-center gap-1.5 px-4 py-2.5 border border-outline-variant rounded-lg font-label-md text-label-md transition-colors"
                    [class.bg-surface-container-lowest]="currentFilter === 'all'"
                    [class.text-on-surface-variant]="currentFilter === 'all'"
                    [class.bg-primary]="currentFilter !== 'all'"
                    [class.text-white]="currentFilter !== 'all'"
                    (click)="toggleFilter()">
              <span class="material-symbols-outlined text-lg">filter_list</span>
              {{ currentFilter === 'all' ? 'Filtrar' : currentFilter }}
            </button>
            @if (showFilter) {
              <div class="absolute right-0 top-full mt-1 w-44 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg z-50 overflow-hidden">
                @for (opt of filterOptions; track opt.value) {
                  <button class="w-full text-left px-4 py-2.5 font-label-md text-label-md transition-colors flex items-center gap-2"
                          [class.text-on-surface]="opt.value === currentFilter"
                          [class.text-on-surface-variant]="opt.value !== currentFilter"
                          [class.bg-surface-container]="opt.value === currentFilter"
                          class="hover:bg-surface-container"
                          (click)="selectFilter(opt.value)">
                    <span class="w-2 h-2 rounded-full inline-block" [style.background]="opt.dotColor"></span>
                    {{ opt.label }}
                  </button>
                }
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
        @for (mat of filtered(); track mat.id) {
          @if (mat.esVideo) {
            <!-- Wide Video Card -->
            <div class="lg:col-span-2 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container-highest group hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div class="flex flex-col md:flex-row gap-md p-md">
                <div class="relative w-full md:w-48 h-32 rounded-lg overflow-hidden bg-surface-container-high flex-shrink-0">
                  <div class="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-all">
                    <span class="material-symbols-outlined text-white text-[48px]" style="font-variation-settings: 'FILL' 1;">play_circle</span>
                  </div>
                </div>
                <div class="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div class="flex justify-between items-start mb-xs gap-sm">
                      <h3 class="font-headline-sm text-headline-sm text-on-surface leading-tight truncate">{{ mat.titulo }}</h3>
                      <span class="bg-tertiary-fixed text-primary px-xs py-1 rounded text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">VIDEO - {{ mat.tipo }}</span>
                    </div>
                    <p class="font-label-sm text-label-sm text-primary mb-md">{{ mat.curso }}</p>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="font-body-sm text-body-sm text-on-surface-variant">Duración: {{ mat.duracion }}</span>
                    <button class="bg-primary text-on-primary px-md py-xs rounded-lg flex items-center gap-xs font-label-md text-label-md hover:bg-primary/90 transition-colors"
                            (click)="simularDescarga(mat)">
                      <span class="material-symbols-outlined text-[18px]">download</span>
                      Descargar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          } @else {
            <!-- Regular Card -->
            <div class="bg-surface-container-lowest p-md rounded-xl shadow-sm border border-surface-container-highest group hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <div class="flex justify-between items-start mb-md">
                <div [class]="'w-12 h-12 rounded-lg flex items-center justify-center ' + mat.iconBg + ' ' + mat.iconColor">
                  <span class="material-symbols-outlined text-[32px]" style="font-variation-settings: 'FILL' 1;">{{ mat.icono }}</span>
                </div>
                <span class="bg-surface-container px-xs py-1 rounded text-[10px] font-bold text-on-surface-variant uppercase tracking-widest whitespace-nowrap">{{ mat.tipo }} - {{ mat.tamano }}</span>
              </div>
              <h3 class="font-headline-sm text-headline-sm text-on-surface leading-tight mb-xs truncate">{{ mat.titulo }}</h3>
              <p class="font-label-sm text-label-sm text-primary mb-md">{{ mat.curso }}</p>
              <div class="flex items-center justify-between mt-auto pt-md border-t border-surface-container">
                <span class="font-body-sm text-body-sm text-on-surface-variant italic">{{ mat.fecha }}</span>
                <button class="bg-primary text-on-primary p-xs rounded-full group-hover:scale-110 transition-transform"
                        (click)="simularDescarga(mat)">
                  <span class="material-symbols-outlined">download</span>
                </button>
              </div>
            </div>
          }
        } @empty {
          <div class="col-span-full text-center py-xl text-on-surface-variant font-body-md text-body-md">
            No se encontraron materiales
          </div>
        }
      </div>
    </div>
  `,
})
export class MaterialesComponent {
  private readonly toast = inject(ToastService);

  searchQuery = signal('');
  currentFilter: FilterType = 'all';
  showFilter = false;

  readonly filterOptions = [
    { value: 'all' as FilterType, label: 'Todos', dotColor: '#737373' },
    { value: 'PDF' as FilterType, label: 'PDF', dotColor: '#dc2626' },
    { value: 'DOCX' as FilterType, label: 'Documento', dotColor: '#1a237e' },
    { value: 'VIDEO' as FilterType, label: 'Video', dotColor: '#4f46e5' },
    { value: 'MP4' as FilterType, label: 'MP4', dotColor: '#ea580c' },
  ];

  readonly filtered = computed(() => {
    let list = [...MOCK];
    const q = this.searchQuery().toLowerCase().trim();

    // Search
    if (q) {
      list = list.filter(
        (m) => m.titulo.toLowerCase().includes(q) || m.curso.toLowerCase().includes(q)
      );
    }

    // Filter
    if (this.currentFilter !== 'all') {
      if (this.currentFilter === 'VIDEO') {
        list = list.filter((m) => m.tipo === 'MP4');
      } else {
        list = list.filter((m) => m.tipo === this.currentFilter);
      }
    }

    return list;
  });

  toggleFilter(): void {
    this.showFilter = !this.showFilter;
  }

  selectFilter(value: FilterType): void {
    this.currentFilter = value;
    this.showFilter = false;
  }

  applyFilters(): void {
    // handled by signals
  }

  simularDescarga(mat: MaterialEstudiante): void {
    this.toast.show(`Descargando ${mat.titulo}...`, 'success');
  }
}
