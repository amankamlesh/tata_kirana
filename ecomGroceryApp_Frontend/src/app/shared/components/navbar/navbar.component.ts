import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="frosted-nav sticky top-0 z-50">
      <div class="page-container">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <a routerLink="/" class="flex items-center gap-2 group">
            <span class="text-2xl">🛒</span>
            <span class="text-xl font-extrabold text-primary-700 tracking-tight group-hover:text-primary-800 transition-colors">TataKiranaStore</span>
          </a>

          <!-- Nav links -->
          <div class="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            @if (!auth.isAdmin()) {
              <a routerLink="/" routerLinkActive="text-primary-700 font-semibold" [routerLinkActiveOptions]="{exact:true}"
                 class="hover:text-primary-700 transition-colors">Home</a>
              <a routerLink="/shop" routerLinkActive="text-primary-700 font-semibold"
                 class="hover:text-primary-700 transition-colors">Shop</a>
              @if (auth.isLoggedIn()) {
                <a routerLink="/orders" routerLinkActive="text-primary-700 font-semibold"
                   class="hover:text-primary-700 transition-colors">My Orders</a>
              }
            } @else {
              <a routerLink="/admin/products" routerLinkActive="text-primary-700 font-semibold"
                 class="hover:text-primary-700 transition-colors text-amber-600">Admin</a>
            }
          </div>

          <!-- Right actions -->
          <div class="flex items-center gap-3">
            @if (auth.isLoggedIn() && !auth.isAdmin()) {
              <a routerLink="/cart" class="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
                <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m5-9v9m4-9v9m1-9l2 9"/>
                </svg>
                @if (cartService.cartCount() > 0) {
                  <span class="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center
                               text-[10px] font-bold text-white bg-primary-600 rounded-full">
                    {{ cartService.cartCount() }}
                  </span>
                }
              </a>
            }

            @if (!auth.isLoggedIn()) {
              <a routerLink="/login" class="btn-secondary text-xs px-4 py-2">Sign In</a>
              <a routerLink="/register" class="btn-primary text-xs px-4 py-2">Register</a>
            } @else {
              <div class="relative">
                <button (click)="toggleMenu()" class="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-100 transition-colors text-sm font-medium text-slate-700">
                  <span class="hidden sm:block">{{ auth.currentUser()?.username }}</span>
                  <span class="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                    {{ auth.currentUser()?.username?.charAt(0)?.toUpperCase() }}
                  </span>
                </button>
                @if (menuOpen()) {
                  <div class="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-card-hover border border-slate-100 py-1 z-50">
                    <a routerLink="/profile" (click)="closeMenu()"
                       class="block px-4 py-2.5 text-sm font-semibold text-slate-700 hover:text-primary-600 hover:bg-slate-50 transition-colors">My Profile</a>
                    <a routerLink="/change-password" (click)="closeMenu()"
                       class="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">Change Password</a>
                    <hr class="my-1 border-slate-100">
                    <button (click)="logout()"
                       class="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">Sign Out</button>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>
    </nav>
    @if (menuOpen()) {
      <div class="fixed inset-0 z-40" (click)="closeMenu()"></div>
    }
  `
})
export class NavbarComponent {
  readonly auth = inject(AuthService);
  readonly cartService = inject(CartService);
  readonly menuOpen = signal(false);

  toggleMenu() { this.menuOpen.update(v => !v); }
  closeMenu() { this.menuOpen.set(false); }

  logout(): void {
    this.closeMenu();
    this.auth.logout();
  }
}
