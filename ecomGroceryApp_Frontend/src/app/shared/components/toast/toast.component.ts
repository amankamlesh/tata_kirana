import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      @for (toast of toastSvc.toasts(); track toast.id) {
        <div class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-card-hover border text-sm font-medium"
             [class]="toastClass(toast.type)">
          <span>{{ toastIcon(toast.type) }}</span>
          <span class="flex-1">{{ toast.message }}</span>
          <button (click)="toastSvc.remove(toast.id)" class="ml-2 opacity-60 hover:opacity-100 transition-opacity text-lg leading-none">&times;</button>
        </div>
      }
    </div>
  `,
    styles: [`
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ToastComponent {
    readonly toastSvc = inject(ToastService);

    toastClass(type: string): string {
        const map: Record<string, string> = {
            success: 'bg-primary-50 border-primary-200 text-primary-800',
            error: 'bg-red-50 border-red-200 text-red-800',
            warning: 'bg-amber-50 border-amber-200 text-amber-800',
            info: 'bg-blue-50 border-blue-200 text-blue-800',
        };
        return map[type] ?? map['info'];
    }

    toastIcon(type: string): string {
        const icons: Record<string, string> = {
            success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️'
        };
        return icons[type] ?? 'ℹ️';
    }
}
