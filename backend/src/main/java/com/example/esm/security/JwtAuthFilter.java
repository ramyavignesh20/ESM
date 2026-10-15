package com.example.esm.security;

import com.example.esm.entity.User;
import com.example.esm.repo.UserRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import lombok.RequiredArgsConstructor;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {

        String path = request.getServletPath();

        return path.startsWith("/api/auth/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getServletPath();

        String authHeader = request.getHeader("Authorization");

        System.out.println();
        System.out.println("========== JWT FILTER ==========");
        System.out.println(
                "REQUEST = " +
                request.getMethod() +
                " " +
                path
        );

        System.out.println(
                "AUTH HEADER EXISTS = " +
                (authHeader != null)
        );

        // --------------------------------------------------
        // No Bearer token
        // --------------------------------------------------

        if (authHeader == null ||
                !authHeader.startsWith("Bearer ")) {

            System.out.println("NO BEARER TOKEN");

            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {

            // --------------------------------------------------
            // Extract username from JWT
            // --------------------------------------------------

            String username =
                    jwtService.extractUsername(token);

            System.out.println(
                    "JWT USERNAME = " +
                    username
            );

            // --------------------------------------------------
            // Do not replace an existing authentication
            // --------------------------------------------------

            Authentication existingAuthentication =
                    SecurityContextHolder
                            .getContext()
                            .getAuthentication();

            if (username == null ||
                    existingAuthentication != null) {

                filterChain.doFilter(request, response);
                return;
            }

            // --------------------------------------------------
            // Check user in database
            // --------------------------------------------------

            User user =
                    userRepository
                            .findByUsername(username)
                            .orElse(null);

            if (user == null) {

                System.out.println(
                        "USER NOT FOUND IN DATABASE"
                );

                filterChain.doFilter(request, response);
                return;
            }

            System.out.println(
                    "DB USERNAME = " +
                    user.getUsername()
            );

            System.out.println(
                    "DB ROLE = " +
                    user.getRole()
            );

            System.out.println(
                    "DB ACTIVE = " +
                    user.isActive()
            );

            // --------------------------------------------------
            // Load UserDetails through the central service
            // --------------------------------------------------

            UserDetails userDetails =
                    userDetailsService
                            .loadUserByUsername(username);

            System.out.println(
                    "USER DETAILS AUTHORITIES = " +
                    userDetails.getAuthorities()
            );

            // --------------------------------------------------
            // Validate JWT
            // --------------------------------------------------

            boolean valid =
                    jwtService.isTokenValid(
                            token,
                            userDetails
                    );

            System.out.println(
                    "TOKEN VALID = " +
                    valid
            );

            if (!valid) {

                System.out.println(
                        "JWT TOKEN INVALID"
                );

                SecurityContextHolder.clearContext();

                filterChain.doFilter(request, response);
                return;
            }

            // --------------------------------------------------
            // Create authentication
            // --------------------------------------------------

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );

            authentication.setDetails(
                    new WebAuthenticationDetailsSource()
                            .buildDetails(request)
            );

            // --------------------------------------------------
            // Store authentication in SecurityContext
            // --------------------------------------------------

            SecurityContextHolder
                    .getContext()
                    .setAuthentication(authentication);

            System.out.println(
                    "AUTHENTICATION SUCCESS"
            );

            System.out.println(
                    "FINAL USERNAME = " +
                    authentication.getName()
            );

            System.out.println(
                    "FINAL AUTHORITIES = " +
                    authentication.getAuthorities()
            );

            System.out.println(
                    "================================"
            );

        } catch (Exception e) {

            System.out.println(
                    "========== JWT ERROR =========="
            );

            System.out.println(
                    "ERROR = " +
                    e.getMessage()
            );

            e.printStackTrace();

            SecurityContextHolder.clearContext();
        }

        // --------------------------------------------------
        // Continue request
        // --------------------------------------------------

        filterChain.doFilter(request, response);
    }
}
