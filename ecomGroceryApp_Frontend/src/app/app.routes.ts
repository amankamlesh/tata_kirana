import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'register',
        loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent)
    },
    {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent)
    },
    {
        path: 'change-password',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/auth/change-password/change-password.component').then(m => m.ChangePasswordComponent)
    },
    {
        path: 'shop',
        loadComponent: () => import('./pages/shop/shop.component').then(m => m.ShopComponent)
    },
    {
        path: 'products/:id',
        loadComponent: () => import('./pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
    },
    {
        path: 'cart',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent)
    },
    {
        path: 'checkout',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent)
    },
    {
        path: 'orders',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/orders/order-list/order-list.component').then(m => m.OrderListComponent)
    },
    {
        path: 'orders/:id',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/orders/order-detail/order-detail.component').then(m => m.OrderDetailComponent)
    },
    {
        path: 'admin/products',
        canActivate: [adminGuard],
        loadComponent: () => import('./pages/admin/product-list/admin-product-list.component').then(m => m.AdminProductListComponent)
    },
    {
        path: 'admin/products/new',
        canActivate: [adminGuard],
        loadComponent: () => import('./pages/admin/product-form/product-form.component').then(m => m.ProductFormComponent)
    },
    {
        path: 'admin/products/:id/edit',
        canActivate: [adminGuard],
        loadComponent: () => import('./pages/admin/product-form/product-form.component').then(m => m.ProductFormComponent)
    },
    {
  path: 'admin/orders',
  canActivate: [adminGuard],   // same guard name as admin/products
  loadComponent: () =>
    import('./pages/admin/admin-order/admin-order.component').then(m => m.AdminOrdersComponent)
},
    {
        path: '**',
        loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent)
    }
];
