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
    const list = this.estudiantes();
    let nextNum = 1;
    if (list.length > 0) {
      const numbers = list
        .map((e) => {
          const parts = e.codigo.split('-');
          const last = parts[parts.length - 1];
          return parseInt(last, 10);
        })
        .filter((num) => !isNaN(num));
      if (numbers.length > 0) {
        nextNum = Math.max(...numbers) + 1;
      }
    }
    const padded = String(nextNum).padStart(3, '0');
    const codigo = `#EA-2025-${padded}`;
    const docId = `EA-2025-${padded}`;
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
