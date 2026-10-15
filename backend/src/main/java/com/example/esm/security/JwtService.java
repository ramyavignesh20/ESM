package com.example.esm.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiration:86400000}")
    private long jwtExpiration;

    /**
     * Generate JWT token using username and role.
     */
    public String generate(String username, String role) {

        String normalizedRole = normalizeRole(role);

        Map<String, Object> claims = new HashMap<>();
        claims.put("role", normalizedRole);

        Date issuedAt = new Date();
        Date expiration =
                new Date(issuedAt.getTime() + jwtExpiration);

        return Jwts.builder()
                .claims(claims)
                .subject(username)
                .issuedAt(issuedAt)
                .expiration(expiration)
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Generate JWT token from Spring Security UserDetails.
     */
    public String generateToken(UserDetails userDetails) {

        String role = userDetails.getAuthorities()
                .stream()
                .findFirst()
                .map(authority -> authority.getAuthority())
                .orElse("ROLE_USER");

        return generate(
                userDetails.getUsername(),
                role
        );
    }

    /**
     * Extract username from JWT.
     */
    public String extractUsername(String token) {
        return extractClaim(
                token,
                Claims::getSubject
        );
    }

    /**
     * Extract role from JWT.
     */
    public String extractRole(String token) {

        String role = extractClaim(
                token,
                claims -> claims.get("role", String.class)
        );

        return normalizeRole(role);
    }

    /**
     * Extract any claim from JWT.
     */
    public <T> T extractClaim(
            String token,
            Function<Claims, T> claimsResolver) {

        Claims claims = extractAllClaims(token);

        return claimsResolver.apply(claims);
    }

    /**
     * Parse and verify JWT.
     */
    private Claims extractAllClaims(String token) {

        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Check whether JWT is expired.
     */
    private boolean isTokenExpired(String token) {

        return extractExpiration(token)
                .before(new Date());
    }

    /**
     * Extract expiration date.
     */
    private Date extractExpiration(String token) {

        return extractClaim(
                token,
                Claims::getExpiration
        );
    }

    /**
     * Validate JWT against UserDetails.
     */
    public boolean isTokenValid(
            String token,
            UserDetails userDetails) {

        try {

            String username = extractUsername(token);

            return username != null
                    && username.equals(userDetails.getUsername())
                    && !isTokenExpired(token)
                    && userDetails.isEnabled();

        } catch (Exception e) {

            System.out.println(
                    "JWT VALIDATION ERROR = "
                            + e.getMessage()
            );

            return false;
        }
    }

    /**
     * Normalize roles so that they are always:
     *
     * ROLE_ADMIN
     * ROLE_USER
     */
    private String normalizeRole(String role) {

        if (role == null || role.isBlank()) {
            return "ROLE_USER";
        }

        String normalized = role
                .trim()
                .toUpperCase();

        if (!normalized.startsWith("ROLE_")) {
            normalized = "ROLE_" + normalized;
        }

        return normalized;
    }

    /**
     * Create signing key from configured secret.
     */
    private SecretKey getSigningKey() {

        byte[] keyBytes =
                secret.getBytes(StandardCharsets.UTF_8);

        return Keys.hmacShaKeyFor(keyBytes);
    }
}