import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { CartItemResponse } from '../../models/cart.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container section">
      <h1 class="text-3xl font-bold text-slate-800 mb-8">Your Cart 🛒</h1>

      @if (loading()) {
        <div class="space-y-4">
          @for (n of [1,2,3]; track n) {
            <div class="card animate-pulse flex gap-4">
              <div class="w-20 h-20 bg-slate-200 rounded-xl flex-shrink-0"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-slate-200 rounded w-1/2"></div>
                <div class="h-3 bg-slate-100 rounded w-1/4"></div>
              </div>
            </div>
          }
        </div>
      } @else if (items().length === 0) {
        <div class="text-center py-24">
          <p class="text-6xl mb-4">🛒</p>
          <h2 class="text-xl font-semibold text-slate-700 mb-2">Your cart is empty</h2>
          <p class="text-slate-400 mb-6">Add some fresh groceries to get started</p>
          <a routerLink="/shop" class="btn-primary px-8">Shop Now</a>
        </div>
      } @else {
        <div class="grid lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 space-y-4">
            @for (item of items(); track item.itemId) {
              <div class="card flex items-center gap-4">
                <div class="w-16 h-16 bg-primary-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🥬</div>
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-slate-800 truncate">{{ item.productName }}</p>
                  <p class="text-sm text-slate-500">₹{{ item.productPrice | number:'1.2-2' }} each</p>
                </div>
                <div class="flex items-center gap-2">
                  <button (click)="updateQty(item, item.quantity - 1)"
                          class="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-sm font-bold transition-colors">−</button>
                  <span class="w-6 text-center text-sm font-semibold">{{ item.quantity }}</span>
                  <button (click)="updateQty(item, item.quantity + 1)"
                          class="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-sm font-bold transition-colors">+</button>
                </div>
                <p class="font-bold text-primary-700 w-20 text-right">₹{{ item.subtotal | number:'1.2-2' }}</p>
                <button (click)="removeItem(item.itemId)" class="text-red-400 hover:text-red-600 transition-colors ml-2 text-lg">✕</button>
              </div>
            }
          </div>
          <div class="card h-fit sticky top-20">
            <h2 class="text-lg font-bold text-slate-800 mb-5">Order Summary</h2>
            <div class="space-y-3 text-sm">
              @for (item of items(); track item.itemId) {
                <div class="flex justify-between text-slate-600">
                  <span class="truncate">{{ item.productName }} × {{ item.quantity }}</span>
                  <span>₹{{ item.subtotal | number:'1.2-2' }}</span>
                </div>
              }
            </div>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between text-slate-800 font-medium">
                <span>Subtotal</span>
                <span>₹{{ total() | number:'1.2-2' }}</span>
              </div>
              <div class="flex justify-between text-slate-600">
                <span>Delivery</span>
                <span [class.text-primary-600]="total() >= 499">{{ total() >= 499 ? 'Free' : '₹49.00' }}</span>
              </div>
            </div>
            <hr class="my-4 border-slate-100">
            <div class="flex justify-between font-bold text-slate-800 text-base">
              <span>Total</span>
              <span class="text-primary-700">₹{{ (total() >= 499 ? total() : total() + 49) | number:'1.2-2' }}</span>
            </div>
            <hr class="my-4 border-slate-100">
            <div class="text-xs text-slate-400 mb-4">
              @if (total() >= 499) {
                ✅ Eligible for <strong>free delivery</strong>
              } @else {
                Add ₹{{ amountToFreeDelivery() | number:'1.0-0' }} more for free delivery
              }
            </div>
            <button (click)="checkout()" class="btn-primary w-full py-3">Proceed to Checkout →</button>
          </div>
        </div>
      }
    </div>
  `
})
export class CartComponent implements OnInit {
  private cartSvc = inject(CartService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  readonly loading = signal(true);
  readonly items = signal<CartItemResponse[]>([]);
  readonly total = signal(0);

  amountToFreeDelivery(): number { return 499 - this.total(); }

  ngOnInit(): void {
    const cid = this.auth.getCustomerId();
    if (!cid) { this.loading.set(false); return; }
    this.cartSvc.getCart(cid).subscribe({
      next: res => { this.items.set(res.cartItems ?? []); this.total.set(res.totalAmount ?? 0); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  updateQty(item: CartItemResponse, qty: number): void {
    if (qty < 1) { this.removeItem(item.itemId); return; }
    this.cartSvc.updateQuantity(item.itemId, qty).subscribe({
      next: res => { this.items.set(res.cartItems ?? []); this.total.set(res.totalAmount ?? 0); },
      error: () => this.toast.error('Failed to update quantity')
    });
  }

  removeItem(itemId: number): void {
    this.cartSvc.removeItem(itemId).subscribe({
      next: res => { this.items.set(res.cartItems ?? []); this.total.set(res.totalAmount ?? 0); this.toast.success('Item removed'); },
      error: () => this.toast.error('Failed to remove item')
    });
  }

  checkout(): void { this.router.navigate(['/checkout']); }
}
