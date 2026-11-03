import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
    private counter = 0;
    readonly toasts = signal<Toast[]>([]);

    show(message: string, type: ToastType = 'info', duration = 3500): void {
        const id = ++this.counter;
        this.toasts.update(ts => [...ts, { id, message, type }]);
        setTimeout(() => this.remove(id), duration);
    }

    success(msg: string): void { this.show(msg, 'success'); }
    error(msg: string): void { this.show(msg, 'error'); }
    info(msg: string): void { this.show(msg, 'info'); }
    warning(msg: string): void { this.show(msg, 'warning'); }

    remove(id: number): void {
        this.toasts.update(ts => ts.filter(t => t.id !== id));
    }
}
