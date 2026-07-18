import { Injectable, inject, signal } from '@angular/core';
import { MockDataService, MATERIALES_DOCENTE_CATEGORIAS, ICON_MAP, COLOR_MAP_DOCENTE } from '../../shared/services/mock-data.service';

export interface MaterialDocente {
  id: string;
  nombre: string;
  tipo: 'PDF' | 'DOCX' | 'ZIP' | 'MP4';
  categoria: string;
  fecha: Date;
  icono: string;
  colorClase: string;
}

function parseFileType(nombre: string): MaterialDocente['tipo'] {
  const ext = nombre.split('.').pop()?.toUpperCase() || '';
  if (ext === 'PDF') return 'PDF';
  if (ext === 'DOCX' || ext === 'DOC') return 'DOCX';
  if (ext === 'ZIP' || ext === 'RAR') return 'ZIP';
  if (ext === 'MP4' || ext === 'MOV' || ext === 'AVI') return 'MP4';
  return 'PDF';
}

@Injectable({ providedIn: 'root' })
export class MaterialesDocenteService {
  private readonly mockData = inject(MockDataService);
  private readonly nextId = signal(100);

  private readonly _materiales = signal<MaterialDocente[]>(this.mockData.materialesDocente);
  readonly materiales = this._materiales.asReadonly();

  readonly categorias = signal<string[]>([...MATERIALES_DOCENTE_CATEGORIAS]);

  private generarId(): string {
    const id = this.nextId();
    this.nextId.set(id + 1);
    return String(id);
  }

  crear(nombre: string, categoria: string): MaterialDocente {
    const tipo = parseFileType(nombre);
    const material: MaterialDocente = {
      id: this.generarId(),
      nombre,
      tipo,
      categoria: categoria.toUpperCase(),
      fecha: new Date(),
      icono: ICON_MAP[tipo] || 'description',
      colorClase: COLOR_MAP_DOCENTE[tipo] || 'bg-primary/10 text-primary',
    };
    this._materiales.update((list) => [material, ...list]);
    return material;
  }

  actualizar(id: string, nombre: string, categoria: string): void {
    const tipo = parseFileType(nombre);
    this._materiales.update((list) =>
      list.map((m) =>
        m.id === id
          ? { ...m, nombre, categoria: categoria.toUpperCase(), tipo, icono: ICON_MAP[tipo] || 'description', colorClase: COLOR_MAP_DOCENTE[tipo] || 'bg-primary/10 text-primary' }
          : m
      )
    );
  }

  eliminar(id: string): void {
    this._materiales.update((list) => list.filter((m) => m.id !== id));
  }

  getById(id: string): MaterialDocente | undefined {
    return this._materiales().find((m) => m.id === id);
  }
}
