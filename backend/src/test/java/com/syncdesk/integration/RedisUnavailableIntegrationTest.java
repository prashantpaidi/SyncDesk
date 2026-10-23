package com.syncdesk.integration;

import com.syncdesk.entity.User;
import com.syncdesk.enums.Role;
import com.syncdesk.enums.TicketPriority;
import com.syncdesk.enums.TicketStatus;
import com.syncdesk.support.AbstractIntegrationTest;
import com.syncdesk.support.TestUserFactory;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.test.context.TestPropertySource;
import tools.jackson.databind.JsonNode;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Verifies that the dashboard endpoint degrades gracefully when Redis is
 * unavailable: rather than failing the request, it falls through to PostgreSQL.
 *
 * <p>Redis is pointed at a closed port (no container is started) so the
 * connection genuinely fails, exercising the real {@code CacheErrorHandler}
 * rather than a mock.
 */
@TestPropertySource(properties = {
        "spring.data.redis.host=127.0.0.1",
        "spring.data.redis.port=6399"
})
class RedisUnavailableIntegrationTest extends AbstractIntegrationTest {

    @Test
    void dashboardIsServedFromDatabaseWhenRedisIsDown() throws Exception {
        User agent = users.create(Role.AGENT);
        users.create(Role.CUSTOMER);
        tickets.create(users.create(Role.CUSTOMER), TicketStatus.OPEN, TicketPriority.HIGH);
        String token = auth.login(agent.getEmail(), TestUserFactory.DEFAULT_PASSWORD);

        // No cache available: the request must still succeed and return real data.
        JsonNode body = jsonOf(mockMvc.perform(get("/api/dashboard/metrics")
                        .header(HttpHeaders.AUTHORIZATION, auth.bearer(token)))
                .andExpect(status().isOk())
                .andReturn());

        assertThat(body.path("totalTickets").asLong()).isEqualTo(1);
        assertThat(body.path("ticketsByStatus").path("OPEN").asLong()).isEqualTo(1);
    }
}
