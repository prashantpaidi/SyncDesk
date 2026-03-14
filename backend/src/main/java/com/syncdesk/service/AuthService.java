package com.syncdesk.service;

import com.syncdesk.dto.auth.AuthResponse;
import com.syncdesk.dto.auth.LoginRequest;
import com.syncdesk.dto.auth.RegisterRequest;
import com.syncdesk.enums.Role;
import com.syncdesk.entity.User;
import com.syncdesk.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        // Check if user already exists
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new RuntimeException("User with email already exists: " + request.email());
        }

        // Create user with default role if not provided
        Role userRole = request.role() != null ? request.role() : Role.CUSTOMER;

        var user = User.builder()
                .name(request.name())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(userRole)
                .build();

        userRepository.save(user);

        // Generate JWT token
        var jwtToken = jwtService.generateToken(user);
        return new AuthResponse(jwtToken, user.getRole().name(), user.getId(), user.getName());
    }

    public AuthResponse login(LoginRequest request) {
        // Authenticate user (validates password via AuthenticationManager)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()));

        // Load user and generate token
        var user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("User not found with email: " + request.email()));

        var jwtToken = jwtService.generateToken(user);
        return new AuthResponse(jwtToken, user.getRole().name(), user.getId(), user.getName());
    }
}