import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (auth.isLoggedIn() && auth.isAdmin()) return true;
    if (!auth.isLoggedIn()) {
        router.navigate(['/login']);
    } else {
        router.navigate(['/shop']);
    }
    return false;
};
