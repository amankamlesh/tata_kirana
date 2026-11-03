import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-50 to-slate-100 flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-md">
        <div class="card p-8">
          <div class="text-center mb-8">
            <span class="text-4xl">🛒</span>
            <h1 class="text-2xl font-bold text-slate-800 mt-2">Welcome Back</h1>
            <p class="text-slate-500 text-sm mt-1">Sign in to your TataKiranaStore account</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
              <input formControlName="username" type="text" placeholder="Your username" class="input-field"
                     [class.border-red-400]="isInvalid('username')">
              @if (isInvalid('username')) { <p class="text-xs text-red-500 mt-1">Username is required</p> }
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div class="relative">
                <input formControlName="password" [type]="showPwd() ? 'text' : 'password'"
                       placeholder="Enter your password" class="input-field pr-10"
                       [class.border-red-400]="isInvalid('password')">
                <button type="button" (click)="togglePwd()"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors text-sm">
                  {{ showPwd() ? '🙈' : '👁️' }}
                </button>
              </div>
              @if (isInvalid('password')) { <p class="text-xs text-red-500 mt-1">Password is required</p> }
            </div>
            <button type="submit" class="btn-primary w-full py-2.5" [disabled]="loading()">
              @if (loading()) { Signing in... } @else { Sign In }
            </button>
          </form>

          <p class="text-center text-sm text-slate-500 mt-6">
            Don't have an account?
            <a routerLink="/register" class="text-primary-600 font-semibold hover:underline">Register</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  readonly loading = signal(false);
  readonly showPwd = signal(false);

  togglePwd(): void { this.showPwd.update(v => !v); }

  form: FormGroup = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  isInvalid(f: string): boolean {
    const c = this.form.get(f)!;
    return c.invalid && (c.dirty || c.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.auth.login(this.form.value).subscribe({
      next: () => {
        if (this.auth.isAdmin()) {
          this.router.navigate(['/admin/products']);
        } else {
          this.router.navigate(['/shop']);
        }
      },
      error: err => {
        this.loading.set(false);
        this.toast.error(err?.error?.message ?? 'Login failed. Check your credentials.');
      }
    });
  }
}
