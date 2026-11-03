import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ProductResponse } from '../../models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container section">
      <a routerLink="/shop" class="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary-700 mb-6 transition-colors">← Back to Shop</a>

      @if (loading()) {
        <div class="grid md:grid-cols-2 gap-10 animate-pulse">
          <div class="h-96 bg-slate-200 rounded-2xl"></div>
          <div class="space-y-4">
            <div class="h-8 bg-slate-200 rounded w-3/4"></div>
            <div class="h-4 bg-slate-100 rounded w-full"></div>
          </div>
        </div>
      } @else if (product()) {
        <div class="grid md:grid-cols-2 gap-10">
          <div class="rounded-2xl overflow-hidden shadow-card">
            <img [src]="product()!.productImage || 'https://placehold.co/600x500/e2e8f0/94a3b8?text=Grocery'"
                 [alt]="product()!.productName"
                 class="w-full h-96 object-cover"
                 (error)="onImgError($event)">
          </div>
          <div class="flex flex-col gap-5">
            @if (product()!.discount > 0) {
              <span class="badge-amber self-start">{{ product()!.discount }}% OFF</span>
            }
            <h1 class="text-3xl font-bold text-slate-800">{{ product()!.productName }}</h1>
            <p class="text-slate-500 leading-relaxed">{{ product()!.productDescription }}</p>
            <div class="flex items-baseline gap-3">
              <span class="text-4xl font-extrabold text-primary-700">₹{{ discountedPrice() | number:'1.2-2' }}</span>
              @if (product()!.discount > 0) {
                <span class="text-xl text-slate-400 line-through">₹{{ product()!.productPrice | number:'1.2-2' }}</span>
              }
            </div>
            @if (product()!.quantity === 0) {
              <span class="badge-red self-start">Out of Stock</span>
            } @else if (product()!.quantity <= 5) {
              <span class="badge-amber self-start">Only {{ product()!.quantity }} left!</span>
            } @else {
              <span class="badge-green self-start">In Stock</span>
            }
            @if (product()!.quantity > 0) {
              <div class="flex items-center gap-4">
                <label class="text-sm font-medium text-slate-700">Quantity</label>
                <div class="flex items-center gap-2">
                  <button (click)="decQty()" class="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors font-bold">−</button>
                  <span class="w-8 text-center font-semibold">{{ qty }}</span>
                  <button (click)="incQty()" class="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors font-bold">+</button>
                </div>
              </div>
              <button (click)="addToCart()" class="btn-primary py-3 text-base w-full sm:w-auto sm:px-10" [disabled]="adding()">
                @if (adding()) { Adding... } @else { 🛒 Add to Cart }
              </button>
            }
          </div>
        </div>
      } @else {
        <div class="text-center py-20">
          <p class="text-5xl mb-4">❓</p>
          <p class="text-slate-500">Product not found</p>
          <a routerLink="/shop" class="btn-primary mt-4 inline-flex">Back to Shop</a>
        </div>
      }
    </div>
  `
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productSvc = inject(ProductService);
  private cartSvc = inject(CartService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  readonly loading = signal(true);
  readonly product = signal<ProductResponse | null>(null);
  readonly adding = signal(false);
  qty = 1;

  decQty(): void { if (this.qty > 1) this.qty--; }
  incQty(): void { const p = this.product(); if (p && this.qty < p.quantity) this.qty++; }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productSvc.getProductById(id).subscribe({
      next: p => { this.product.set(p); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  discountedPrice(): number {
    const p = this.product();
    return p ? p.productPrice * (1 - p.discount / 100) : 0;
  }

  addToCart(): void {
    const cid = this.auth.getCustomerId();
    console.log('DEBUG AUTH STATE:', this.auth.currentUser(), 'CID:', cid);
    if (!this.auth.isLoggedIn() || !cid) { this.toast.info('Please log in to add items'); return; }
    const p = this.product();
    if (!p) return;
    this.adding.set(true);
    const price = p.productPrice * (1 - p.discount / 100);
    this.cartSvc.addToCart({
      customerId: cid,
      productId: p.productId,
      productName: p.productName,
      productPrice: price,
      quantity: this.qty
    }).subscribe({
      next: () => { this.adding.set(false); this.toast.success('Added to cart!'); },
      error: () => { this.adding.set(false); this.toast.error('Failed to add to cart'); }
    });
  }

  onImgError(e: Event): void {
    (e.target as HTMLImageElement).src = 'https://placehold.co/600x500/e2e8f0/94a3b8?text=Grocery';
  }
}
