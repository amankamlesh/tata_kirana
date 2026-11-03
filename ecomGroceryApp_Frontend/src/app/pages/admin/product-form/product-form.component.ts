import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <div class="page-container section">
      <a routerLink="/admin/products" class="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary-700 mb-6 transition-colors">
        ← Back to Products
      </a>
      <div class="card max-w-2xl p-8">
        <div class="mb-8">
          <h1 class="text-2xl font-bold text-slate-800">{{ isEdit() ? 'Edit Product' : 'Add New Product' }}</h1>
          <p class="text-slate-500 text-sm mt-1">{{ isEdit() ? 'Update product details' : 'Fill in the product details below' }}</p>
        </div>
        @if (loadingProduct()) {
          <div class="space-y-4 animate-pulse">
            @for (n of [1,2,3,4,5]; track n) { <div class="h-10 bg-slate-200 rounded-xl"></div> }
          </div>
        } @else {
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">Product Name</label>
                <input formControlName="productName" type="text" placeholder="e.g. Organic Apples" class="input-field"
                       [class.border-red-400]="isInvalid('productName')">
                @if (isInvalid('productName')) { <p class="text-xs text-red-500 mt-1">Name is required</p> }
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                <select formControlName="category" class="input-field" [class.border-red-400]="isInvalid('category')">
                  <option value="" disabled selected>Select Category</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Bakery">Bakery</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Beverages">Beverages</option>
                </select>
                @if (isInvalid('category')) { <p class="text-xs text-red-500 mt-1">Category is required</p> }
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
              <textarea formControlName="productDescription" rows="3" placeholder="Product description…"
                        class="input-field resize-none" [class.border-red-400]="isInvalid('productDescription')"></textarea>
              @if (isInvalid('productDescription')) { <p class="text-xs text-red-500 mt-1">Description is required</p> }
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">Price (₹)</label>
                <input formControlName="productPrice" type="number" min="0" step="0.01" placeholder="0.00" class="input-field"
                       [class.border-red-400]="isInvalid('productPrice')">
                @if (isInvalid('productPrice')) { <p class="text-xs text-red-500 mt-1">Valid price required</p> }
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">Discount (%)</label>
                <input formControlName="discount" type="number" min="0" max="100" placeholder="0" class="input-field">
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Stock Quantity</label>
              <input formControlName="quantity" type="number" min="0" placeholder="0" class="input-field"
                     [class.border-red-400]="isInvalid('quantity')">
              @if (isInvalid('quantity')) { <p class="text-xs text-red-500 mt-1">Quantity is required</p> }
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Image URL</label>
              <input formControlName="productImage" type="url" placeholder="https://…" class="input-field">
            </div>
            <div class="flex gap-3 pt-2">
              <button type="submit" class="btn-primary flex-1 py-2.5" [disabled]="saving()">
                @if (saving()) { Saving... } @else { {{ isEdit() ? 'Update Product' : 'Add Product' }} }
              </button>
              <a routerLink="/admin/products" class="btn-secondary px-6 py-2.5">Cancel</a>
            </div>
          </form>
        }
      </div>
    </div>
  `
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productSvc = inject(ProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  readonly isEdit = signal(false);
  readonly saving = signal(false);
  readonly loadingProduct = signal(false);
  private productId: number | null = null;

  form: FormGroup = this.fb.group({
    productName: ['', Validators.required],
    category: ['', Validators.required],
    productDescription: ['', Validators.required],
    productPrice: [null, [Validators.required, Validators.min(0)]],
    quantity: [null, [Validators.required, Validators.min(0)]],
    discount: [0],
    productImage: ['']
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.productId = Number(id);
      this.loadingProduct.set(true);
      this.productSvc.getProductById(this.productId).subscribe({
        next: p => { this.form.patchValue(p); this.loadingProduct.set(false); },
        error: () => { this.toast.error('Product not found'); this.router.navigate(['/admin/products']); }
      });
    }
  }

  isInvalid(f: string): boolean {
    const c = this.form.get(f)!;
    return c.invalid && (c.dirty || c.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const req = this.form.value;
    const action = this.isEdit()
      ? this.productSvc.updateProduct(this.productId!, req)
      : this.productSvc.addProduct(req);
    action.subscribe({
      next: () => { this.saving.set(false); this.toast.success(this.isEdit() ? 'Product updated!' : 'Product added!'); this.router.navigate(['/admin/products']); },
      error: err => { this.saving.set(false); this.toast.error(err?.error?.message ?? 'Failed to save product'); }
    });
  }
}
