import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { CartItemResponse } from '../../models/cart.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-container section">
      <h1 class="text-3xl font-bold text-slate-800 mb-8">Checkout</h1>
      @if (items().length === 0) {
        <div class="text-center py-20">
          <p class="text-5xl mb-4">🛒</p>
          <p class="text-slate-500 mb-4">Your cart is empty</p>
          <a routerLink="/shop" class="btn-primary">Shop Now</a>
        </div>
      } @else {
        <div class="grid lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2">
            <div class="card p-6">
              <h2 class="text-lg font-bold text-slate-800 mb-5">Delivery Address</h2>
              <form [formGroup]="form" (ngSubmit)="placeOrder()" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1.5">Full Address</label>
                  <textarea formControlName="address" rows="3" placeholder="House No., Street, City, State, PIN"
                            class="input-field resize-none" [class.border-red-400]="isInvalid('address')"></textarea>
                  @if (isInvalid('address')) { <p class="text-xs text-red-500 mt-1">Address is required</p> }
                </div>
                <button type="submit" class="btn-primary w-full py-3 text-base" [disabled]="placing()">
                  @if (placing()) { Placing Order... } @else { 🎉 Place Order }
                </button>
              </form>
            </div>
          </div>
          <div class="card h-fit sticky top-20 p-6">
            <h2 class="text-lg font-bold text-slate-800 mb-4">Order Summary</h2>
            <div class="space-y-2 text-sm">
              @for (item of items(); track item.itemId) {
                <div class="flex justify-between text-slate-600">
                  <span class="truncate">{{ item.productName }} × {{ item.quantity }}</span>
                  <span>₹{{ item.subtotal | number:'1.2-2' }}</span>
                </div>
              }
            </div>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between text-slate-800 font-medium mt-4">
                <span>Subtotal</span>
                <span>₹{{ total() | number:'1.2-2' }}</span>
              </div>
              <div class="flex justify-between text-slate-600">
                <span>Delivery</span>
                <span [class.text-primary-600]="total() >= 499">{{ total() >= 499 ? 'Free' : '₹49.00' }}</span>
              </div>
            </div>
            <hr class="my-4 border-slate-100">
            <div class="flex justify-between font-bold text-slate-800">
              <span>Total</span>
              <span class="text-primary-700">₹{{ (total() >= 499 ? total() : total() + 49) | number:'1.2-2' }}</span>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  private cartSvc = inject(CartService);
  private orderSvc = inject(OrderService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  readonly items = signal<CartItemResponse[]>([]);
  readonly total = signal(0);
  readonly placing = signal(false);

  form: FormGroup = this.fb.group({ address: ['', Validators.required] });

  ngOnInit(): void {
    const cid = this.auth.getCustomerId();
    if (!cid) return;
    this.cartSvc.getCart(cid).subscribe({
      next: res => { this.items.set(res.cartItems ?? []); this.total.set(res.totalAmount ?? 0); }
    });
  }

  isInvalid(f: string): boolean {
    const c = this.form.get(f)!;
    return c.invalid && (c.dirty || c.touched);
  }

  placeOrder(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const cid = this.auth.getCustomerId();
    if (!cid) { this.toast.error('Please log in again'); return; }
    this.placing.set(true);
    const orderItems = this.items().map(i => ({ productId: i.productId, quantity: i.quantity, price: i.productPrice }));
    this.orderSvc.placeOrder({ customerId: cid, address: this.form.value.address, orderItems }).subscribe({
      next: order => {
        this.placing.set(false);
        this.cartSvc.clearCartAPI(cid).subscribe();
        this.toast.success('Order placed successfully! 🎉');
        this.router.navigate(['/orders', order.orderId]);
      },
      error: err => { this.placing.set(false); this.toast.error(err?.error?.message ?? 'Failed to place order'); }
    });
  }
}
