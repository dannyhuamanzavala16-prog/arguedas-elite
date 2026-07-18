import { Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { doc, setDoc } from '@angular/fire/firestore';
import { Docente } from '../../shared/models/docente.model';
import { FirestoreCollectionService } from '../../shared/services/firestore.service';

@Injectable({ providedIn: 'root' })
export class DocentesService extends FirestoreCollectionService<Docente> {
  readonly docentes = toSignal(this.getAll(), { initialValue: [] as Docente[] });

  constructor() {
    super('docentes');
  }

  async crear(data: Omit<Docente, 'codigo' | 'createdAt'>): Promise<void> {
    const list = this.docentes();
    let nextNum = 1;
    if (list.length > 0) {
      const numbers = list
        .map((d) => {
          const parts = d.codigo.split('-');
          const last = parts[parts.length - 1];
          return parseInt(last, 10);
        })
        .filter((num) => !isNaN(num));
      if (numbers.length > 0) {
        nextNum = Math.max(...numbers) + 1;
      }
    }
    const padded = String(nextNum).padStart(3, '0');
    const codigo = `#DOC-2025-${padded}`;
    const docId = `DOC-2025-${padded}`;
    await setDoc(doc(this.firestore, 'docentes', docId), {
      ...data,
      codigo,
      createdAt: new Date().toISOString(),
    });
  }

  async actualizar(codigo: string, cambios: Partial<Docente>): Promise<void> {
    await this.update(codigo.replace('#', ''), cambios);
  }

  async eliminar(codigo: string): Promise<void> {
    await this.delete(codigo.replace('#', ''));
  }

  getEspecialidades(): string[] {
    return [...new Set(this.docentes().map((d) => d.especialidad))];
  }
}
