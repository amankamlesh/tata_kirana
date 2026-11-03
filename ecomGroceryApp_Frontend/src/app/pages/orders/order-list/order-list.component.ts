import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { OrderResponse } from '../../../core/services/order.service';

const STATUS_COLORS: Record<string, string> = {
    PENDING: 'badge-amber',
    CONFIRMED: 'badge-green',
    SHIPPED: 'bg-blue-100 text-blue-700 badge',
    DELIVERED: 'badge-green',
    CANCELLED: 'badge-red'
};

@Component({
    selector: 'app-order-list',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
    <div class="page-container section">
      <h1 class="text-3xl font-bold text-slate-800 mb-8">My Orders 📦</h1>
      @if (loading()) {
        <div class="space-y-4">
          @for (n of [1,2,3]; track n) { <div class="card animate-pulse h-24"></div> }
        </div>
      } @else if (orders().length === 0) {
        <div class="text-center py-20">
          <p class="text-5xl mb-4">📦</p>
          <h2 class="text-xl font-semibold text-slate-700 mb-2">No orders yet</h2>
          <p class="text-slate-400 mb-6">Your order history will appear here</p>
          <a routerLink="/shop" class="btn-primary">Start Shopping</a>
        </div>
      } @else {
        <div class="space-y-4">
          @for (order of orders(); track order.orderId) {
            <div class="card flex flex-col sm:flex-row sm:items-center gap-4">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-3 mb-1">
                  <span class="font-bold text-slate-800">#{{ order.orderId }}</span>
                  <span [class]="statusClass(order.orderStatus)">{{ order.orderStatus }}</span>
                </div>
                <p class="text-sm text-slate-500">{{ order.orderDate | date:'medium' }}</p>
                <p class="text-sm text-slate-500 truncate">📍 {{ order.address }}</p>
              </div>
              <div class="text-right flex-shrink-0">
                <p class="text-xl font-bold text-primary-700">₹{{ order.totalPrice | number:'1.2-2' }}</p>
                <p class="text-xs text-slate-400 mb-3">{{ order.orderItems.length }} item(s)</p>
                <div class="flex gap-2 justify-end">
                  <a [routerLink]="['/orders', order.orderId]" class="btn-secondary text-xs px-3 py-1.5">View</a>
                  @if (order.orderStatus === 'PENDING') {
                    <button (click)="cancelOrder(order.orderId)" class="btn-danger text-xs px-3 py-1.5">Cancel</button>
                  }
                </div>
              </div>
              <a routerLink="/admin/orders" class="hover:text-primary-600">Orders</a>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class OrderListComponent implements OnInit {
    private orderSvc = inject(OrderService);
    private auth = inject(AuthService);
    private toast = inject(ToastService);

    readonly loading = signal(true);
    readonly orders = signal<OrderResponse[]>([]);

    ngOnInit(): void {
        const cid = this.auth.getCustomerId();
        if (!cid) { this.loading.set(false); return; }
        this.orderSvc.getOrdersByCustomer(cid).subscribe({
            next: orders => { this.orders.set(orders); this.loading.set(false); },
            error: () => this.loading.set(false)
        });
    }

    statusClass(status: string): string { return STATUS_COLORS[status] ?? 'badge-slate'; }

    cancelOrder(orderId: number): void {
        this.orderSvc.cancelOrder(orderId).subscribe({
            next: () => {
                this.toast.success('Order cancelled');
                this.orders.update(os => os.map(o => o.orderId === orderId ? { ...o, orderStatus: 'CANCELLED' } : o));
            },
            error: () => this.toast.error('Failed to cancel order')
        });
    }
}
