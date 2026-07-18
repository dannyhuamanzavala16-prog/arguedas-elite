import { Injectable, signal } from '@angular/core';
import { Estudiante } from '../../shared/models/estudiante.model';

const MOCK: Estudiante[] = [
  { codigo: '#EA-2024-001', nombre: 'Alejandra Mendoza', email: 'alejandra.m@elite.edu', salon: 'Aula 402 - B', carrera: 'Medicina Humana', estado: 'Activo' },
  { codigo: '#EA-2024-042', nombre: 'Ricardo Casas', email: 'ricardo.c@elite.edu', salon: 'Aula 105 - A', carrera: 'Ingeniería de Sistemas', estado: 'Activo' },
  { codigo: '#EA-2024-115', nombre: 'Lucía Paredes', email: 'lucia.p@elite.edu', salon: 'Aula 202 - C', carrera: 'Arquitectura', estado: 'Pendiente' },
  { codigo: '#EA-2024-089', nombre: 'Samuel Valdivia', email: 'samuel.v@elite.edu', salon: 'Aula 402 - B', carrera: 'Derecho', estado: 'Activo' },
  { codigo: '#EA-2024-032', nombre: 'Camila Gutiérrez', email: 'camila.g@elite.edu', salon: 'Aula 301 - A', carrera: 'Psicología', estado: 'Activo' },
  { codigo: '#EA-2024-078', nombre: 'Diego Torres', email: 'diego.t@elite.edu', salon: 'Aula 201 - B', carrera: 'Ingeniería Civil', estado: 'Activo' },
  { codigo: '#EA-2024-156', nombre: 'Fernanda Vargas', email: 'fernanda.v@elite.edu', salon: 'Aula 305 - C', carrera: 'Administración', estado: 'Activo' },
  { codigo: '#EA-2024-201', nombre: 'Gabriela Huamán', email: 'gabriela.h@elite.edu', salon: 'Aula 101 - A', carrera: 'Medicina Humana', estado: 'Pendiente' },
  { codigo: '#EA-2024-067', nombre: 'Javier Mendoza', email: 'javier.m@elite.edu', salon: 'Aula 402 - A', carrera: 'Derecho', estado: 'Activo' },
  { codigo: '#EA-2024-188', nombre: 'Karina León', email: 'karina.l@elite.edu', salon: 'Aula 203 - C', carrera: 'Arquitectura', estado: 'Activo' },
  { codigo: '#EA-2024-223', nombre: 'Miguel Ríos', email: 'miguel.r@elite.edu', salon: 'Aula 106 - B', carrera: 'Ingeniería de Sistemas', estado: 'Activo' },
  { codigo: '#EA-2024-145', nombre: 'Nicole Pizarro', email: 'nicole.p@elite.edu', salon: 'Aula 304 - A', carrera: 'Psicología', estado: 'Pendiente' },
  { codigo: '#EA-2024-091', nombre: 'Óscar Sánchez', email: 'oscar.s@elite.edu', salon: 'Aula 401 - A', carrera: 'Administración', estado: 'Activo' },
  { codigo: '#EA-2024-177', nombre: 'Paola Tapia', email: 'paola.t@elite.edu', salon: 'Aula 202 - B', carrera: 'Medicina Humana', estado: 'Activo' },
  { codigo: '#EA-2024-210', nombre: 'Raúl Morales', email: 'raul.m@elite.edu', salon: 'Aula 103 - C', carrera: 'Ingeniería Civil', estado: 'Pendiente' },
  { codigo: '#EA-2024-054', nombre: 'Sofía Castro', email: 'sofia.c@elite.edu', salon: 'Aula 302 - A', carrera: 'Arquitectura', estado: 'Activo' },
  { codigo: '#EA-2024-239', nombre: 'Thiago Rodríguez', email: 'thiago.r@elite.edu', salon: 'Aula 405 - B', carrera: 'Derecho', estado: 'Activo' },
  { codigo: '#EA-2024-133', nombre: 'Valeria Ávila', email: 'valeria.a@elite.edu', salon: 'Aula 204 - A', carrera: 'Psicología', estado: 'Activo' },
  { codigo: '#EA-2024-198', nombre: 'Bruno Campos', email: 'bruno.c@elite.edu', salon: 'Aula 306 - B', carrera: 'Ingeniería de Sistemas', estado: 'Pendiente' },
  { codigo: '#EA-2024-248', nombre: 'Daniela Mendoza', email: 'daniela.m@elite.edu', salon: 'Aula 303 - A', carrera: 'Medicina Humana', estado: 'Activo' },
];

@Injectable({ providedIn: 'root' })
export class EstudiantesService {
  private readonly data = signal<Estudiante[]>([...MOCK]);
  readonly estudiantes = this.data.asReadonly();
  private nextNum = 300;

  private getNextCodigo(): string {
    this.nextNum++;
    return `#EA-2025-${this.nextNum}`;
  }

  crear(est: Omit<Estudiante, 'codigo'>): void {
    this.data.update((list) => [...list, { ...est, codigo: this.getNextCodigo() }]);
  }

  actualizar(codigo: string, cambios: Partial<Estudiante>): void {
    this.data.update((list) =>
      list.map((e) => (e.codigo === codigo ? { ...e, ...cambios } : e))
    );
  }

  eliminar(codigo: string): void {
    this.data.update((list) => list.filter((e) => e.codigo !== codigo));
  }

  getByCodigo(codigo: string): Estudiante | undefined {
    return this.data().find((e) => e.codigo === codigo);
  }

  getCarreras(): string[] {
    return [...new Set(this.data().map((e) => e.carrera))];
  }
}
