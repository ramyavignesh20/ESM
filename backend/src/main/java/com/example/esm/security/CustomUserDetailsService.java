
package com.example.esm.security;

import com.example.esm.entity.User;
import com.example.esm.repo.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        User user = userRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "User not found: " + username
                        )
                );

        // Get role from database
        String role = user.getRole();

        // Default role
        if (role == null || role.isBlank()) {
            role = "USER";
        }

        // Normalize role
        role = role.trim().toUpperCase();

        // Ensure Spring Security authority format
        // ADMIN -> ROLE_ADMIN
        // USER  -> ROLE_USER
        if (!role.startsWith("ROLE_")) {
            role = "ROLE_" + role;
        }

        System.out.println("====================================");
        System.out.println("CUSTOM USER DETAILS");
        System.out.println("Username    : " + user.getUsername());
        System.out.println("DB Role     : " + user.getRole());
        System.out.println("Authority   : " + role);
        System.out.println("Active      : " + user.isActive());
        System.out.println("====================================");

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPassword())
                .authorities(
                        new SimpleGrantedAuthority(role)
                )
                .accountLocked(false)
                .accountExpired(false)
                .credentialsExpired(false)
                .disabled(!user.isActive())
                .build();
    }
}
