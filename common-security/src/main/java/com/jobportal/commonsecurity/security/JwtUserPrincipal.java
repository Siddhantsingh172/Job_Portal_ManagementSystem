package com.jobportal.commonsecurity.security;

public class JwtUserPrincipal {

    private final Long userId;
    private final String email;
    private final String role;

    public JwtUserPrincipal(Long userId, String email, String role) {
        this.userId = userId;
        this.email = email;
        this.role = role;
    }

    public Long getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }
}
