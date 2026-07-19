import { Injectable } from '@angular/core';
import { Estudiante } from '../models/estudiante.model';
import { Docente } from '../models/docente.model';
import { Material } from '../models/material.model';
import { Usuario } from '../models/usuario.model';

// ─── Interfaces específicas del dominio ───

export interface EstudianteAsistencia {
  id: string;
  nombre: string;
  presente: boolean;
  nota: string;
}

export interface MaterialDocente {
  id: string;
  nombre: string;
  tipo: 'PDF' | 'DOCX' | 'ZIP' | 'MP4';
  categoria: string;
  fecha: Date;
  icono: string;
  colorClase: string;
}

export interface HistorialAsistencia {
  fecha: string;
  curso: string;
  estado: 'Presente' | 'Ausente' | 'Tardanza';
}

// ─── ICONOS Y COLORES ───

export const ICON_MAP: Record<string, string> = {
  PDF: 'picture_as_pdf',
  DOCX: 'description',
  PPTX: 'present_to_all',
  ZIP: 'folder_zip',
  MP4: 'movie',
};

export const COLOR_MAP: Record<string, string> = {
  PDF: 'bg-error-container text-on-error-container',
  DOCX: 'bg-primary-container/10 text-primary',
  PPTX: 'bg-tertiary-container/20 text-tertiary',
  ZIP: 'bg-secondary-container text-secondary',
  MP4: 'bg-on-tertiary-fixed-variant/10 text-tertiary-fixed-dim',
};

export const COLOR_MAP_DOCENTE: Record<string, string> = {
  PDF: 'bg-error/10 text-error',
  DOCX: 'bg-primary/10 text-primary',
  ZIP: 'bg-tertiary/10 text-tertiary',
  MP4: 'bg-secondary-container/20 text-secondary',
};

// ─── USUARIOS (login) ───

export const USUARIOS: Usuario[] = [
  { username: 'admin', role: 'admin', nombre: 'Administrador', email: 'admin@arguedas.edu.pe' },
  { username: 'docente', role: 'docente', nombre: 'Ana Rojas', email: 'ana.rojas@arguedas.edu.pe' },
  { username: 'estudiante', role: 'estudiante', nombre: 'Juan Pérez', email: 'juan.perez@arguedas.edu.pe' },
];

// ─── ADMIN: ESTUDIANTES ───

