package com.tcs.grocery_auth_service.service;

import com.tcs.grocery_auth_service.dto.AuthResponse;
import com.tcs.grocery_auth_service.dto.ChangePasswordRequest;
import com.tcs.grocery_auth_service.dto.LoginRequest;
import com.tcs.grocery_auth_service.dto.RegisterRequest;
import com.tcs.grocery_auth_service.dto.UserProfileResponse;
import com.tcs.grocery_auth_service.dto.UserProfileUpdateRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    String changePassword(Long customerId, ChangePasswordRequest request);

    UserProfileResponse getProfile(Long customerId);

    UserProfileResponse updateProfile(Long customerId, UserProfileUpdateRequest request);
}
