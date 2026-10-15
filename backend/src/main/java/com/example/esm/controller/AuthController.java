
package com.example.esm.controller;

import com.example.esm.dto.LoginRequest;
import com.example.esm.dto.RegisterRequest;
import com.example.esm.entity.User;
import com.example.esm.repo.UserRepository;
import com.example.esm.security.JwtService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import org.springframework.security.core.userdetails.UserDetails;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;


    // =========================================================
    // REGISTER
    // POST /api/auth/register
    // =========================================================

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @Valid @RequestBody RegisterRequest request) {

        // Check username
        if (userRepository.existsByUsername(request.username())) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Username already exists"
                    ));
        }

        // Check email
        if (userRepository.existsByEmail(request.email())) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Email already exists"
                    ));
        }

        if (userRepository.existsByMobile(request.mobile())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Mobile number already exists"));
        }

        // Create user
        User user = User.builder()
                .username(request.username())
                .password(
                        passwordEncoder.encode(
                                request.password()
                        )
                )
                .email(request.email())
                .mobile(request.mobile())
                .fullName(request.fullName())
                .role("USER")
                .active(true)
                .build();

        userRepository.save(user);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Registration successful"
                )
        );
    }


    // =========================================================
    // LOGIN
    // POST /api/auth/login
    // =========================================================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest request) {

        // Authenticate username + password
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.username(),
                        request.password()
                )
        );

        // Find user
        User user = userRepository
                .findByUsername(request.username())
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );
        String role = normalizeRole(user.getRole());

        // Build Spring Security UserDetails
        UserDetails userDetails =
                org.springframework.security.core.userdetails.User
                        .withUsername(user.getUsername())
                        .password(user.getPassword())
                        .authorities("ROLE_" + role)
                        .disabled(!user.isActive())
                        .build();

        // Generate JWT
        String token =
                jwtService.generateToken(userDetails);

        // Return login response
        return ResponseEntity.ok(
                Map.of(
                        "token", token,
                        "userId", user.getId(),
                        "username", user.getUsername(),
                        "fullName", user.getFullName(),
                        "role", role
                )
        );
    }

    private String normalizeRole(String role) {
        if (role == null || role.isBlank()) {
            return "USER";
        }

        String normalized = role.trim().toUpperCase();
        return normalized.startsWith("ROLE_")
                ? normalized.substring("ROLE_".length())
                : normalized;
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, String>> handleAuthenticationFailure() {
        return ResponseEntity.status(401)
                .body(Map.of("message", "Invalid username or password"));
    }
}
