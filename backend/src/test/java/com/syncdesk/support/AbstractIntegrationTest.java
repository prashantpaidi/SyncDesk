package com.syncdesk.support;

import com.syncdesk.repository.TicketCommentRepository;
import com.syncdesk.repository.TicketRepository;
import com.syncdesk.repository.UserRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.nio.charset.StandardCharsets;

/**
 * Base class for the backend integration test suite.
 *
 * <p>Boots the full application (controllers, Spring Security, services,
 * repositories) against a real PostgreSQL container and exercises it through
 * MockMvc, so a single test can cover
 * controller → security → service → repository → PostgreSQL.
 *
 * <p>Each test runs inside a transaction that is rolled back afterwards, which
 * keeps tests independent of execution order and of each other's data.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(PostgresTestContainerConfig.class)
@Transactional
public abstract class AbstractIntegrationTest {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected JsonMapper jsonMapper;

    @Autowired
    protected UserRepository userRepository;

    @Autowired
    protected TicketRepository ticketRepository;

    @Autowired
    protected TicketCommentRepository ticketCommentRepository;

    @Autowired
    protected PasswordEncoder passwordEncoder;

    @Autowired
    protected JdbcTemplate jdbcTemplate;

    @Autowired
    protected EntityManager entityManager;

    protected TestUserFactory users;

    protected TestTicketFactory tickets;

    protected TestAuthHelper auth;

    @BeforeEach
    void initialiseTestHelpers() {
        this.users = new TestUserFactory(userRepository, passwordEncoder);
        this.tickets = new TestTicketFactory(ticketRepository);
        this.auth = new TestAuthHelper(mockMvc, jsonMapper);
    }

    /**
     * Reads a completed response body as text, for assertions about what a
     * response does (or does not) leak.
     */
    protected String bodyOf(MvcResult result) {
        return new String(result.getResponse().getContentAsByteArray(), StandardCharsets.UTF_8);
    }

    /**
     * Reads a completed response body as JSON, keeping numeric assertions free of
     * the int/long mismatch that {@code jsonPath(...).value(...)} can introduce.
     */
    protected JsonNode jsonOf(MvcResult result) {
        return jsonMapper.readTree(bodyOf(result));
    }
}
