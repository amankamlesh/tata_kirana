package com.tcs.grocery_auth_service.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tcs.grocery_auth_service.dto.AuthResponse;
import com.tcs.grocery_auth_service.dto.ChangePasswordRequest;
import com.tcs.grocery_auth_service.dto.LoginRequest;
import com.tcs.grocery_auth_service.dto.RegisterRequest;
import com.tcs.grocery_auth_service.dto.UserProfileResponse;
import com.tcs.grocery_auth_service.dto.UserProfileUpdateRequest;
import com.tcs.grocery_auth_service.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@Validated
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PutMapping("/change-password/{customerId}")
    public ResponseEntity<Map<String, Object>> changePassword(
            @PathVariable("customerId") Long customerId,
            @Valid @RequestBody ChangePasswordRequest request) {
        String message = authService.changePassword(customerId, request);
        Map<String, Object> body = new HashMap<>();
        body.put("customerId", customerId);
        body.put("message", message);
        return ResponseEntity.ok(body);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout() {
        Map<String, Object> body = new HashMap<>();
        body.put("message", "Logged out successfully");
        return ResponseEntity.ok(body);
    }

    @GetMapping("/profile/{customerId}")
    public ResponseEntity<UserProfileResponse> getProfile(@PathVariable("customerId") Long customerId) {
        return ResponseEntity.ok(authService.getProfile(customerId));
    }

    @PutMapping("/profile/{customerId}")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @PathVariable("customerId") Long customerId,
            @Valid @RequestBody UserProfileUpdateRequest request) {
        return ResponseEntity.ok(authService.updateProfile(customerId, request));
    }
}
