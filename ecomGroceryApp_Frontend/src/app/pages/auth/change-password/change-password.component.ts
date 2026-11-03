import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
    selector: 'app-change-password',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule],
    template: `
    <div class="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-md">
        <div class="card p-8">
          <div class="text-center mb-8">
            <span class="text-4xl">🔑</span>
            <h1 class="text-2xl font-bold text-slate-800 mt-2">Change Password</h1>
            <p class="text-slate-500 text-sm mt-1">Keep your account secure</p>
          </div>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Current Password</label>
              <input formControlName="oldPassword" type="password" placeholder="Current password" class="input-field"
                     [class.border-red-400]="isInvalid('oldPassword')">
              @if (isInvalid('oldPassword')) { <p class="text-xs text-red-500 mt-1">Current password required</p> }
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
              <input formControlName="newPassword" type="password" placeholder="Min 6 characters" class="input-field"
                     [class.border-red-400]="isInvalid('newPassword')">
              @if (isInvalid('newPassword')) { <p class="text-xs text-red-500 mt-1">Min 6 characters required</p> }
            </div>
            <button type="submit" class="btn-primary w-full py-2.5" [disabled]="loading()">
              @if (loading()) { Updating... } @else { Update Password }
            </button>
          </form>
        </div>
      </div>
    </div>
  `
})
export class ChangePasswordComponent {
    private fb = inject(FormBuilder);
    private auth = inject(AuthService);
    private toast = inject(ToastService);

    readonly loading = signal(false);

    form: FormGroup = this.fb.group({
        oldPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });

    isInvalid(f: string): boolean {
        const c = this.form.get(f)!;
        return c.invalid && (c.dirty || c.touched);
    }

    onSubmit(): void {
        if (this.form.invalid) { this.form.markAllAsTouched(); return; }
        const cid = this.auth.getCustomerId();
        if (!cid) { this.toast.error('Customer ID not found. Please log in again.'); return; }
        this.loading.set(true);
        this.auth.changePassword(cid, this.form.value).subscribe({
            next: () => { this.loading.set(false); this.toast.success('Password updated successfully!'); this.form.reset(); },
            error: err => { this.loading.set(false); this.toast.error(err?.error?.message ?? 'Failed to update password'); }
        });
    }
}
