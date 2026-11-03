import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductResponse } from '../../models/product.model';

const CATEGORIES = ['All', 'Fruits', 'Vegetables', 'Dairy', 'Bakery', 'Snacks', 'Beverages'];

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent],
  template: `
    <div class="page-container section">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-slate-800">Shop Groceries</h1>
        <p class="text-slate-500 text-sm mt-1">Fresh produce &amp; daily essentials delivered fast</p>
      </div>

      <div class="flex flex-col sm:flex-row gap-4 mb-8">
        <div class="relative flex-1">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input [(ngModel)]="searchQuery" (ngModelChange)="onSearch($event)"
                 type="text" placeholder="Search products…" class="input-field pl-9 w-full">
        </div>
        <div class="flex flex-wrap gap-2">
          @for (cat of categories; track cat) {
            <button (click)="setCategory(cat)"
                    class="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                    [class]="activeCategory() === cat
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-primary-300 hover:text-primary-700'">
              {{ cat }}
            </button>
          }
        </div>
      </div>

      @if (loading()) {
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          @for (n of [1,2,3,4,5,6,7,8]; track n) {
            <div class="card animate-pulse">
              <div class="h-44 bg-slate-200 rounded-xl mb-4"></div>
              <div class="h-4 bg-slate-200 rounded mb-2 w-3/4"></div>
              <div class="h-3 bg-slate-100 rounded w-1/2"></div>
            </div>
          }
        </div>
      } @else if (filtered().length) {
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          @for (p of filtered(); track p.productId) {
            <app-product-card [product]="p" (add)="addToCart($event)"></app-product-card>
          }
        </div>
      } @else {
        <div class="text-center py-20">
          <p class="text-5xl mb-4">🔍</p>
          <p class="text-slate-500 font-medium">No products found for "{{ searchQuery }}"</p>
          <button (click)="reset()" class="btn-secondary mt-4">Clear Search</button>
        </div>
      }
    </div>
  `
})
export class ShopComponent implements OnInit {
  private productSvc = inject(ProductService);
  private cartSvc = inject(CartService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);

  readonly categories = CATEGORIES;
  readonly loading = signal(true);
  readonly allProducts = signal<ProductResponse[]>([]);
  readonly filtered = signal<ProductResponse[]>([]);
  readonly activeCategory = signal('All');
  searchQuery = '';

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['q']) this.searchQuery = params['q'];
    });
    this.productSvc.getAllProducts().subscribe({
      next: products => { this.allProducts.set(products); this.applyFilters(); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onSearch(query: string): void {
    this.searchQuery = query;
    if (query.trim()) {
      this.productSvc.searchByName(query).subscribe({
        next: products => { this.allProducts.set(products); this.applyFilters(); },
        error: () => this.applyFilters()
      });
    } else {
      this.productSvc.getAllProducts().subscribe({
        next: products => { this.allProducts.set(products); this.applyFilters(); }
      });
    }
  }

  setCategory(cat: string): void { this.activeCategory.set(cat); this.applyFilters(); }

  applyFilters(): void {
    let products = this.allProducts();
    const cat = this.activeCategory();
    if (cat !== 'All') {
      products = products.filter(p =>
        p.category && p.category.toLowerCase() === cat.toLowerCase()
      );
    }
    this.filtered.set(products);
  }

  reset(): void {
    this.searchQuery = '';
    this.activeCategory.set('All');
    this.productSvc.getAllProducts().subscribe({
      next: products => { this.allProducts.set(products); this.applyFilters(); }
    });
  }

  addToCart(product: ProductResponse): void {
    const cid = this.auth.getCustomerId();
    console.log('DEBUG AUTH STATE:', this.auth.currentUser(), 'CID:', cid);
    if (!this.auth.isLoggedIn() || !cid) { this.toast.info('Please log in to add items to cart'); return; }
    const price = product.productPrice * (1 - product.discount / 100);
    this.cartSvc.addToCart({
      customerId: cid,
      productId: product.productId,
      productName: product.productName,
      productPrice: price,
      quantity: 1
    }).subscribe({
      next: () => this.toast.success(`${product.productName} added to cart!`),
      error: () => this.toast.error('Failed to add to cart')
    });
  }
}
