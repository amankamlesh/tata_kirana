import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService, OrderResponse } from 'src/app/core/services/order.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-6xl mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-slate-800">Customer Orders</h1>
        <input class="input-field max-w-xs" type="number" placeholder="Filter by customer ID"
               [ngModel]="customerFilter()" (ngModelChange)="customerFilter.set($event)">
      </div>

      @if (loading()) {
        <p class="text-slate-500">Loading orders...</p>
      } @else if (filtered().length === 0) {
        <div class="card p-8 text-center text-slate-500">No orders found.</div>
      } @else {
        <div class="card overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="bg-slate-50 text-slate-600">
              <tr>
                <th class="px-4 py-3">Order #</th>
                <th class="px-4 py-3">Customer</th>
                <th class="px-4 py-3">Items</th>
                <th class="px-4 py-3">Address</th>
                <th class="px-4 py-3">Total</th>
                <th class="px-4 py-3">Status</th>
                <th class="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              @for (o of filtered(); track o.orderId) {
                <tr class="border-t border-slate-100 align-top">
                  <td class="px-4 py-3 font-medium">#{{ o.orderId }}</td>
                  <td class="px-4 py-3">{{ o.customerId }}</td>
                  <td class="px-4 py-3">
                    @for (i of o.orderItems; track i.orderItemId) {
                      <div>Product #{{ i.productId }} × {{ i.quantity }}</div>
                    }
                  </td>
                  <td class="px-4 py-3 max-w-xs">{{ o.address }}</td>
                  <td class="px-4 py-3">{{ o.totalPrice | currency:'INR' }}</td>
                  <td class="px-4 py-3">
                    <select class="input-field py-1" [ngModel]="o.orderStatus"
                            (ngModelChange)="changeStatus(o, $event)">
                      @for (s of statuses; track s) {
                        <option [value]="s">{{ s }}</option>
                      }
                    </select>
                  </td>
                  <td class="px-4 py-3">{{ o.orderDate | date:'medium' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `
})
export class AdminOrdersComponent implements OnInit {
  private orders = inject(OrderService);
  private toast = inject(ToastService);

  // Must match your OrderStatus enum (cancelled orders are hidden by the backend)
  readonly statuses = ['PLACED', 'SHIPPED', 'DELIVERED'];

  readonly loading = signal(true);
  readonly all = signal<OrderResponse[]>([]);
  readonly customerFilter = signal<number | null>(null);

  readonly filtered = computed(() => {
    const id = this.customerFilter();
    return id ? this.all().filter(o => o.customerId === Number(id)) : this.all();
  });

  ngOnInit(): void {
    this.orders.getAllOrders().subscribe({
      next: data => { this.all.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toast.error('Could not load orders'); }
    });
  }

  changeStatus(order: OrderResponse, status: string): void {
    this.orders.updateStatus(order.orderId, status).subscribe({
      next: updated => {
        this.all.update(list => list.map(o => o.orderId === updated.orderId ? updated : o));
        this.toast.success(`Order #${order.orderId} marked ${status}`);
      },
      error: () => this.toast.error('Could not update status')
    });
  }
}