export const ESTUDIANTES_MOCK: Estudiante[] = [
  { codigo: '#EA-2025-249', nombre: 'Juan Pérez', email: 'juan.perez@arguedas.edu.pe', salon: 'Aula 101 - A', carrera: 'Ingeniería de Sistemas', estado: 'Activo' },
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

// ─── ADMIN: DOCENTES ───

export const DOCENTES_MOCK: Docente[] = [
  { codigo: '#DOC-2025-001', nombre: 'Ana Rojas', email: 'ana.rojas@elite.edu', especialidad: 'Matemáticas', cursos: ['Álgebra', 'Trigonometría'], estado: 'Activo' },
  { codigo: '#DOC-2025-002', nombre: 'Carlos López', email: 'carlos.lopez@elite.edu', especialidad: 'Física', cursos: ['Física General', 'Física Avanzada'], estado: 'Activo' },
  { codigo: '#DOC-2025-003', nombre: 'María García', email: 'maria.garcia@elite.edu', especialidad: 'Lenguaje', cursos: ['Lenguaje I', 'Literatura'], estado: 'Activo' },
  { codigo: '#DOC-2025-004', nombre: 'José Martínez', email: 'jose.martinez@elite.edu', especialidad: 'Historia', cursos: ['Historia Universal', 'Historia del Perú'], estado: 'Pendiente' },
  { codigo: '#DOC-2025-005', nombre: 'Rosa Huamán', email: 'rosa.h@elite.edu', especialidad: 'Biología', cursos: ['Biología General', 'Anatomía'], estado: 'Activo' },
  { codigo: '#DOC-2025-006', nombre: 'Pedro Sánchez', email: 'pedro.sanchez@elite.edu', especialidad: 'Química', cursos: ['Química General', 'Química Orgánica'], estado: 'Activo' },
];

// ─── ADMIN: MATERIALES ───

export const MATERIALES_MOCK: Material[] = [
  { id: '1', nombre: 'Guía de Álgebra Avanzada.pdf', curso: 'Álgebra', tipo: 'PDF', tamano: '2.4 MB', icono: 'picture_as_pdf', colorClase: 'bg-error-container text-on-error-container', fecha: '2025-06-15' },
  { id: '2', nombre: 'Separata de Trigonometría.docx', curso: 'Trigonometría', tipo: 'DOCX', tamano: '1.8 MB', icono: 'description', colorClase: 'bg-primary-container/10 text-primary', fecha: '2025-06-14' },
  { id: '3', nombre: 'Diapositivas de Química Orgánica.pptx', curso: 'Química', tipo: 'PPTX', tamano: '5.2 MB', icono: 'present_to_all', colorClase: 'bg-tertiary-container/20 text-tertiary', fecha: '2025-06-13' },
  { id: '4', nombre: 'Compendio de Biología.zip', curso: 'Biología', tipo: 'ZIP', tamano: '12.0 MB', icono: 'folder_zip', colorClase: 'bg-secondary-container text-secondary', fecha: '2025-06-12' },
  { id: '5', nombre: 'Clase grabada: Cinemática.mp4', curso: 'Física', tipo: 'MP4', tamano: '45.3 MB', icono: 'movie', colorClase: 'bg-on-tertiary-fixed-variant/10 text-tertiary-fixed-dim', fecha: '2025-06-11' },
  { id: '6', nombre: 'Ejercicios de Razonamiento.pdf', curso: 'Razonamiento Matemático', tipo: 'PDF', tamano: '1.2 MB', icono: 'picture_as_pdf', colorClase: 'bg-error-container text-on-error-container', fecha: '2025-06-10' },
  { id: '7', nombre: 'Resumen de Literatura.docx', curso: 'Literatura', tipo: 'DOCX', tamano: '0.8 MB', icono: 'description', colorClase: 'bg-primary-container/10 text-primary', fecha: '2025-06-09' },
  { id: '8', nombre: 'Práctica de Geometría.pdf', curso: 'Geometría', tipo: 'PDF', tamano: '3.1 MB', icono: 'picture_as_pdf', colorClase: 'bg-error-container text-on-error-container', fecha: '2025-06-08' },
];

// ─── DOCENTE: ASISTENCIA ───

export const ASISTENCIA_ESTUDIANTES: EstudianteAsistencia[] = [
  { id: 'MAT-001', nombre: 'Alfonso Herrera Ruiz', presente: false, nota: '' },
  { id: 'MAT-002', nombre: 'Beatriz Mendoza Vega', presente: false, nota: '' },
  { id: 'MAT-003', nombre: 'Carlos Santillán Diaz', presente: false, nota: '' },
  { id: 'MAT-004', nombre: 'Diana Lujan Quispe', presente: false, nota: '' },
  { id: 'MAT-005', nombre: 'Eduardo Ortiz Mora', presente: false, nota: '' },
  { id: 'MAT-006', nombre: 'Flavia Torres Benites', presente: false, nota: '' },
  { id: 'MAT-007', nombre: 'Gabriel Rojas Castro', presente: false, nota: '' },
  { id: 'MAT-008', nombre: 'Helena Vargas Silva', presente: false, nota: '' },
];

export const ASISTENCIA_CURSOS = ['Cálculo Diferencial e Integral', 'Álgebra Lineal', 'Física Mecánica', 'Química General'];
export const ASISTENCIA_GRUPOS = ['Grupo A', 'Grupo B'];

// ─── DOCENTE: MATERIALES ───

export const MATERIALES_DOCENTE_MOCK: MaterialDocente[] = [
  { id: '1', nombre: 'Guía_Laboratorio_01_Termodinámica.pdf', tipo: 'PDF', categoria: 'LECTURA', fecha: new Date(2023, 9, 12), icono: 'picture_as_pdf', colorClase: 'bg-error/10 text-error' },
  { id: '2', nombre: 'Silabo_Calculo_Diferencial_2024.docx', tipo: 'DOCX', categoria: 'SILABO', fecha: new Date(2023, 9, 10), icono: 'description', colorClase: 'bg-primary/10 text-primary' },
  { id: '3', nombre: 'Dataset_Practica_Estadistica.zip', tipo: 'ZIP', categoria: 'DATA', fecha: new Date(2023, 9, 8), icono: 'folder_zip', colorClase: 'bg-tertiary/10 text-tertiary' },
  { id: '4', nombre: 'Semana_04_Ejercicios_Resueltos.pdf', tipo: 'PDF', categoria: 'EJERCICIOS', fecha: new Date(2023, 9, 5), icono: 'picture_as_pdf', colorClase: 'bg-error/10 text-error' },
  { id: '5', nombre: 'Rúbrica_Evaluación_Ensayo.docx', tipo: 'DOCX', categoria: 'EVALUACIÓN', fecha: new Date(2023, 9, 1), icono: 'description', colorClase: 'bg-primary/10 text-primary' },
  { id: '6', nombre: 'Teoría_Integral_Definida.pdf', tipo: 'PDF', categoria: 'TEORÍA', fecha: new Date(2023, 8, 28), icono: 'picture_as_pdf', colorClase: 'bg-error/10 text-error' },
];

export const MATERIALES_DOCENTE_CATEGORIAS = ['TEORÍA', 'LECTURA', 'PRÁCTICA', 'EVALUACIÓN', 'SILABO', 'DATA', 'EJERCICIOS'];

// ─── ESTUDIANTE: HISTORIAL ASISTENCIA ───

export const HISTORIAL_ASISTENCIA: HistorialAsistencia[] = [
  { fecha: '12 Oct, 2023', curso: 'Razonamiento Matemático I', estado: 'Presente' },
  { fecha: '11 Oct, 2023', curso: 'Física Avanzada', estado: 'Presente' },
  { fecha: '10 Oct, 2023', curso: 'Literatura Universal', estado: 'Ausente' },
  { fecha: '09 Oct, 2023', curso: 'Química Orgánica', estado: 'Presente' },
  { fecha: '06 Oct, 2023', curso: 'Aritmética Pre-U', estado: 'Tardanza' },
  { fecha: '05 Oct, 2023', curso: 'Historia del Perú', estado: 'Presente' },
  { fecha: '04 Oct, 2023', curso: 'Geografía Mundial', estado: 'Presente' },
  { fecha: '03 Oct, 2023', curso: 'Razonamiento Verbal', estado: 'Ausente' },
  { fecha: '02 Oct, 2023', curso: 'Trigonometría', estado: 'Tardanza' },
  { fecha: '01 Oct, 2023', curso: 'Álgebra Lineal', estado: 'Presente' },
];

// ─── HELPERS ───

export function detectarTipoArchivo(nombre: string): string {
  const ext = nombre.split('.').pop()?.toUpperCase() || '';
  return ext || 'PDF';
}

export function parseFileType(nombre: string): MaterialDocente['tipo'] {
  const ext = nombre.split('.').pop()?.toUpperCase() || '';
  if (ext === 'PDF') return 'PDF';
  if (ext === 'DOCX' || ext === 'DOC') return 'DOCX';
  if (ext === 'ZIP' || ext === 'RAR') return 'ZIP';
  if (ext === 'MP4' || ext === 'MOV' || ext === 'AVI') return 'MP4';
  return 'PDF';
}

export function randomSize(): string {
  return (Math.random() * 49 + 0.5).toFixed(1) + ' MB';
}

// ─── SERVICIO INYECTABLE ───

@Injectable({ providedIn: 'root' })
export class MockDataService {
  get usuarios() { return [...USUARIOS]; }
  get estudiantes() { return ESTUDIANTES_MOCK.map((e) => ({ ...e })); }
  get docentes() { return DOCENTES_MOCK.map((d) => ({ ...d })); }
  get materiales() { return MATERIALES_MOCK.map((m) => ({ ...m })); }
  get asistenciaEstudiantes() { return ASISTENCIA_ESTUDIANTES.map((e) => ({ ...e })); }
  get materialesDocente() { return MATERIALES_DOCENTE_MOCK.map((m) => ({ ...m, fecha: new Date(m.fecha) })); }
  get historialAsistencia() { return [...HISTORIAL_ASISTENCIA]; }

  get cursosAsistencia() { return [...ASISTENCIA_CURSOS]; }
  get gruposAsistencia() { return [...ASISTENCIA_GRUPOS]; }
  get categoriasDocente() { return [...MATERIALES_DOCENTE_CATEGORIAS]; }
}
