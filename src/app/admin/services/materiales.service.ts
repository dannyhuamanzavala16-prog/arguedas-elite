import { Injectable, inject, signal } from '@angular/core';
import { Material } from '../../shared/models/material.model';
import { MockDataService, ICON_MAP, COLOR_MAP, detectarTipoArchivo, randomSize } from '../../shared/services/mock-data.service';

@Injectable({ providedIn: 'root' })
export class MaterialesService {
  private readonly mockData = inject(MockDataService);
  private readonly data = signal<Material[]>(this.mockData.materiales);
  readonly materiales = this.data.asReadonly();
  private nextId = 100;

  crear(nombre: string, curso: string): void {
    const tipo = detectarTipoArchivo(nombre);
    const material: Material = {
      id: String(this.nextId++),
      nombre,
      curso,
      tipo,
      tamano: randomSize(),
      icono: ICON_MAP[tipo] || 'description',
      colorClase: COLOR_MAP[tipo] || 'bg-primary-container/10 text-primary',
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
