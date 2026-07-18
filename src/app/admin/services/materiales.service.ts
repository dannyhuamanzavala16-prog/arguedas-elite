import { Injectable, signal } from '@angular/core';
import { Material } from '../../shared/models/material.model';

const MOCK: Material[] = [
  { id: '1', nombre: 'Guía de Álgebra Avanzada.pdf', curso: 'Álgebra', tipo: 'PDF', tamano: '2.4 MB', icono: 'picture_as_pdf', colorClase: 'bg-error-container text-on-error-container', fecha: '2025-06-15' },
  { id: '2', nombre: 'Separata de Trigonometría.docx', curso: 'Trigonometría', tipo: 'DOCX', tamano: '1.8 MB', icono: 'description', colorClase: 'bg-primary-container/10 text-primary', fecha: '2025-06-14' },
  { id: '3', nombre: 'Diapositivas de Química Orgánica.pptx', curso: 'Química', tipo: 'PPTX', tamano: '5.2 MB', icono: 'present_to_all', colorClase: 'bg-tertiary-container/20 text-tertiary', fecha: '2025-06-13' },
  { id: '4', nombre: 'Compendio de Biología.zip', curso: 'Biología', tipo: 'ZIP', tamano: '12.0 MB', icono: 'folder_zip', colorClase: 'bg-secondary-container text-secondary', fecha: '2025-06-12' },
  { id: '5', nombre: 'Clase grabada: Cinemática.mp4', curso: 'Física', tipo: 'MP4', tamano: '45.3 MB', icono: 'movie', colorClase: 'bg-on-tertiary-fixed-variant/10 text-tertiary-fixed-dim', fecha: '2025-06-11' },
  { id: '6', nombre: 'Ejercicios de Razonamiento.pdf', curso: 'Razonamiento Matemático', tipo: 'PDF', tamano: '1.2 MB', icono: 'picture_as_pdf', colorClase: 'bg-error-container text-on-error-container', fecha: '2025-06-10' },
  { id: '7', nombre: 'Resumen de Literatura.docx', curso: 'Literatura', tipo: 'DOCX', tamano: '0.8 MB', icono: 'description', colorClase: 'bg-primary-container/10 text-primary', fecha: '2025-06-09' },
  { id: '8', nombre: 'Práctica de Geometría.pdf', curso: 'Geometría', tipo: 'PDF', tamano: '3.1 MB', icono: 'picture_as_pdf', colorClase: 'bg-error-container text-on-error-container', fecha: '2025-06-08' },
];

const ICON_MAP: Record<string, string> = { PDF: 'picture_as_pdf', DOCX: 'description', PPTX: 'present_to_all', ZIP: 'folder_zip', MP4: 'movie' };
const COLOR_MAP: Record<string, string> = {
  PDF: 'bg-error-container text-on-error-container',
  DOCX: 'bg-primary-container/10 text-primary',
  PPTX: 'bg-tertiary-container/20 text-tertiary',
  ZIP: 'bg-secondary-container text-secondary',
  MP4: 'bg-on-tertiary-fixed-variant/10 text-tertiary-fixed-dim',
};

@Injectable({ providedIn: 'root' })
export class MaterialesService {
  private readonly data = signal<Material[]>([...MOCK]);
  readonly materiales = this.data.asReadonly();
  private nextId = 100;

  private detectarTipo(nombre: string): string {
    const ext = nombre.split('.').pop()?.toUpperCase() || '';
    return ext || 'PDF';
  }

  private getIcono(tipo: string): string {
    return ICON_MAP[tipo] || 'description';
  }

  private getColor(tipo: string): string {
    return COLOR_MAP[tipo] || 'bg-primary-container/10 text-primary';
  }

  private randomSize(): string {
    return (Math.random() * 49 + 0.5).toFixed(1) + ' MB';
  }

  crear(nombre: string, curso: string): void {
    const tipo = this.detectarTipo(nombre);
    const material: Material = {
      id: String(this.nextId++),
      nombre,
      curso,
      tipo,
      tamano: this.randomSize(),
      icono: this.getIcono(tipo),
      colorClase: this.getColor(tipo),
      fecha: new Date().toISOString().split('T')[0],
    };
    this.data.update((list) => [material, ...list]);
  }

  eliminar(id: string): void {
    this.data.update((list) => list.filter((m) => m.id !== id));
  }

  getCursos(): string[] {
    return [...new Set(this.data().map((m) => m.curso))];
  }

  getTipos(): string[] {
    return [...new Set(this.data().map((m) => m.tipo))];
  }
}
