import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  template: `
    <div class="p-md md:p-xl space-y-xl">
      <div>
        <h2 class="text-headline-md font-bold text-on-surface mb-xs">Resumen General</h2>
        <p class="text-body-sm text-on-surface-variant">Bienvenido de nuevo al panel de administración.</p>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <div class="bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-sm">
            <div class="w-10 h-10 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary">
              <span class="material-symbols-outlined">school</span>
            </div>
          </div>
          <h3 class="text-on-surface-variant text-label-md mb-xs">Total Estudiantes</h3>
          <p class="text-headline-sm font-bold text-on-surface">1,284</p>
        </div>

        <div class="bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-sm">
            <div class="w-10 h-10 rounded-lg bg-secondary-container/20 flex items-center justify-center text-secondary">
              <span class="material-symbols-outlined">group</span>
            </div>
          </div>
          <h3 class="text-on-surface-variant text-label-md mb-xs">Total Docentes</h3>
          <p class="text-headline-sm font-bold text-on-surface">86</p>
        </div>

        <div class="bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-sm">
            <div class="w-10 h-10 rounded-lg bg-tertiary-container/20 flex items-center justify-center text-tertiary">
              <span class="material-symbols-outlined">local_library</span>
            </div>
          </div>
          <h3 class="text-on-surface-variant text-label-md mb-xs">Cursos Activos</h3>
          <p class="text-headline-sm font-bold text-on-surface">42</p>
        </div>

        <div class="bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-sm">
            <div class="w-10 h-10 rounded-lg bg-error-container/20 flex items-center justify-center text-error">
              <span class="material-symbols-outlined">description</span>
            </div>
          </div>
          <h3 class="text-on-surface-variant text-label-md mb-xs">Materiales Subidos</h3>
          <p class="text-headline-sm font-bold text-on-surface">215</p>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        <div class="p-md border-b border-outline-variant flex justify-between items-center">
          <h3 class="text-headline-sm">Actividad Reciente</h3>
        </div>
        <div class="divide-y divide-outline-variant max-h-64 overflow-y-auto">
          @for (item of recentActivity; track item.title) {
            <div class="p-md flex items-start gap-md">
              <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                   [class.bg-primary-container/10]="item.color === 'primary'"
                   [class.bg-tertiary-container/10]="item.color === 'tertiary'"
                   [class.bg-secondary-container/10]="item.color === 'secondary'"
                   [class.bg-error-container/20]="item.color === 'error'">
                <span class="material-symbols-outlined" style="font-size: 18px;">{{ item.icon }}</span>
              </div>
              <div>
                <p class="text-body-md text-on-surface" [innerHTML]="item.title"></p>
                <p class="text-label-sm text-on-surface-variant">{{ item.time }}</p>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class AdminDashboardComponent {
  protected readonly recentActivity = [
    {
      icon: 'person_add',
      color: 'primary',
      title: 'Nuevo estudiante matriculado: <span class="font-bold">María Rodríguez</span>',
      time: 'Hace 15 minutos',
    },
    {
      icon: 'upload_file',
      color: 'tertiary',
      title: 'Prof. López subió material: <span class="font-bold">Guía de Álgebra Avanzada</span>',
      time: 'Hace 2 horas',
    },
    {
      icon: 'edit_document',
      color: 'secondary',
      title: 'Examen simulacro actualizado para <span class="font-bold">Letras y Humanidades</span>',
      time: 'Ayer a las 16:45',
    },
    {
      icon: 'assignment_ind',
      color: 'primary',
      title: 'Estudiante <span class="font-bold">Carlos Mendoza</span> solicitó cambio de grupo',
      time: 'Ayer a las 11:20',
    },
    {
      icon: 'calendar_month',
      color: 'tertiary',
      title: 'Nuevo horario publicado para el <span class="font-bold">Ciclo Intensivo Verano</span>',
      time: 'Hace 2 días',
    },
    {
      icon: 'report',
      color: 'error',
      title: 'Reporte de notas pendiente para <span class="font-bold">5° de Secundaria</span>',
      time: 'Hace 3 días',
    },
    {
      icon: 'payments',
      color: 'secondary',
      title: 'Pago registrado: <span class="font-bold">S/ 250.00</span> - Matrícula Adriana Torres',
      time: 'Hace 4 días',
    },
    {
      icon: 'feedback',
      color: 'primary',
      title: 'Encuesta de satisfacción completada por el <span class="font-bold">92% de estudiantes</span>',
      time: 'Hace 5 días',
    },
  ];
}
