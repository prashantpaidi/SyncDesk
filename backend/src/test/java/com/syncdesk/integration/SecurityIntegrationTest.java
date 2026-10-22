package com.syncdesk.integration;

import com.syncdesk.entity.Ticket;
import com.syncdesk.entity.User;
import com.syncdesk.enums.Role;
import com.syncdesk.enums.TicketPriority;
import com.syncdesk.enums.TicketStatus;
import com.syncdesk.support.AbstractIntegrationTest;
import com.syncdesk.support.TestUserFactory;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Role based access control tests.
 *
 * <p>Role rules live in {@code TicketService.updateTicketStatus}: agents and
 * managers may resolve/reopen tickets, only customers may close a resolved
 * ticket. These tests assert the resulting 401 / 403 / 200 behaviour through the
 * real filter chain rather than the service in isolation, and check that a
 * rejected transition leaves the ticket untouched in PostgreSQL.
 */
class SecurityIntegrationTest extends AbstractIntegrationTest {

    private static final String RESOLVE_DENIED = "Only Agents and Managers can resolve tickets.";
    private static final String CLOSE_DENIED = "Only Customers can close tickets.";

    @Test
    void unauthenticatedRequest_isRejectedWith401() throws Exception {
        mockMvc.perform(get("/api/tickets"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void requestWithMalformedJwt_isRejectedWith401() throws Exception {
        mockMvc.perform(get("/api/tickets")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer not.a.valid.jwt"))
                .andExpect(status().isUnauthorized());
    }

    // ADMIN is deliberately not granted ticket transitions: TicketService allows
    // only AGENT/MANAGER to resolve and only CUSTOMER to close. This differs from
    // the role table in api_docs.md for PATCH /api/tickets/{id}/status.
    @ParameterizedTest(name = "{0} resolving an OPEN ticket -> HTTP {1}")
    @CsvSource({
            "AGENT,    200",
            "MANAGER,  200",
            "ADMIN,    403",
            "CUSTOMER, 403"
    })
    void resolveTicket_isRestrictedToAgentsAndManagers(Role actorRole, int expectedStatus) throws Exception {
        User actor = users.create(actorRole);
        Ticket ticket = tickets.openTicketFor(actor);
        String token = auth.login(actor.getEmail(), TestUserFactory.DEFAULT_PASSWORD);

        MvcResult result = mockMvc.perform(patch("/api/tickets/{id}/status", ticket.getId())
                        .header(HttpHeaders.AUTHORIZATION, auth.bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(statusBody("RESOLVED")))
                .andExpect(status().is(expectedStatus))
                .andReturn();

        if (expectedStatus == 200) {
            assertThat(jsonOf(result).path("status").asString()).isEqualTo("RESOLVED");
            assertThat(statusInDatabase(ticket.getId())).isEqualTo("RESOLVED");
        } else {
            assertThat(jsonOf(result).path("message").asString()).isEqualTo(RESOLVE_DENIED);
            assertThat(statusInDatabase(ticket.getId())).isEqualTo("OPEN");
        }
    }

    @ParameterizedTest(name = "{0} closing a RESOLVED ticket -> HTTP {1}")
    @CsvSource({
            "CUSTOMER, 200",
            "AGENT,    403",
            "MANAGER,  403",
            "ADMIN,    403"
    })
    void closeTicket_isRestrictedToCustomers(Role actorRole, int expectedStatus) throws Exception {
        User actor = users.create(actorRole);
        Ticket ticket = tickets.create(actor, TicketStatus.RESOLVED, TicketPriority.MEDIUM);
        String token = auth.login(actor.getEmail(), TestUserFactory.DEFAULT_PASSWORD);

        MvcResult result = mockMvc.perform(patch("/api/tickets/{id}/status", ticket.getId())
                        .header(HttpHeaders.AUTHORIZATION, auth.bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(statusBody("CLOSED")))
                .andExpect(status().is(expectedStatus))
                .andReturn();

        if (expectedStatus == 200) {
            assertThat(jsonOf(result).path("status").asString()).isEqualTo("CLOSED");
            assertThat(statusInDatabase(ticket.getId())).isEqualTo("CLOSED");
        } else {
            assertThat(jsonOf(result).path("message").asString()).isEqualTo(CLOSE_DENIED);
            assertThat(statusInDatabase(ticket.getId())).isEqualTo("RESOLVED");
        }
    }

    private String statusBody(String status) {
        return jsonMapper.writeValueAsString(Map.of("status", status));
    }

    private String statusInDatabase(Long ticketId) {
        // Flush the pending UPDATE so the JDBC read observes what was written.
        entityManager.flush();
        return jdbcTemplate.queryForObject("SELECT status FROM tickets WHERE id = ?", String.class, ticketId);
    }
}
