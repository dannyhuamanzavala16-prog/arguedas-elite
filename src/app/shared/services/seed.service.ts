import { Injectable, inject } from '@angular/core';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import {
  ESTUDIANTES_MOCK,
  DOCENTES_MOCK,
  MATERIALES_MOCK,
} from './mock-data.service';

export interface SeedResult {
  estudiantes: number;
  docentes: number;
  materiales: number;
}

@Injectable({ providedIn: 'root' })
export class SeedService {
  private readonly firestore = inject(Firestore);

  /**
   * Pobla Firestore con los datos mock de estudiantes, docentes y materiales.
   * Usa los mismos códigos/IDs que usan los servicios de CRUD.
   * No limpia datos existentes — hace upsert (si el documento ya existe, lo pisa).
   */
  async seedAll(): Promise<SeedResult> {
    const now = new Date().toISOString();

    const estudianteWrites = ESTUDIANTES_MOCK.map((e) => {
      const docId = e.codigo.replace('#', '');
      const ref = doc(this.firestore, 'estudiantes', docId);
      return setDoc(ref, {
        nombre: e.nombre,
        email: e.email,
        salon: e.salon,
        carrera: e.carrera,
        estado: e.estado,
        codigo: e.codigo,
        createdAt: now,
      });
    });

    const docenteWrites = DOCENTES_MOCK.map((d) => {
      const docId = d.codigo.replace('#', '');
      const ref = doc(this.firestore, 'docentes', docId);
      return setDoc(ref, {
        nombre: d.nombre,
        email: d.email,
        especialidad: d.especialidad,
        cursos: d.cursos,
        estado: d.estado,
        codigo: d.codigo,
        createdAt: now,
      });
    });

    const materialWrites = MATERIALES_MOCK.map((m) => {
      const ref = doc(this.firestore, 'materiales', m.id!);
      return setDoc(ref, {
        nombre: m.nombre,
        curso: m.curso,
        tipo: m.tipo,
        tamano: m.tamano,
        icono: m.icono,
        colorClase: m.colorClase,
        fecha: m.fecha,
        createdAt: now,
      });
    });

    await Promise.all([...estudianteWrites, ...docenteWrites, ...materialWrites]);

    return {
      estudiantes: ESTUDIANTES_MOCK.length,
      docentes: DOCENTES_MOCK.length,
      materiales: MATERIALES_MOCK.length,
    };
  }

  async seedEstudiantes(): Promise<number> {
    const now = new Date().toISOString();
    const writes = ESTUDIANTES_MOCK.map((e) => {
      const docId = e.codigo.replace('#', '');
      const ref = doc(this.firestore, 'estudiantes', docId);
      return setDoc(ref, {
        nombre: e.nombre,
        email: e.email,
        salon: e.salon,
        carrera: e.carrera,
        estado: e.estado,
        codigo: e.codigo,
        createdAt: now,
      });
    });
    await Promise.all(writes);
    return writes.length;
  }

  async seedDocentes(): Promise<number> {
    const now = new Date().toISOString();
    const writes = DOCENTES_MOCK.map((d) => {
      const docId = d.codigo.replace('#', '');
      const ref = doc(this.firestore, 'docentes', docId);
      return setDoc(ref, {
        nombre: d.nombre,
        email: d.email,
        especialidad: d.especialidad,
        cursos: d.cursos,
        estado: d.estado,
        codigo: d.codigo,
        createdAt: now,
      });
    });
    await Promise.all(writes);
    return writes.length;
  }

  async seedMateriales(): Promise<number> {
    const now = new Date().toISOString();
    const writes = MATERIALES_MOCK.map((m) => {
      const ref = doc(this.firestore, 'materiales', m.id!);
      return setDoc(ref, {
        nombre: m.nombre,
        curso: m.curso,
        tipo: m.tipo,
        tamano: m.tamano,
        icono: m.icono,
        colorClase: m.colorClase,
        fecha: m.fecha,
        createdAt: now,
      });
    });
    await Promise.all(writes);
    return writes.length;
  }
}
