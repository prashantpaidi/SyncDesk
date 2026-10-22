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

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * End-to-end tests for the primary ticket workflow, exercising
 * controller -> security -> service -> repository -> PostgreSQL in one request.
 */
class TicketIntegrationTest extends AbstractIntegrationTest {

    @Test
    void createTicket_persistsTicketAndReturns201() throws Exception {
        User customer = users.create(Role.CUSTOMER);
        String token = auth.login(customer.getEmail(), TestUserFactory.DEFAULT_PASSWORD);

        JsonNode body = jsonOf(mockMvc.perform(post("/api/tickets")
                        .header(HttpHeaders.AUTHORIZATION, auth.bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(Map.of(
                                "title", "Printer is on fire",
                                "description", "The office printer is smoking",
                                "priority", "HIGH"))))
                .andExpect(status().isCreated())
                .andReturn());

        long ticketId = body.path("id").asLong();
        assertThat(ticketId).isPositive();
        assertThat(body.path("status").asString()).isEqualTo("OPEN");
        assertThat(body.path("priority").asString()).isEqualTo("HIGH");
        assertThat(body.path("createdById").asLong()).isEqualTo(customer.getId());
        assertThat(body.path("createdByName").asString()).isEqualTo(customer.getName());

        Map<String, Object> persisted = jdbcTemplate.queryForMap(
                "SELECT title, status, priority, created_by_id FROM tickets WHERE id = ?", ticketId);
        assertThat(persisted)
                .containsEntry("title", "Printer is on fire")
                .containsEntry("status", "OPEN")
                .containsEntry("priority", "HIGH")
                .containsEntry("created_by_id", customer.getId());
    }

    @Test
    void createTicket_withBlankTitle_isRejectedByValidation() throws Exception {
        User customer = users.create(Role.CUSTOMER);
        String token = auth.login(customer.getEmail(), TestUserFactory.DEFAULT_PASSWORD);

        mockMvc.perform(post("/api/tickets")
                        .header(HttpHeaders.AUTHORIZATION, auth.bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(Map.of(
                                "title", "",
                                "description", "No title provided"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("must not be blank"));

        assertThat(ticketRepository.count()).isZero();
    }

    @Test
    void getTicketById_returnsPersistedTicket() throws Exception {
        User customer = users.create(Role.CUSTOMER);
        Ticket ticket = tickets.create(customer, TicketStatus.IN_PROGRESS, TicketPriority.CRITICAL);
        String token = auth.login(customer.getEmail(), TestUserFactory.DEFAULT_PASSWORD);

        JsonNode body = jsonOf(mockMvc.perform(get("/api/tickets/{id}", ticket.getId())
                        .header(HttpHeaders.AUTHORIZATION, auth.bearer(token)))
                .andExpect(status().isOk())
                .andReturn());

        assertThat(body.path("id").asLong()).isEqualTo(ticket.getId());
        assertThat(body.path("title").asString()).isEqualTo(ticket.getTitle());
        assertThat(body.path("description").asString()).isEqualTo(ticket.getDescription());
        assertThat(body.path("status").asString()).isEqualTo("IN_PROGRESS");
        assertThat(body.path("priority").asString()).isEqualTo("CRITICAL");
        assertThat(body.path("createdById").asLong()).isEqualTo(customer.getId());
    }

    @Test
    void getTicketById_whenTicketDoesNotExist_isRejected() throws Exception {
        User customer = users.create(Role.CUSTOMER);
        String token = auth.login(customer.getEmail(), TestUserFactory.DEFAULT_PASSWORD);

        mockMvc.perform(get("/api/tickets/{id}", 9_999_999L)
                        .header(HttpHeaders.AUTHORIZATION, auth.bearer(token)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Ticket not found with id: 9999999"));
    }

    @Test
    void updateTicketStatus_persistsNewStatus() throws Exception {
        User customer = users.create(Role.CUSTOMER);
        User agent = users.create(Role.AGENT);
        Ticket ticket = tickets.openTicketFor(customer);
        String agentToken = auth.login(agent.getEmail(), TestUserFactory.DEFAULT_PASSWORD);

        mockMvc.perform(patch("/api/tickets/{id}/status", ticket.getId())
                        .header(HttpHeaders.AUTHORIZATION, auth.bearer(agentToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(Map.of("status", "RESOLVED"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RESOLVED"));

        // Flush the pending UPDATE so the JDBC read observes what was written.
        entityManager.flush();
        assertThat(jdbcTemplate.queryForObject(
                "SELECT status FROM tickets WHERE id = ?", String.class, ticket.getId())).isEqualTo("RESOLVED");

        JsonNode reloaded = jsonOf(mockMvc.perform(get("/api/tickets/{id}", ticket.getId())
                        .header(HttpHeaders.AUTHORIZATION, auth.bearer(agentToken)))
                .andExpect(status().isOk())
                .andReturn());
        assertThat(reloaded.path("status").asString()).isEqualTo("RESOLVED");
    }

    @Test
    void updateTicketStatus_ofClosedTicket_isRejected() throws Exception {
        User customer = users.create(Role.CUSTOMER);
        User agent = users.create(Role.AGENT);
        Ticket ticket = tickets.create(customer, TicketStatus.CLOSED, TicketPriority.LOW);
        String agentToken = auth.login(agent.getEmail(), TestUserFactory.DEFAULT_PASSWORD);

        mockMvc.perform(patch("/api/tickets/{id}/status", ticket.getId())
                        .header(HttpHeaders.AUTHORIZATION, auth.bearer(agentToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(Map.of("status", "IN_PROGRESS"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Cannot change status of a CLOSED ticket."));
    }

    @Test
    void getAllTickets_asCustomer_returnsOnlyOwnTickets() throws Exception {
        User customer = users.create(Role.CUSTOMER);
        User otherCustomer = users.create(Role.CUSTOMER);
        Ticket ownTicket = tickets.openTicketFor(customer);
        tickets.openTicketFor(otherCustomer);
        String token = auth.login(customer.getEmail(), TestUserFactory.DEFAULT_PASSWORD);

        JsonNode body = jsonOf(mockMvc.perform(get("/api/tickets")
                        .header(HttpHeaders.AUTHORIZATION, auth.bearer(token)))
                .andExpect(status().isOk())
                .andReturn());

        List<Long> returnedIds = body.valueStream()
                .map(node -> node.path("id").asLong())
                .toList();
        assertThat(returnedIds).containsExactly(ownTicket.getId());
    }
}
