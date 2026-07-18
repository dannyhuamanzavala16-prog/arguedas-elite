import { Injectable, signal } from '@angular/core';

export interface MaterialDocente {
  id: string;
  nombre: string;
  tipo: 'PDF' | 'DOCX' | 'ZIP' | 'MP4';
  categoria: string;
  fecha: Date;
  icono: string;
  colorClase: string;
}

const ICON_MAP: Record<string, string> = {
  PDF: 'picture_as_pdf',
  DOCX: 'description',
  ZIP: 'folder_zip',
  MP4: 'movie',
};

const COLOR_MAP: Record<string, string> = {
  PDF: 'bg-error/10 text-error',
  DOCX: 'bg-primary/10 text-primary',
  ZIP: 'bg-tertiary/10 text-tertiary',
  MP4: 'bg-secondary-container/20 text-secondary',
};

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
  private readonly nextId = signal(100);

  private readonly _materiales = signal<MaterialDocente[]>([
    {
      id: '1', nombre: 'Guía_Laboratorio_01_Termodinámica.pdf',
      tipo: 'PDF', categoria: 'LECTURA', fecha: new Date(2023, 9, 12),
      icono: 'picture_as_pdf', colorClase: 'bg-error/10 text-error',
    },
    {
      id: '2', nombre: 'Silabo_Calculo_Diferencial_2024.docx',
      tipo: 'DOCX', categoria: 'SILABO', fecha: new Date(2023, 9, 10),
      icono: 'description', colorClase: 'bg-primary/10 text-primary',
    },
    {
      id: '3', nombre: 'Dataset_Practica_Estadistica.zip',
      tipo: 'ZIP', categoria: 'DATA', fecha: new Date(2023, 9, 8),
      icono: 'folder_zip', colorClase: 'bg-tertiary/10 text-tertiary',
    },
    {
      id: '4', nombre: 'Semana_04_Ejercicios_Resueltos.pdf',
      tipo: 'PDF', categoria: 'EJERCICIOS', fecha: new Date(2023, 9, 5),
      icono: 'picture_as_pdf', colorClase: 'bg-error/10 text-error',
    },
    {
      id: '5', nombre: 'Rúbrica_Evaluación_Ensayo.docx',
      tipo: 'DOCX', categoria: 'EVALUACIÓN', fecha: new Date(2023, 9, 1),
      icono: 'description', colorClase: 'bg-primary/10 text-primary',
    },
    {
      id: '6', nombre: 'Teoría_Integral_Definida.pdf',
      tipo: 'PDF', categoria: 'TEORÍA', fecha: new Date(2023, 8, 28),
      icono: 'picture_as_pdf', colorClase: 'bg-error/10 text-error',
    },
  ]);
  readonly materiales = this._materiales.asReadonly();

  readonly categorias = signal(['TEORÍA', 'LECTURA', 'PRÁCTICA', 'EVALUACIÓN', 'SILABO', 'DATA', 'EJERCICIOS']);

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
      colorClase: COLOR_MAP[tipo] || 'bg-primary/10 text-primary',
    };
    this._materiales.update((list) => [material, ...list]);
    return material;
  }

  actualizar(id: string, nombre: string, categoria: string): void {
    const tipo = parseFileType(nombre);
    this._materiales.update((list) =>
      list.map((m) =>
        m.id === id
          ? { ...m, nombre, categoria: categoria.toUpperCase(), tipo, icono: ICON_MAP[tipo] || 'description', colorClase: COLOR_MAP[tipo] || 'bg-primary/10 text-primary' }
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
