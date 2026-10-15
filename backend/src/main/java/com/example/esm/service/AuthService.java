package com.example.esm.service;

import com.example.esm.dto.LoginRequest;
import com.example.esm.dto.RegisterRequest;
import com.example.esm.entity.User;
import com.example.esm.repo.UserRepository;
import com.example.esm.security.JwtService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;

import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;

    public String register(
            RegisterRequest request
    ) {

        if (userRepository.existsByUsername(
                request.username()
        )) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Username already exists"
            );
        }

        User user =
                User.builder()
                        .username(request.username())
                        .password(
                                passwordEncoder.encode(
                                        request.password()
                                )
                        )
                        .fullName(
                                request.fullName()
                        )
                        .role("USER")
                        .active(true)
                        .build();

        userRepository.save(user);

        return "Registration successful";
    }

    public Map<String, Object> login(
            LoginRequest request
    ) {

        User user =
                userRepository
                        .findByUsername(
                                request.username()
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.UNAUTHORIZED,
                                        "Invalid credentials"
                                )
                        );

        if (!user.isActive()) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Account is inactive"
            );
        }

        if (!passwordEncoder.matches(
                request.password(),
                user.getPassword()
        )) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid credentials"
            );
        }

        String token =
                jwtService.generate(
                        user.getUsername(),
                        user.getRole()
                );

        Map<String, Object> response =
                new HashMap<>();

        response.put(
                "token",
                token
        );

        response.put(
                "username",
                user.getUsername()
        );

        response.put(
                "fullName",
                user.getFullName()
        );

        response.put(
                "role",
                user.getRole()
        );

        return response;
    }
}