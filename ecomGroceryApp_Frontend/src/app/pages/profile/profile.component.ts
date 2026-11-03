import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { UserProfileResponse } from '../../models/auth.model';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule],
    template: `
    <div class="page-container py-12">
      <div class="max-w-2xl mx-auto">
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          
          <div class="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-10 text-white flex items-center gap-6">
            <div class="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-4xl border-4 border-white/30 backdrop-blur-sm">
              <span class="drop-shadow-sm">👤</span>
            </div>
            <div>
              <h1 class="text-3xl font-bold tracking-tight">My Profile</h1>
              <p class="text-primary-100 mt-1">Manage your account information</p>
            </div>
          </div>

          <div class="p-8">
            @if (loadingData()) {
              <div class="flex justify-center py-10">
                <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
              </div>
            } @else {
              <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-2">Username</label>
                    <input formControlName="username" type="text" class="input-field bg-slate-50 focus:bg-white transition-colors"
                           [class.border-red-400]="isInvalid('username')">
                    @if (isInvalid('username')) { <p class="text-xs text-red-500 mt-1">Username is required</p> }
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                    <input formControlName="email" type="email" class="input-field bg-slate-50 focus:bg-white transition-colors"
                           [class.border-red-400]="isInvalid('email')">
                    @if (isInvalid('email')) { <p class="text-xs text-red-500 mt-1">Valid email is required</p> }
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Account Role</label>
                  <input formControlName="role" type="text" class="input-field bg-slate-100 text-slate-500 cursor-not-allowed">
                  <p class="text-xs text-slate-400 mt-1 font-medium">Roles cannot be changed manually.</p>
                </div>

                <div class="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <button type="button" (click)="goBack()" class="px-5 py-2.5 rounded-xl font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors">
                    Back
                  </button>
                  <button type="submit" class="btn-primary min-w-[140px] shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all" [disabled]="saving() || form.pristine || form.invalid">
                    @if (saving()) { 
                      <span class="flex items-center gap-2 justify-center">
                        <svg class="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Saving...
                      </span>
                    } @else if (form.pristine) { 
                      Up to date 
                    } @else { 
                      Save Changes 
                    }
                  </button>
                </div>
              </form>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
    private fb = inject(FormBuilder);
    private auth = inject(AuthService);
    private router = inject(Router);
    private toast = inject(ToastService);

    readonly loadingData = signal(true);
    readonly saving = signal(false);

    form: FormGroup = this.fb.group({
        username: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        role: [{ value: '', disabled: true }]
    });

    ngOnInit(): void {
        const cid = this.auth.getCustomerId();
        if (!cid) {
            this.toast.error('You must be logged in to view your profile.');
            this.router.navigate(['/login']);
            return;
        }

        this.auth.getProfile(cid).subscribe({
            next: (profile: UserProfileResponse) => {
                this.form.patchValue({
                    username: profile.username,
                    email: profile.email,
                    role: profile.role
                });
                this.loadingData.set(false);
            },
            error: (err: any) => {
                this.toast.error('Failed to load profile data.');
                this.loadingData.set(false);
            }
        });
    }

    isInvalid(field: string): boolean {
        const c = this.form.get(field)!;
        return c.invalid && (c.dirty || c.touched);
    }

    onSubmit(): void {
        if (this.form.invalid || this.form.pristine) return;

        const cid = this.auth.getCustomerId();
        if (!cid) return;

        this.saving.set(true);

        this.auth.updateProfile(cid, {
            username: this.form.get('username')?.value,
            email: this.form.get('email')?.value
        }).subscribe({
            next: (updatedProfile: UserProfileResponse) => {
                this.saving.set(false);
                this.toast.success('Profile updated successfully!');
                this.form.patchValue(updatedProfile as any);
                this.form.markAsPristine();
            },
            error: (err: any) => {
                this.saving.set(false);
                this.toast.error(err?.error?.message ?? 'Failed to update profile.');
            }
        });
    }

    goBack(): void {
        if (this.auth.isAdmin()) {
            this.router.navigate(['/admin/products']);
        } else {
            this.router.navigate(['/shop']);
        }
    }
}
