import { Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { doc, setDoc } from '@angular/fire/firestore';
import { Estudiante } from '../../shared/models/estudiante.model';
import { FirestoreCollectionService } from '../../shared/services/firestore.service';

@Injectable({ providedIn: 'root' })
export class EstudiantesService extends FirestoreCollectionService<Estudiante> {
  /** Lista reactiva — se actualiza automáticamente cuando Firestore cambia */
  readonly estudiantes = toSignal(this.getAll(), { initialValue: [] as Estudiante[] });

  constructor() {
    super('estudiantes');
  }

  /** Usa `codigo` sin `#` como doc ID para poder actualizar/eliminar por código */
  async crear(est: Omit<Estudiante, 'codigo' | 'createdAt'>): Promise<void> {
    const suffix = Date.now().toString().slice(-6);
    const codigo = `#EA-2025-${suffix}`;
    const docId = `EA-2025-${suffix}`;
    await setDoc(doc(this.firestore, 'estudiantes', docId), {
      ...est,
      codigo,
      createdAt: new Date().toISOString(),
    });
  }

  async actualizar(codigo: string, cambios: Partial<Estudiante>): Promise<void> {
    await this.update(codigo.replace('#', ''), cambios);
  }

  async eliminar(codigo: string): Promise<void> {
    await this.delete(codigo.replace('#', ''));
  }

  getByCodigo(codigo: string): Estudiante | undefined {
    return this.estudiantes().find((e) => e.codigo === codigo);
  }

  getCarreras(): string[] {
    return [...new Set(this.estudiantes().map((e) => e.carrera))];
  }
}
