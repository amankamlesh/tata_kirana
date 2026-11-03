package com.tcs.grocery_auth_service.service;

import java.util.Locale;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tcs.grocery_auth_service.dto.AuthResponse;
import com.tcs.grocery_auth_service.dto.ChangePasswordRequest;
import com.tcs.grocery_auth_service.dto.LoginRequest;
import com.tcs.grocery_auth_service.dto.RegisterRequest;
import com.tcs.grocery_auth_service.dto.UserProfileResponse;
import com.tcs.grocery_auth_service.dto.UserProfileUpdateRequest;
import com.tcs.grocery_auth_service.exception.BadRequestException;
import com.tcs.grocery_auth_service.exception.ConflictException;
import com.tcs.grocery_auth_service.exception.NotFoundException;
import com.tcs.grocery_auth_service.model.User;
import com.tcs.grocery_auth_service.repository.UserRepository;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;

    public AuthServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        userRepository.findByUsername(request.getUsername())
                .ifPresent(u -> {
                    throw new ConflictException("Username already exists");
                });

        userRepository.findByEmail(request.getEmail())
                .ifPresent(u -> {
                    throw new ConflictException("Email already exists");
                });

        String role = normalizeRole(request.getRole());

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword()); // plain text by request (no JWT/security layer)
        user.setRole(role);

        User saved = userRepository.save(user);
        return new AuthResponse(generateToken(), saved.getUsername(), saved.getRole(), saved.getId());
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new BadRequestException("Invalid password");
        }

        return new AuthResponse(generateToken(), user.getUsername(), user.getRole(), user.getId());
    }

    @Override
    @Transactional
    public String changePassword(Long customerId, ChangePasswordRequest request) {
        User user = userRepository.findById(customerId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (!user.getPassword().equals(request.getOldPassword())) {
            throw new BadRequestException("Old password is incorrect");
        }

        user.setPassword(request.getNewPassword());
        userRepository.save(user);
        return "Password changed successfully";
    }

    @Override
    public UserProfileResponse getProfile(Long customerId) {
        User user = userRepository.findById(customerId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        return new UserProfileResponse(user.getId(), user.getUsername(), user.getEmail(), user.getRole());
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(Long customerId, UserProfileUpdateRequest request) {
        User user = userRepository.findById(customerId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (!user.getUsername().equals(request.getUsername())) {
            userRepository.findByUsername(request.getUsername())
                    .ifPresent(u -> {
                        throw new ConflictException("Username already exists");
                    });
            user.setUsername(request.getUsername());
        }

        if (!user.getEmail().equals(request.getEmail())) {
            userRepository.findByEmail(request.getEmail())
                    .ifPresent(u -> {
                        throw new ConflictException("Email already exists");
                    });
            user.setEmail(request.getEmail());
        }

        User saved = userRepository.save(user);
        return new UserProfileResponse(saved.getId(), saved.getUsername(), saved.getEmail(), saved.getRole());
    }

    private static String generateToken() {
        return UUID.randomUUID().toString();
    }

    private static String normalizeRole(String role) {
        if (role == null) {
            return "CUSTOMER";
        }
        String r = role.trim().toUpperCase(Locale.ROOT);
        if (r.isEmpty()) {
            return "CUSTOMER";
        }
        return r;
    }
}
