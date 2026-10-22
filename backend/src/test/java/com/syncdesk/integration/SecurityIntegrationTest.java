package com.syncdesk.integration;

import com.syncdesk.entity.Ticket;
import com.syncdesk.entity.User;
import com.syncdesk.enums.Role;
import com.syncdesk.enums.TicketPriority;
import com.syncdesk.enums.TicketStatus;
import com.syncdesk.support.AbstractIntegrationTest;
import com.syncdesk.support.TestUserFactory;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import tools.jackson.databind.JsonNode;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Role based access control tests.
 *
 * <p>Role rules live in {@code TicketService.updateTicketStatus}: agents and
 * managers may resolve/reopen tickets, only customers may close a resolved
 * ticket. These tests assert the resulting 401 / 403 / 200 behaviour through the
 * real filter chain rather than the service in isolation.
 */
class SecurityIntegrationTest extends AbstractIntegrationTest {

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

    @Test
    void agentToken_canResolveOpenTicket() throws Exception {
        User customer = users.create(Role.CUSTOMER);
        User agent = users.create(Role.AGENT);
        Ticket ticket = tickets.openTicketFor(customer);
        String agentToken = auth.login(agent.getEmail(), TestUserFactory.DEFAULT_PASSWORD);

        JsonNode body = jsonOf(mockMvc.perform(patch("/api/tickets/{id}/status", ticket.getId())
                        .header(HttpHeaders.AUTHORIZATION, auth.bearer(agentToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(statusBody("RESOLVED")))
                .andExpect(status().isOk())
                .andReturn());

        assertThat(body.path("status").asString()).isEqualTo("RESOLVED");
    }

    @Test
    void customerToken_cannotResolveTicket() throws Exception {
        User customer = users.create(Role.CUSTOMER);
        Ticket ticket = tickets.openTicketFor(customer);
        String customerToken = auth.login(customer.getEmail(), TestUserFactory.DEFAULT_PASSWORD);

        // The customer presents their own, perfectly valid JWT - it must not grant
        // the agent/manager privilege of resolving a ticket.
        mockMvc.perform(patch("/api/tickets/{id}/status", ticket.getId())
                        .header(HttpHeaders.AUTHORIZATION, auth.bearer(customerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(statusBody("RESOLVED")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Only Agents and Managers can resolve tickets."));

        assertThat(statusInDatabase(ticket.getId())).isEqualTo("OPEN");
    }

    @Test
    void customerToken_canCloseResolvedTicket() throws Exception {
        User customer = users.create(Role.CUSTOMER);
        Ticket ticket = tickets.create(customer, TicketStatus.RESOLVED, TicketPriority.MEDIUM);
        String customerToken = auth.login(customer.getEmail(), TestUserFactory.DEFAULT_PASSWORD);

        JsonNode body = jsonOf(mockMvc.perform(patch("/api/tickets/{id}/status", ticket.getId())
                        .header(HttpHeaders.AUTHORIZATION, auth.bearer(customerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(statusBody("CLOSED")))
                .andExpect(status().isOk())
                .andReturn());

        assertThat(body.path("status").asString()).isEqualTo("CLOSED");
        assertThat(statusInDatabase(ticket.getId())).isEqualTo("CLOSED");
    }

    @Test
    void agentToken_cannotCloseResolvedTicket() throws Exception {
        User customer = users.create(Role.CUSTOMER);
        User agent = users.create(Role.AGENT);
        Ticket ticket = tickets.create(customer, TicketStatus.RESOLVED, TicketPriority.MEDIUM);
        String agentToken = auth.login(agent.getEmail(), TestUserFactory.DEFAULT_PASSWORD);

        mockMvc.perform(patch("/api/tickets/{id}/status", ticket.getId())
                        .header(HttpHeaders.AUTHORIZATION, auth.bearer(agentToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(statusBody("CLOSED")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Only Customers can close tickets."));

        assertThat(statusInDatabase(ticket.getId())).isEqualTo("RESOLVED");
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
