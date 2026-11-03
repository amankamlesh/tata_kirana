import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductResponse } from '../../../models/product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div class="card group flex flex-col h-full">
      <a [routerLink]="['/products', product.productId]" class="block mb-4 overflow-hidden rounded-xl">
        <img [src]="product.productImage || 'https://placehold.co/400x300/e2e8f0/94a3b8?text=Grocery'"
             [alt]="product.productName"
             class="w-full h-44 object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
             (error)="onImgError($event)">
      </a>

      <div class="flex items-center gap-2 mb-2 px-1">
        @if (product.category) {
          <span class="text-[10px] font-bold tracking-wider uppercase bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full">{{ product.category }}</span>
        }
        @if (product.discount > 0) {
          <span class="badge-amber">{{ product.discount }}% OFF</span>
        }
      </div>

      <div class="flex-1">
        <a [routerLink]="['/products', product.productId]"
           class="block font-semibold text-slate-800 hover:text-primary-700 transition-colors line-clamp-2 mb-1">
          {{ product.productName }}
        </a>
        <p class="text-xs text-slate-400 line-clamp-2 mb-3">{{ product.productDescription }}</p>
      </div>

      <div class="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
        <div>
          <span class="text-lg font-bold text-primary-700">₹{{ discountedPrice() | number:'1.2-2' }}</span>
          @if (product.discount > 0) {
            <span class="ml-1.5 text-xs text-slate-400 line-through">₹{{ product.productPrice | number:'1.2-2' }}</span>
          }
        </div>
        <button (click)="add.emit(product)"
                class="btn-primary text-xs px-3 py-1.5"
                [disabled]="product.quantity === 0">
          {{ product.quantity === 0 ? 'Out of Stock' : '+ Add' }}
        </button>
      </div>

      @if (product.quantity > 0 && product.quantity <= 5) {
        <p class="text-xs text-amber-600 mt-2">Only {{ product.quantity }} left!</p>
      }
    </div>
  `
})
export class ProductCardComponent {
  @Input({ required: true }) product!: ProductResponse;
  @Output() add = new EventEmitter<ProductResponse>();

  discountedPrice(): number {
    return this.product.productPrice * (1 - this.product.discount / 100);
  }

  onImgError(e: Event): void {
    (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/e2e8f0/94a3b8?text=Grocery';
  }
}
