import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  template: `
    <div class="flex items-center justify-center gap-1">
      <!-- Previous -->
      <button
        class="w-10 h-10 flex items-center justify-center rounded-lg font-label-md text-label-md transition-colors hover:bg-surface-container-high text-on-surface disabled:opacity-30 disabled:cursor-not-allowed"
        [disabled]="currentPage <= 1"
        (click)="goToPage(currentPage - 1)"
      >
        <span class="material-symbols-outlined">chevron_left</span>
      </button>

      <!-- Page numbers -->
      @for (page of pageNumbers; track $index) {
        @if (page === -1) {
          <span class="px-1 text-outline font-label-md text-label-md">...</span>
        } @else {
          <button
            class="w-10 h-10 flex items-center justify-center rounded-lg font-label-md text-label-md transition-colors"
            [class.bg-primary]="page === currentPage"
            [class.text-on-primary]="page === currentPage"
            [class.hover:bg-surface-container-high]="page !== currentPage"
            [class.text-on-surface]="page !== currentPage"
            (click)="goToPage(page)"
          >
            {{ page }}
          </button>
        }
      }

      <!-- Next -->
      <button
        class="w-10 h-10 flex items-center justify-center rounded-lg font-label-md text-label-md transition-colors hover:bg-surface-container-high text-on-surface disabled:opacity-30 disabled:cursor-not-allowed"
        [disabled]="currentPage >= totalPages"
        (click)="goToPage(currentPage + 1)"
      >
        <span class="material-symbols-outlined">chevron_right</span>
      </button>
    </div>
  `,
})
export class PaginationComponent {
  @Input({ required: true }) totalItems = 0;
  @Input({ required: true }) itemsPerPage = 10;
  @Input() currentPage = 1;
  @Output() pageChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get pageNumbers(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const pages: number[] = [];

    if (total <= 5) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (current > 3) pages.push(-1); // ellipsis
      for (
        let i = Math.max(2, current - 1);
        i <= Math.min(total - 1, current + 1);
        i++
      ) {
        pages.push(i);
      }
      if (current < total - 2) pages.push(-1); // ellipsis
      pages.push(total);
    }

    return pages;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.pageChange.emit(page);
  }
}
