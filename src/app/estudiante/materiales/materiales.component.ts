import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../shared/components/toast/toast.service';
import { MaterialesEstudianteService, MaterialEstudiante } from '../services/materiales.service';

type FilterType = 'all' | 'PDF' | 'DOCX' | 'VIDEO';

@Component({
  selector: 'app-materiales-estudiante',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="p-md md:p-lg max-w-container-max mx-auto w-full">
      @if (loading()) {
        <!-- ── LOADING SKELETON ────────────────────────────── -->
        <div class="animate-pulse space-y-lg">
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-md">
            <div class="space-y-2">
              <div class="h-8 w-56 bg-surface-container rounded"></div>
              <div class="h-4 w-72 bg-surface-container rounded"></div>
            </div>
            <div class="flex gap-base">
              <div class="h-10 w-72 bg-surface-container rounded-lg"></div>
              <div class="h-10 w-24 bg-surface-container rounded-lg"></div>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
            @for (_ of [1,2,3,4,5,6]; track _) {
              <div class="bg-surface-container-lowest p-md rounded-xl border border-surface-container-highest">
                <div class="w-12 h-12 rounded-lg bg-surface-container mb-md"></div>
                <div class="h-4 w-full bg-surface-container rounded mb-xs"></div>
                <div class="h-3 w-2/3 bg-surface-container rounded mb-md"></div>
                <div class="flex justify-between items-center pt-md border-t border-surface-container">
                  <div class="h-3 w-20 bg-surface-container rounded"></div>
                  <div class="h-8 w-8 bg-surface-container rounded-full"></div>
                </div>
              </div>
            }
          </div>
        </div>
      } @else {
        <!-- ── HEADER ──────────────────────────────────────── -->
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
              <button class="flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-label-md text-label-md transition-all duration-200 border"
                      [class.bg-surface-container-low]="currentFilter() === 'all'"
                      [class.text-on-surface-variant]="currentFilter() === 'all'"
                      [class.border-outline-variant]="currentFilter() === 'all'"
                      [class.bg-primary]="currentFilter() !== 'all'"
                      [class.text-white]="currentFilter() !== 'all'"
                      [class.border-primary]="currentFilter() !== 'all'"
                      [class.shadow-sm]="currentFilter() !== 'all'"
                      (click)="toggleFilter()">
                <span class="material-symbols-outlined text-lg">filter_list</span>
                @if (currentFilter() !== 'all') {
                  <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                }
                {{ filterLabel() }}
              </button>
              @if (showFilter) {
                <div class="filter-dropdown absolute right-0 top-full mt-1.5 w-44 bg-white border border-outline-variant/60 shadow-lg z-[60] overflow-hidden rounded-xl">
                  @for (opt of filterOptions; track opt.value; let last = $last) {
                    <button class="filter-option w-full text-left px-4 py-2.5 font-label-md text-label-md flex items-center gap-2.5"
                            [class.active]="opt.value === currentFilter()"
                            [style.border-bottom]="!last ? '1px solid rgba(198,197,212,0.3)' : 'none'"
                            (click)="selectFilter(opt.value)">
                      <span class="w-2 h-2 rounded-full inline-block ring-1 ring-outline-variant shrink-0" [style.background]="opt.dotColor"></span>
                      <span class="flex-1">{{ opt.label }}</span>
                      @if (opt.value === currentFilter()) {
                        <span class="material-symbols-outlined text-sm" style="color:#1a237e">check</span>
                      }
                    </button>
                  }
                </div>
              }
            </div>
          </div>
        </div>

        <!-- ── GRID ────────────────────────────────────────── -->
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
                      @if (mat.duracion) {
                        <span class="font-body-sm text-body-sm text-on-surface-variant">Duración: {{ mat.duracion }}</span>
                      }
                      @if (mat.url) {
                        <button class="bg-primary text-on-primary px-md py-xs rounded-lg flex items-center gap-xs font-label-md text-label-md hover:bg-primary/90 transition-colors disabled:opacity-60"
                                [disabled]="downloadingId() === mat.id"
                                (click)="downloadFile(mat)">
                          <span class="material-symbols-outlined text-[18px]">{{ downloadingId() === mat.id ? 'progress_activity' : 'download' }}</span>
                          {{ downloadingId() === mat.id ? 'Descargando...' : 'Descargar' }}
                        </button>
                      } @else {
                        <span class="font-label-sm text-label-sm text-on-surface-variant">Sin enlace</span>
                      }
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
                  @if (mat.url) {
                    <button class="bg-primary text-on-primary p-xs rounded-full group-hover:scale-110 transition-transform disabled:opacity-60 disabled:scale-100"
                            [disabled]="downloadingId() === mat.id"
                            (click)="downloadFile(mat)">
                      <span class="material-symbols-outlined">{{ downloadingId() === mat.id ? 'progress_activity' : 'download' }}</span>
                    </button>
                  } @else {
                    <span class="material-symbols-outlined text-on-surface-variant text-sm">link_off</span>
                  }
                </div>
              </div>
            }
          } @empty {
            <div class="col-span-full text-center py-xl text-on-surface-variant font-body-md text-body-md">
              @if (data().length === 0 && !loading()) {
                <span class="material-symbols-outlined text-4xl mb-sm block">folder_off</span>
                <p>Aún no hay materiales disponibles.</p>
                <p class="font-label-sm">Los materiales aparecerán cuando el administrador los publique.</p>
              } @else {
                <span class="material-symbols-outlined text-4xl mb-sm block">search_off</span>
                <p>No se encontraron materiales con ese filtro o búsqueda.</p>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .filter-dropdown {
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
    }
    .filter-option {
      transition: all 0.15s ease;
      color: #454652;
    }
    .filter-option:hover {
      background: #f3f3f3;
    }
    .filter-option.active {
      background: rgba(0,6,102,0.08);
      color: #000666;
      font-weight: 600;
    }
  `],
})
export class MaterialesComponent {
  private readonly toast = inject(ToastService);
  private readonly service = inject(MaterialesEstudianteService);

  readonly loading = computed(() => !this.service.loaded());
  private readonly materiales = this.service.materiales;

  searchQuery = signal('');
  currentFilter = signal<FilterType>('all');
  showFilter = false;
  downloadingId = signal<string | null>(null);

  readonly filterOptions = [
    { value: 'all' as FilterType, label: 'Todos', dotColor: '#737373' },
    { value: 'PDF' as FilterType, label: 'PDF', dotColor: '#dc2626' },
    { value: 'DOCX' as FilterType, label: 'Documentos', dotColor: '#1a237e' },
    { value: 'VIDEO' as FilterType, label: 'Videos', dotColor: '#4f46e5' },
  ];

  readonly filterLabel = computed(() => {
    const f = this.currentFilter();
    if (f === 'all') return 'Filtrar';
    if (f === 'PDF') return 'PDF';
    if (f === 'DOCX') return 'Documentos';
    if (f === 'VIDEO') return 'Videos';
    return 'Filtrar';
  });

  readonly filtered = computed(() => {
    let list = this.materiales();
    const q = this.searchQuery().toLowerCase().trim();

    if (q) {
      list = list.filter(
        (m) => m.titulo.toLowerCase().includes(q) || m.curso.toLowerCase().includes(q),
      );
    }

    if (this.currentFilter() !== 'all') {
      if (this.currentFilter() === 'VIDEO') {
        list = list.filter((m) => m.tipo === 'MP4');
      } else {
        list = list.filter((m) => m.tipo === this.currentFilter());
      }
    }

    return list;
  });

  /** Expuesto para el template @empty */
  readonly data = this.materiales;

  toggleFilter(): void {
    this.showFilter = !this.showFilter;
  }

  selectFilter(value: FilterType): void {
    this.currentFilter.set(value);
    this.showFilter = false;
  }

  applyFilters(): void {
    // manejado por signals
  }

  async downloadFile(mat: MaterialEstudiante): Promise<void> {
    if (!mat.url || !mat.id) return;
    this.downloadingId.set(mat.id);
    try {
      const res = await fetch(mat.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = mat.titulo;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn('Fetch falló, abriendo en nueva pestaña:', e);
      window.open(mat.url, '_blank', 'noopener');
    } finally {
      this.downloadingId.set(null);
    }
  }
}
