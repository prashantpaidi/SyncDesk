package com.syncdesk.config;

import com.syncdesk.entity.User;
import com.syncdesk.enums.Role;
import com.syncdesk.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Value("${admin.email:admin@syncdesk.com}")
    private String adminEmail;

    @Value("${admin.password:Admin@123}")
    private String adminPassword;

    @Value("${admin.name:Super Admin}")
    private String adminName;

    @Override
    public void run(String... args) {
        log.info("Checking for default admin account...");
        
        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            User adminUser = User.builder()
                    .name(adminName)
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .role(Role.ADMIN)
                    .build();

            userRepository.save(adminUser);
            log.info("Default admin account created successfully.");
        } else {
            log.info("Default admin account already exists.");
        }
    }
}
