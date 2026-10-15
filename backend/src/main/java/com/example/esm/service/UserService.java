package com.example.esm.service;

import com.example.esm.entity.User;
import com.example.esm.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // =========================================================
    // GET ALL USERS
    // =========================================================
    @Transactional(readOnly = true)
    public List<User> getAllUsers() {

        return userRepository.findAll();
    }

    // =========================================================
    // GET ACTIVE USERS
    // =========================================================
    @Transactional(readOnly = true)
    public List<User> getActiveUsers() {

        return userRepository.findByActiveTrue();
    }

    // =========================================================
    // GET USER BY ID
    // =========================================================
    @Transactional(readOnly = true)
    public User getUserById(Long id) {

        return userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with id: " + id
                        )
                );
    }

    // =========================================================
    // GET USER BY USERNAME
    // =========================================================
    @Transactional(readOnly = true)
    public User getUserByUsername(String username) {

        return userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found: " + username
                        )
                );
    }

    // =========================================================
    // CREATE USER
    // =========================================================
    public User createUser(User user) {

        if (user.getUsername() == null ||
                user.getUsername().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Username is required"
            );
        }

        if (user.getEmail() == null ||
                user.getEmail().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Email is required"
            );
        }

        if (user.getPassword() == null ||
                user.getPassword().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Password is required"
            );
        }

        if (userRepository.existsByUsername(
                user.getUsername().trim())) {

            throw new IllegalArgumentException(
                    "Username already exists"
            );
        }

        if (userRepository.existsByEmail(
                user.getEmail().trim())) {

            throw new IllegalArgumentException(
                    "Email already exists"
            );
        }

        user.setUsername(user.getUsername().trim());
        user.setEmail(user.getEmail().trim());

        user.setPassword(
                passwordEncoder.encode(user.getPassword())
        );

        if (user.getRole() == null ||
                user.getRole().trim().isEmpty()) {

            user.setRole("USER");

        } else {

            user.setRole(
                    user.getRole().trim().toUpperCase()
            );
        }

        if (!user.isActive()) {
            user.setActive(true);
        }

        return userRepository.save(user);
    }

    // =========================================================
    // UPDATE USER
    // =========================================================
    public User updateUser(Long id, User request) {

        User existingUser = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with id: " + id
                        )
                );

        // -----------------------------------------
        // Username
        // -----------------------------------------
        if (request.getUsername() != null &&
                !request.getUsername().trim().isEmpty()) {

            String username =
                    request.getUsername().trim();

            if (!username.equals(existingUser.getUsername()) &&
                    userRepository.existsByUsername(username)) {

                throw new IllegalArgumentException(
                        "Username already exists"
                );
            }

            existingUser.setUsername(username);
        }

        // -----------------------------------------
        // Email
        // -----------------------------------------
        if (request.getEmail() != null &&
                !request.getEmail().trim().isEmpty()) {

            String email =
                    request.getEmail().trim();

            if (!email.equals(existingUser.getEmail()) &&
                    userRepository.existsByEmail(email)) {

                throw new IllegalArgumentException(
                        "Email already exists"
                );
            }

            existingUser.setEmail(email);
        }

        // -----------------------------------------
        // Full name
        // -----------------------------------------
        if (request.getFullName() != null) {

            existingUser.setFullName(
                    request.getFullName().trim()
            );
        }

        // -----------------------------------------
        // Mobile
        // -----------------------------------------
        if (request.getMobile() != null) {

            existingUser.setMobile(
                    request.getMobile().trim()
            );
        }

        // -----------------------------------------
        // Role
        // -----------------------------------------
        if (request.getRole() != null &&
                !request.getRole().trim().isEmpty()) {

            existingUser.setRole(
                    request.getRole()
                            .trim()
                            .toUpperCase()
            );
        }

        // -----------------------------------------
        // Active status
        // -----------------------------------------
        existingUser.setActive(request.isActive());

        // -----------------------------------------
        // Password
        // Only change when a new password is supplied
        // -----------------------------------------
        if (request.getPassword() != null &&
                !request.getPassword().trim().isEmpty()) {

            existingUser.setPassword(
                    passwordEncoder.encode(
                            request.getPassword()
                    )
            );
        }

        return userRepository.save(existingUser);
    }

    // =========================================================
    // DELETE USER
    // =========================================================
    public void deleteUser(Long id) {

        if (!userRepository.existsById(id)) {

            throw new RuntimeException(
                    "User not found with id: " + id
            );
        }

        userRepository.deleteById(id);
    }

    // =========================================================
    // DEACTIVATE USER
    // =========================================================
    public User deactivateUser(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with id: " + id
                        )
                );

        user.setActive(false);

        return userRepository.save(user);
    }

    // =========================================================
    // ACTIVATE USER
    // =========================================================
    public User activateUser(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with id: " + id
                        )
                );

        user.setActive(true);

        return userRepository.save(user);
    }
}