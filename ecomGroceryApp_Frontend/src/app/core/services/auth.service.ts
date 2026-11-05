import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import {
    AuthResponse, LoginRequest, RegisterRequest, ChangePasswordRequest, CurrentUser,
    UserProfileResponse, UserProfileUpdateRequest
} from '../../models/auth.model';

const AUTH_KEY = 'fm_auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly API = 'https://api-gateway-u3au.onrender.com/api/auth';

    private _user = signal<CurrentUser | null>(this.loadFromStorage());
    readonly currentUser = this._user.asReadonly();
    readonly isLoggedIn = computed(() => !!this._user());
    readonly isAdmin = computed(() => this._user()?.role === 'ADMIN');

    constructor(private http: HttpClient, private router: Router) { }

    private loadFromStorage(): CurrentUser | null {
        const raw = localStorage.getItem(AUTH_KEY);
        return raw ? (JSON.parse(raw) as CurrentUser) : null;
    }

    private persist(user: CurrentUser): void {
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
        this._user.set(user);
    }

    register(req: RegisterRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.API}/register`, req).pipe(
            tap(res => {
                this.persist({ token: res.token, username: res.username, role: res.role, customerId: res.customerId });
            })
        );
    }

    login(req: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.API}/login`, req).pipe(
            tap(res => {
                this.persist({
                    token: res.token,
                    username: res.username,
                    role: res.role,
                    customerId: res.customerId
                });
            })
        );
    }

    logout(): void {
        this.http.post(`${this.API}/logout`, {}).subscribe({ error: () => { } });
        localStorage.removeItem(AUTH_KEY);
        this._user.set(null);
        this.router.navigate(['/login']);
    }

    changePassword(customerId: number, req: ChangePasswordRequest): Observable<any> {
        return this.http.put(`${this.API}/change-password/${customerId}`, req);
    }

    getProfile(customerId: number): Observable<UserProfileResponse> {
        return this.http.get<UserProfileResponse>(`${this.API}/profile/${customerId}`);
    }

    updateProfile(customerId: number, req: UserProfileUpdateRequest): Observable<UserProfileResponse> {
        return this.http.put<UserProfileResponse>(`${this.API}/profile/${customerId}`, req).pipe(
            tap(res => {
                const u = this._user();
                if (u) {
                    this.persist({ ...u, username: res.username, role: res.role });
                }
            })
        );
    }

    getToken(): string | null {
        return this._user()?.token ?? null;
    }

    setCustomerId(id: number): void {
        const u = this._user();
        if (u) this.persist({ ...u, customerId: id });
    }

    getCustomerId(): number | null {
        return this._user()?.customerId ?? null;
    }
}
