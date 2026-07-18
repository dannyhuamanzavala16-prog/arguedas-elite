import { Component } from '@angular/core';

@Component({
  selector: 'app-estudiante-dashboard',
  standalone: true,
  template: `
    <div class="max-w-container-max mx-auto space-y-lg">
      <!-- Welcome Section -->
      <section class="relative overflow-hidden rounded-xl bg-primary-container p-xl text-on-primary shadow-xl">
        <div class="relative z-10 flex flex-col gap-base">
          <h3 class="font-headline-xl text-headline-xl leading-tight">¡Hola de nuevo, Juan!</h3>
        </div>
        <div class="absolute -right-16 -bottom-16 w-64 h-64 bg-tertiary-fixed/20 rounded-full blur-3xl"></div>
      </section>

      <!-- Statistics Grid -->
      <section class="grid grid-cols-1 md:grid-cols-3 gap-md">
        <div class="bg-surface-container-lowest p-md rounded-xl shadow-sm border-b-4 border-primary">
          <div class="flex justify-between items-start mb-sm">
            <div class="p-base bg-primary/5 rounded-lg">
              <span class="material-symbols-outlined text-primary">check_circle</span>
            </div>
          </div>
          <h4 class="font-label-md text-label-md text-secondary uppercase mb-xs">Asistencia Total</h4>
          <div class="flex items-baseline gap-xs">
            <span class="font-headline-lg text-headline-lg text-primary">94.5%</span>
            <span class="font-label-sm text-label-sm text-secondary">este mes</span>
          </div>
        </div>

        <div class="bg-surface-container-lowest p-md rounded-xl shadow-sm border-b-4 border-tertiary-container">
          <div class="flex justify-between items-start mb-sm">
            <div class="p-base bg-tertiary-fixed/10 rounded-lg">
              <span class="material-symbols-outlined text-tertiary">download_for_offline</span>
            </div>
          </div>
          <h4 class="font-label-md text-label-md text-secondary uppercase mb-xs">Materiales Descargados</h4>
          <div class="flex items-baseline gap-xs">
            <span class="font-headline-lg text-headline-lg text-primary">28 / 32</span>
            <span class="font-label-sm text-label-sm text-secondary">archivos</span>
          </div>
        </div>

        <div class="bg-surface-container-lowest p-md rounded-xl shadow-sm border-b-4 border-secondary">
          <div class="flex justify-between items-start mb-sm">
            <div class="p-base bg-secondary/5 rounded-lg">
              <span class="material-symbols-outlined text-secondary">task_alt</span>
            </div>
          </div>
          <h4 class="font-label-md text-label-md text-secondary uppercase mb-xs">Perfil Completado</h4>
          <div class="flex items-baseline gap-xs">
            <span class="font-headline-lg text-headline-lg text-primary">85%</span>
            <div class="w-full bg-surface-container h-2 rounded-full mt-sm ml-sm overflow-hidden">
              <div class="bg-primary h-full w-[85%] rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Recent Activity -->
      <div class="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        <div class="p-md border-b border-outline-variant">
          <h3 class="text-headline-sm text-on-surface font-bold">Actividad Reciente</h3>
        </div>
        <div class="divide-y divide-outline-variant max-h-64 overflow-y-auto">
          @for (item of recentActivity; track item.title) {
            <div class="p-md flex items-start gap-md hover:bg-surface-container-low transition-colors cursor-pointer">
              <div class="w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center"
                   [style]="{ backgroundColor: item.bgColor }">
                <span class="material-symbols-outlined" [style]="{ color: item.iconColor, fontSize: '18px' }">{{ item.icon }}</span>
              </div>
              <div class="flex-1">
                <p class="text-body-md text-on-surface font-semibold">{{ item.title }}</p>
                <p class="text-label-sm text-on-surface-variant">{{ item.subtitle }}</p>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class EstudianteDashboardComponent {
  protected readonly recentActivity = [
    { icon: 'description', bgColor: '#eff6ff', iconColor: '#2563eb', title: 'Guía de Física: Cinemática descargada', subtitle: 'Hace 2 horas • Ciclo Verano 2024' },
    { icon: 'assignment_turned_in', bgColor: '#f0fdf4', iconColor: '#16a34a', title: 'Simulacro RV-04 completado', subtitle: 'Ayer, 4:30 PM • Puntaje: 850/1000' },
    { icon: 'meeting_room', bgColor: '#fefce8', iconColor: '#ca8a04', title: 'Asistencia registrada: Trigonometría', subtitle: '24 de Mayo • Prof. Alva' },
    { icon: 'quiz', bgColor: '#faf5ff', iconColor: '#9333ea', title: 'Cuestionario de Álgebra resuelto', subtitle: '24 de Mayo • Puntaje: 18/20' },
    { icon: 'picture_as_pdf', bgColor: '#fef2f2', iconColor: '#dc2626', title: 'Separata de Razonamiento Matemático', subtitle: '23 de Mayo • 15 páginas' },
    { icon: 'video_library', bgColor: '#eef2ff', iconColor: '#4f46e5', title: 'Clase grabada: Geometría - Circunferencia', subtitle: '22 de Mayo • Prof. Miranda' },
    { icon: 'edit_note', bgColor: '#fff7ed', iconColor: '#ea580c', title: 'Foro de consultas: Semana 12', subtitle: '21 de Mayo • 8 respuestas nuevas' },
  ];
}
