import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { ProductResponse } from '../../../models/product.model';

@Component({
  selector: 'app-admin-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page-container section">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-slate-800">Product Management</h1>
          <p class="text-slate-500 text-sm mt-1">{{ products().length }} products total</p>
        </div>
        <a routerLink="/admin/products/new" class="btn-primary">+ Add Product</a>
      </div>

      <div class="relative mb-6 max-w-sm">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        <input [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)"
               type="text" placeholder="Search products…" class="input-field pl-9">
      </div>

      @if (loading()) {
        <div class="card animate-pulse h-48"></div>
      } @else if (error()) {
        <div class="card text-center py-10">
          <p class="text-red-500 mb-3">⚠️ {{ error() }}</p>
          <button (click)="loadProducts()" class="btn-secondary">Retry</button>
        </div>
      } @else {
        <div class="card p-0 overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 border-b border-slate-100">
              <tr class="text-left text-xs text-slate-500 uppercase">
                <th class="px-4 py-3">ID</th>
                <th class="px-4 py-3">Name</th>
                <th class="px-4 py-3">Price</th>
                <th class="px-4 py-3">Discount</th>
                <th class="px-4 py-3">Stock</th>
                <th class="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              @for (p of filteredProducts(); track p.productId) {
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="px-4 py-3 text-slate-400">#{{ p.productId }}</td>
                  <td class="px-4 py-3 font-medium text-slate-800 max-w-xs truncate">{{ p.productName }}</td>
                  <td class="px-4 py-3 text-primary-700 font-semibold">₹{{ p.productPrice | number:'1.2-2' }}</td>
                  <td class="px-4 py-3">
                    @if (p.discount > 0) { <span class="badge-amber">{{ p.discount }}%</span> } @else { <span class="text-slate-400">–</span> }
                  </td>
                  <td class="px-4 py-3">
                    <span [class]="p.quantity === 0 ? 'badge-red' : p.quantity <= 5 ? 'badge-amber' : 'badge-green'">
                      {{ p.quantity === 0 ? 'Out' : p.quantity }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-right space-x-2">
                    <a [routerLink]="['/admin/products', p.productId, 'edit']" class="btn-secondary text-xs px-3 py-1">Edit</a>
                    <button (click)="deleteProduct(p)" class="btn-danger text-xs px-3 py-1">Delete</button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="px-4 py-12 text-center text-slate-400">
                    {{ searchQuery() ? 'No products matching "' + searchQuery() + '"' : 'No products yet — click + Add Product' }}
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `
})
export class AdminProductListComponent implements OnInit {
  private productSvc = inject(ProductService);
  private toast = inject(ToastService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly products = signal<ProductResponse[]>([]);
  readonly searchQuery = signal('');

  readonly filteredProducts = computed(() => {
    const s = this.searchQuery().toLowerCase().trim();
    return s
      ? this.products().filter(p => p.productName?.toLowerCase().includes(s))
      : this.products();
  });

  ngOnInit(): void { this.loadProducts(); }

  loadProducts(): void {
    this.loading.set(true);
    this.error.set(null);
    this.productSvc.getAllProducts().subscribe({
      next: p => { this.products.set(p); this.loading.set(false); },
      error: err => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Failed to load products. Check if the backend is running.');
        this.toast.error('Failed to load products');
      }
    });
  }

  deleteProduct(p: ProductResponse): void {
    if (!confirm(`Delete "${p.productName}"?`)) return;
    this.productSvc.deleteProduct(p.productId).subscribe({
      next: () => { this.products.update(ps => ps.filter(x => x.productId !== p.productId)); this.toast.success(`${p.productName} deleted`); },
      error: () => this.toast.error('Failed to delete product')
    });
  }
}
