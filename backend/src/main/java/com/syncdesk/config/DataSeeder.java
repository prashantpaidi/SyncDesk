package com.syncdesk.config;

import com.syncdesk.entity.User;
import com.syncdesk.enums.Role;
import com.syncdesk.repository.TicketRepository;
import com.syncdesk.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@Profile("!prod")
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;
    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;

    private static final int TARGET_TICKET_COUNT = 500_000;

    @Override
    public void run(String... args) throws Exception {
        log.info("Checking database seeding status...");

        // 1. Ensure at least one admin user exists
        User admin = ensureAdminUserExists();

        // 2. Check ticket count
        long currentTickets = ticketRepository.count();
        log.info("Current ticket count: {}", currentTickets);

        if (currentTickets < TARGET_TICKET_COUNT) {
            int toGenerate = TARGET_TICKET_COUNT - (int) currentTickets;
            seedTickets(admin, toGenerate);
        } else {
            log.info("Database already seeded with {} tickets.", currentTickets);
        }

        // 3. Check comment count
        long currentComments = jdbcTemplate.queryForObject("SELECT count(*) FROM ticket_comments", Long.class);
        log.info("Current comment count: {}", currentComments);

        if (currentComments < TARGET_TICKET_COUNT * 2) {
            seedComments(admin);
        } else {
            log.info("Database already seeded with {} comments.", currentComments);
        }
    }

    private User ensureAdminUserExists() {
        Optional<User> adminOpt = userRepository.findByEmail("admin@syncdesk.com");
        if (adminOpt.isPresent()) {
            return adminOpt.get();
        }

        log.info("Creating default admin user...");
        User admin = User.builder()
                .email("admin@syncdesk.com")
                .password(passwordEncoder.encode("Admin@123"))
                .name("Default Administrator")
                .role(Role.ADMIN)
                .build();
        return userRepository.save(admin);
    }

    private void seedTickets(User creator, int count) {
        log.info("Seeding {} tickets using high-performance SQL...", count);
        long startTime = System.currentTimeMillis();

        String sql = """
            INSERT INTO tickets (title, description, status, priority, created_at, updated_at, created_by_id)
            SELECT\s
                'Sample Ticket ' || gs,
                'Auto-generated description for ticket ' || gs || '. This is primarily for performance testing of indexing and search capabilities.',
                (ARRAY['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REOPENED'])[floor(random() * 5 + 1)],
                (ARRAY['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])[floor(random() * 4 + 1)],
                NOW() - (random() * interval '30 days'),
                NOW(),
                ?
            FROM generate_series(1, ?) AS gs
            """;

        jdbcTemplate.update(sql, creator.getId(), count);

        long endTime = System.currentTimeMillis();
        log.info("Seeding completed in {} ms.", (endTime - startTime));
    }

    private void seedComments(User author) {
        log.info("Seeding comments using high-performance SQL...");
        long startTime = System.currentTimeMillis();

        String sql = """
            INSERT INTO ticket_comments (content, author_id, ticket_id, created_at, is_visible_to_user)
            SELECT\s
                'Automated comment ' || gs2 || ' for ticket ' || t.id,
                ?,
                t.id,
                NOW() - (random() * interval '7 days'),
                true
            FROM tickets t
            CROSS JOIN generate_series(1, 2) gs2
            WHERE NOT EXISTS (SELECT 1 FROM ticket_comments tc WHERE tc.ticket_id = t.id)
            """;

        jdbcTemplate.update(sql, author.getId());

        long endTime = System.currentTimeMillis();
        log.info("Comment seeding completed in {} ms.", (endTime - startTime));
    }
}
