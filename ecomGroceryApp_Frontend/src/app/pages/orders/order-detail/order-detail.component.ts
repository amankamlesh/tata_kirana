import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../core/services/order.service';
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
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container section">
      <a routerLink="/orders" class="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary-700 mb-6 transition-colors">← My Orders</a>
      @if (loading()) {
        <div class="card animate-pulse h-64"></div>
      } @else if (order()) {
        <div class="grid lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 space-y-6">
            <div class="card">
              <div class="flex items-center justify-between mb-4">
                <h1 class="text-2xl font-bold text-slate-800">Order #{{ order()!.orderId }}</h1>
                <span [class]="statusClass(order()!.orderStatus)">{{ order()!.orderStatus }}</span>
              </div>
              <div class="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p class="text-slate-500 mb-0.5">Order Date</p>
                  <p class="font-medium text-slate-800">{{ order()!.orderDate | date:'medium' }}</p>
                </div>
                <div>
                  <p class="text-slate-500 mb-0.5">Delivery Address</p>
                  <p class="font-medium text-slate-800">{{ order()!.address }}</p>
                </div>
              </div>
            </div>
            <div class="card">
              <h2 class="font-bold text-slate-800 mb-4">Items Ordered</h2>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-slate-100 text-left text-slate-500 text-xs uppercase">
                      <th class="pb-2 pr-4">Product ID</th>
                      <th class="pb-2 pr-4">Qty</th>
                      <th class="pb-2 pr-4">Unit Price</th>
                      <th class="pb-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-50">
                    @for (item of order()!.orderItems; track item.orderItemId) {
                      <tr class="text-slate-700">
                        <td class="py-3 pr-4">#{{ item.productId }}</td>
                        <td class="py-3 pr-4">{{ item.quantity }}</td>
                        <td class="py-3 pr-4">₹{{ item.price | number:'1.2-2' }}</td>
                        <td class="py-3 text-right font-semibold">₹{{ itemSubtotal(item) | number:'1.2-2' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div class="card h-fit sticky top-20">
            <h2 class="font-bold text-slate-800 mb-4">Summary</h2>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between text-slate-600">
                <span>Subtotal</span><span>₹{{ getOrderSubtotal() | number:'1.2-2' }}</span>
              </div>
              <div class="flex justify-between text-slate-600">
                <span>Delivery</span>
                <span class="text-primary-600">{{ getOrderSubtotal() >= 499 ? 'Free' : '₹49' }}</span>
              </div>
            </div>
            <hr class="my-4 border-slate-100">
            <div class="flex justify-between font-bold text-slate-800">
              <span>Total</span>
              <span class="text-primary-700">₹{{ order()!.totalPrice | number:'1.2-2' }}</span>
            </div>
            @if (order()!.orderStatus === 'PENDING') {
              <button (click)="cancelOrder()" class="btn-danger w-full mt-5">Cancel Order</button>
            }
          </div>
        </div>
      } @else {
        <div class="text-center py-20">
          <p class="text-5xl mb-4">❓</p>
          <p class="text-slate-500">Order not found</p>
        </div>
      }
    </div>
  `
})
export class OrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderSvc = inject(OrderService);
  private toast = inject(ToastService);

  readonly loading = signal(true);
  readonly order = signal<OrderResponse | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.orderSvc.getOrderById(id).subscribe({
      next: o => { this.order.set(o); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  statusClass(status: string): string { return STATUS_COLORS[status] ?? 'badge-slate'; }

  itemSubtotal(item: { price: number; quantity: number }): number { return item.price * item.quantity; }

  getOrderSubtotal(): number {
    return this.order()?.orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0) ?? 0;
  }

  cancelOrder(): void {
    const o = this.order();
    if (!o) return;
    this.orderSvc.cancelOrder(o.orderId).subscribe({
      next: () => { this.order.update(ord => ord ? { ...ord, orderStatus: 'CANCELLED' } : ord); this.toast.success('Order cancelled'); },
      error: () => this.toast.error('Failed to cancel order')
    });
  }
}
