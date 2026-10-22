package com.syncdesk.support;

import com.syncdesk.entity.User;
import com.syncdesk.enums.Role;
import com.syncdesk.repository.UserRepository;

import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Creates persisted {@link User}s for integration tests.
 *
 * <p>Passwords are encoded with the application's real {@link PasswordEncoder},
 * so the users it produces can authenticate through the normal login endpoint.
 * Emails are made unique per JVM run so tests never collide on the
 * {@code users.email} unique constraint.
 */
public class TestUserFactory {

    public static final String DEFAULT_PASSWORD = "Syncdesk123!";

    private static final AtomicInteger SEQUENCE = new AtomicInteger();

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public TestUserFactory(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User create(Role role) {
        return create(role, generateEmail(role), DEFAULT_PASSWORD);
    }

    public User create(Role role, String email) {
        return create(role, email, DEFAULT_PASSWORD);
    }

    public User create(Role role, String email, String rawPassword) {
        User user = User.builder()
                .name("Test " + role.name().charAt(0) + role.name().substring(1).toLowerCase())
                .email(email)
                .password(passwordEncoder.encode(rawPassword))
                .role(role)
                .build();
        return userRepository.saveAndFlush(user);
    }

    private String generateEmail(Role role) {
        return role.name().toLowerCase() + SEQUENCE.incrementAndGet() + "@syncdesk.test";
    }
}
