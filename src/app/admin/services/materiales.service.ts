import { Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Material } from '../../shared/models/material.model';
import {
  FirestoreCollectionService,
} from '../../shared/services/firestore.service';
import {
  ICON_MAP,
  COLOR_MAP,
  detectarTipoArchivo,
  randomSize,
} from '../../shared/services/mock-data.service';

@Injectable({ providedIn: 'root' })
export class MaterialesService extends FirestoreCollectionService<Material> {
  readonly materiales = toSignal(this.getAll(), { initialValue: [] as Material[] });

  constructor() {
    super('materiales');
  }

  async crear(nombre: string, curso: string): Promise<void> {
    const tipo = detectarTipoArchivo(nombre);
    const material = {
      nombre,
      curso,
      tipo,
      tamano: randomSize(),
      icono: ICON_MAP[tipo] ?? 'description',
      colorClase: COLOR_MAP[tipo] ?? 'bg-primary-container/10 text-primary',
      fecha: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };
    await this.create(material as any);
  }

  async eliminar(id: string): Promise<void> {
    await this.delete(id);
  }

  getCursos(): string[] {
    return [...new Set(this.materiales().map((m) => m.curso))];
  }

  getTipos(): string[] {
    return [...new Set(this.materiales().map((m) => m.tipo))];
  }
}
