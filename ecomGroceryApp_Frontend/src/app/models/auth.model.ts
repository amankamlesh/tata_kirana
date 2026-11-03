export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    role: 'CUSTOMER' | 'ADMIN';
}

export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
}

export interface UserProfileResponse {
    id: number;
    username: string;
    email: string;
    role: string;
}

export interface UserProfileUpdateRequest {
    username: string;
    email: string;
}

export interface AuthResponse {
    token: string;
    username: string;
    role: string;
    customerId: number;
}

export interface CurrentUser {
    token: string;
    username: string;
    role: string;
    customerId: number | null;
}
