import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { CartRequest, CartResponse } from '../../models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartService {
private readonly API = 'https://api-gateway-u3au.onrender.com/api/cart';
    private _cart = signal<CartResponse | null>(null);
    readonly cart = this._cart.asReadonly();
    readonly cartCount = computed(() =>
        this._cart()?.cartItems?.reduce((sum, i) => sum + i.quantity, 0) ?? 0
    );

    constructor(private http: HttpClient) { }

    addToCart(req: CartRequest): Observable<CartResponse> {
        return this.http.post<CartResponse>(this.API, req).pipe(
            tap(res => this._cart.set(res))
        );
    }

    getCart(customerId: number): Observable<CartResponse> {
        return this.http.get<CartResponse>(`${this.API}/${customerId}`).pipe(
            tap(res => this._cart.set(res))
        );
    }

    updateQuantity(itemId: number, quantity: number): Observable<CartResponse> {
        const params = new HttpParams().set('quantity', quantity);
        return this.http.put<CartResponse>(`${this.API}/${itemId}`, null, { params }).pipe(
            tap(res => this._cart.set(res))
        );
    }

    removeItem(itemId: number): Observable<CartResponse> {
        return this.http.delete<CartResponse>(`${this.API}/${itemId}`).pipe(
            tap(res => this._cart.set(res))
        );
    }

    clearCart(): void {
        this._cart.set(null);
    }

    clearCartAPI(customerId: number): Observable<CartResponse> {
        return this.http.delete<CartResponse>(`${this.API}/clear/${customerId}`).pipe(
            tap(() => this._cart.set(null))
        );
    }
}
