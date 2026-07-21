export interface Estudiante {
  id?: string;
  createdAt?: string;
  codigo: string;
  nombre: string;
  email: string;
  salon: string;
  carrera: string;
  estado: 'Activo' | 'Pendiente';
  telefono?: string;
  telefonoApoderado?: string;
}
