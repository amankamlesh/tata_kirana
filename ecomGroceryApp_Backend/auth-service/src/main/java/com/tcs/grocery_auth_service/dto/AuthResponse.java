package com.tcs.grocery_auth_service.dto;

public class AuthResponse {

    private String token;
    private String username;
    private String role;
    private Long customerId;

    public AuthResponse() {
    }

    public AuthResponse(String token, String username, String role, Long customerId) {
        this.token = token;
        this.username = username;
        this.role = role;
        this.customerId = customerId;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }
}
