import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div class="text-center">
        <div class="text-8xl mb-4">🥦</div>
        <h1 class="text-7xl font-extrabold text-primary-700 mb-2">404</h1>
        <h2 class="text-2xl font-bold text-slate-800 mb-4">Page not found</h2>
        <p class="text-slate-500 mb-8 max-w-md mx-auto">
          Looks like this page got lost in the produce aisle. Let's get you back on track.
        </p>
        <div class="flex justify-center gap-4">
          <a routerLink="/" class="btn-primary px-8">Go Home</a>
          <a routerLink="/shop" class="btn-secondary px-8">Shop Now</a>
        </div>
      </div>
    </div>
  `
})
export class NotFoundComponent { }
