import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductResponse } from '../../models/product.model';

const CATEGORIES = [
  { label: 'Fruits', emoji: '🍎', query: 'fruit' },
  { label: 'Vegetables', emoji: '🥦', query: 'vegetable' },
  { label: 'Dairy', emoji: '🥛', query: 'dairy' },
  { label: 'Bakery', emoji: '🍞', query: 'bread' },
  { label: 'Snacks', emoji: '🍿', query: 'snack' },
  { label: 'Beverages', emoji: '🧃', query: 'juice' },
];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule, ProductCardComponent],
  template: `
    <!-- Hero -->
    <section class="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 text-white">
      <div class="page-container relative py-20 lg:py-28">
        <div class="max-w-2xl">
          <span class="badge-green mb-4 inline-block bg-white/20 text-white border-0">🌿 100% Fresh &amp; Natural</span>
          <h1 class="text-4xl lg:text-6xl font-extrabold leading-tight mb-6 drop-shadow">
            Fresh Groceries<br>Delivered to Your Door
          </h1>
          <p class="text-lg text-primary-100 mb-8 leading-relaxed">
            Shop from thousands of fresh products — farm-fresh produce, dairy, snacks, and more at the best prices.
          </p>
          <div class="flex gap-4 flex-wrap">
            <a routerLink="/shop" class="btn-primary bg-white text-primary-700 hover:bg-primary-50 text-base px-8 py-3">
              Shop Now
            </a>
            @if (!auth.isLoggedIn()) {
              <a routerLink="/register" class="btn-primary bg-primary-800 text-white hover:bg-primary-900 border-none text-base px-8 py-3">
                Create Account
              </a>
            }
          </div>
        </div>
      </div>
      <div class="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-20 right-32 w-80 h-80 bg-primary-400/30 rounded-full blur-3xl"></div>
    </section>

    <!-- Stats -->
    <section class="bg-white border-b border-slate-100">
      <div class="page-container py-5">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          @for (stat of stats; track stat.label) {
            <div>
              <div class="text-2xl font-extrabold text-primary-700">{{ stat.value }}</div>
              <div class="text-xs text-slate-500 mt-0.5">{{ stat.label }}</div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- Categories -->
    <section class="section bg-slate-50">
      <div class="page-container">
        <h2 class="text-2xl font-bold text-slate-800 mb-8">Shop by Category</h2>
        <div class="grid grid-cols-3 sm:grid-cols-6 gap-4">
          @for (cat of categories; track cat.label) {
            <a [routerLink]="['/shop']" [queryParams]="{q: cat.query}"
               class="card flex flex-col items-center gap-3 py-6 cursor-pointer hover:border-primary-200 hover:border hover:bg-primary-50 transition-all text-center group">
              <span class="text-4xl group-hover:scale-110 transition-transform duration-200">{{ cat.emoji }}</span>
              <span class="text-sm font-semibold text-slate-700 group-hover:text-primary-700 transition-colors">{{ cat.label }}</span>
            </a>
          }
        </div>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="section bg-white">
      <div class="page-container">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-2xl font-bold text-slate-800">Featured Products</h2>
          <a routerLink="/shop" class="text-primary-600 text-sm font-medium hover:underline">View all →</a>
        </div>
        @if (loading()) {
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            @for (n of [1,2,3,4]; track n) {
              <div class="card animate-pulse">
                <div class="h-44 bg-slate-200 rounded-xl mb-4"></div>
                <div class="h-4 bg-slate-200 rounded mb-2 w-3/4"></div>
                <div class="h-3 bg-slate-100 rounded w-1/2"></div>
              </div>
            }
          </div>
        } @else if (featured().length) {
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            @for (p of featured(); track p.productId) {
              <app-product-card [product]="p" (add)="addToCart($event)"></app-product-card>
            }
          </div>
        } @else {
          <p class="text-slate-400 text-center py-12">No products yet — check back soon!</p>
        }
      </div>
    </section>

    <!-- CTA -->
    <section class="section bg-primary-700 text-white">
      <div class="page-container text-center">
        <h2 class="text-3xl font-bold mb-4">Free Delivery on Orders Above ₹499</h2>
        <p class="text-primary-200 mb-6">Use code <span class="font-bold text-white">FRESH10</span> for 10% off your first order</p>
        <a routerLink="/shop" class="btn-primary bg-white text-primary-700 hover:bg-primary-50 text-base px-8 py-3">
          Start Shopping
        </a>
      </div>
    </section>
  `
})
export class HomeComponent implements OnInit {
  private productSvc = inject(ProductService);
  private cartSvc = inject(CartService);
  private toastSvc = inject(ToastService);
  readonly auth = inject(AuthService);

  readonly loading = signal(true);
  readonly featured = signal<ProductResponse[]>([]);
  readonly stats = [
    { value: '5,000+', label: 'Products' },
    { value: '24h', label: 'Delivery' },
    { value: '4.8★', label: 'Rating' },
    { value: '50K+', label: 'Happy Customers' }
  ];
  readonly categories = CATEGORIES;

  ngOnInit(): void {
    this.productSvc.getAllProducts().subscribe({
      next: products => { this.featured.set(products.slice(0, 8)); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  addToCart(product: ProductResponse): void {
    const cid = this.auth.getCustomerId();
    console.log('DEBUG AUTH STATE:', this.auth.currentUser(), 'CID:', cid);
    if (!this.auth.isLoggedIn() || !cid) { this.toastSvc.info('Please log in to add items to cart'); return; }
    const price = product.productPrice * (1 - product.discount / 100);
    this.cartSvc.addToCart({
      customerId: cid,
      productId: product.productId,
      productName: product.productName,
      productPrice: price,
      quantity: 1
    }).subscribe({
      next: () => this.toastSvc.success(`${product.productName} added to cart!`),
      error: () => this.toastSvc.error('Failed to add to cart')
    });
  }
}
