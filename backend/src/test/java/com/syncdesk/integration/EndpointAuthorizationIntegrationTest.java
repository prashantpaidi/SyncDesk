package com.syncdesk.integration;

import com.syncdesk.entity.Ticket;
import com.syncdesk.entity.User;
import com.syncdesk.enums.Role;
import com.syncdesk.support.AbstractIntegrationTest;
import com.syncdesk.support.TestUserFactory;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MvcResult;
import tools.jackson.databind.JsonNode;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Endpoint level authorization tests.
 *
 * <p>These cover the administrative endpoints the application documents as
 * restricted: deleting a ticket (ADMIN), assigning a ticket (MANAGER/ADMIN),
 * listing users (MANAGER/ADMIN) and the dashboard metrics endpoint
 * (AGENT/MANAGER/ADMIN). Every case asserts the HTTP outcome <em>and</em> the
 * effect on PostgreSQL or on the response payload, so a regression that returns
 * the wrong status while still leaking data cannot pass.
 */
class EndpointAuthorizationIntegrationTest extends AbstractIntegrationTest {

    @Test
    void deleteTicket_whenUnauthenticated_isRejectedWith401() throws Exception {
        Ticket ticket = tickets.openTicketFor(users.create(Role.CUSTOMER));

        mockMvc.perform(delete("/api/tickets/{id}", ticket.getId()))
                .andExpect(status().isUnauthorized());

        assertThat(ticketExistsInDatabase(ticket.getId())).isTrue();
    }

    @Test
    void listUsers_whenUnauthenticated_isRejectedWith401() throws Exception {
        User manager = users.create(Role.MANAGER);

        MvcResult result = mockMvc.perform(get("/api/users"))
                .andExpect(status().isUnauthorized())
                .andReturn();

        assertThat(bodyOf(result)).doesNotContain(manager.getEmail(), manager.getName());
    }

    @ParameterizedTest(name = "{0} deleting a ticket -> HTTP {1}")
    @CsvSource({
            "ADMIN,    204",
            "MANAGER,  403",
            "AGENT,    403",
            "CUSTOMER, 403"
    })
    void deleteTicket_isRestrictedToAdmins(Role actorRole, int expectedStatus) throws Exception {
        User actor = users.create(actorRole);
        Ticket ticket = tickets.openTicketFor(users.create(Role.CUSTOMER));
        String token = auth.login(actor.getEmail(), TestUserFactory.DEFAULT_PASSWORD);

        mockMvc.perform(delete("/api/tickets/{id}", ticket.getId())
                        .header(HttpHeaders.AUTHORIZATION, auth.bearer(token)))
                .andExpect(status().is(expectedStatus));

        boolean expectedToSurvive = expectedStatus != 204;
        assertThat(ticketExistsInDatabase(ticket.getId())).isEqualTo(expectedToSurvive);
    }

    @ParameterizedTest(name = "GET /api/users as {0} -> HTTP {1}")
    @CsvSource({
            "ADMIN,    200",
            "MANAGER,  200",
            "AGENT,    403",
            "CUSTOMER, 403"
    })
    void listUsers_isRestrictedToManagersAndAdmins(Role actorRole, int expectedStatus) throws Exception {
        User actor = users.create(actorRole);
        User other = users.create(Role.CUSTOMER);
        String token = auth.login(actor.getEmail(), TestUserFactory.DEFAULT_PASSWORD);

        MvcResult result = mockMvc.perform(get("/api/users")
                        .header(HttpHeaders.AUTHORIZATION, auth.bearer(token)))
                .andExpect(status().is(expectedStatus))
                .andReturn();

        if (expectedStatus == 200) {
            assertThat(userEmails(result)).contains(actor.getEmail(), other.getEmail());
            JsonNode firstUser = jsonOf(result).valueStream().findFirst().orElseThrow();
            assertThat(firstUser.has("id")).isTrue();
            assertThat(firstUser.has("name")).isTrue();
            assertThat(firstUser.has("email")).isTrue();
            assertThat(firstUser.has("role")).isTrue();
        } else {
            assertThat(bodyOf(result))
                    .doesNotContain(actor.getEmail(), other.getEmail(), actor.getName(), other.getName());
        }
    }

    @Test
    void assignTicket_whenUnauthenticated_isRejectedWith401() throws Exception {
        Ticket ticket = tickets.openTicketFor(users.create(Role.CUSTOMER));

        mockMvc.perform(patch("/api/tickets/{id}/assign/{userId}", ticket.getId(), 1L))
                .andExpect(status().isUnauthorized());

        assertThat(assigneeInDatabase(ticket.getId())).isNull();
    }

    @ParameterizedTest(name = "{0} assigning a ticket -> HTTP {1}")
    @CsvSource({
            "ADMIN,    200",
            "MANAGER,  200",
            "AGENT,    403",
            "CUSTOMER, 403"
    })
    void assignTicket_isRestrictedToManagersAndAdmins(Role actorRole, int expectedStatus) throws Exception {
        User actor = users.create(actorRole);
        Ticket ticket = tickets.openTicketFor(users.create(Role.CUSTOMER));
        String token = auth.login(actor.getEmail(), TestUserFactory.DEFAULT_PASSWORD);

        mockMvc.perform(patch("/api/tickets/{id}/assign/{userId}", ticket.getId(), actor.getId())
                        .header(HttpHeaders.AUTHORIZATION, auth.bearer(token)))
                .andExpect(status().is(expectedStatus));

        Long assignee = assigneeInDatabase(ticket.getId());
        if (expectedStatus == 200) {
            assertThat(assignee).isEqualTo(actor.getId());
        } else {
            assertThat(assignee).isNull();
        }
    }

    @Test
    void dashboardMetrics_whenUnauthenticated_isRejectedWith401() throws Exception {
        mockMvc.perform(get("/api/dashboard/metrics"))
                .andExpect(status().isUnauthorized());
    }

    @ParameterizedTest(name = "GET /api/dashboard/metrics as {0} -> HTTP {1}")
    @CsvSource({
            "ADMIN,    200",
            "MANAGER,  200",
            "AGENT,    200",
            "CUSTOMER, 403"
    })
    void dashboardMetrics_isRestrictedToStaff(Role actorRole, int expectedStatus) throws Exception {
        User actor = users.create(actorRole);
        tickets.openTicketFor(users.create(Role.CUSTOMER));
        String token = auth.login(actor.getEmail(), TestUserFactory.DEFAULT_PASSWORD);

        MvcResult result = mockMvc.perform(get("/api/dashboard/metrics")
                        .header(HttpHeaders.AUTHORIZATION, auth.bearer(token)))
                .andExpect(status().is(expectedStatus))
                .andReturn();

        if (expectedStatus == 200) {
            assertThat(jsonOf(result).path("totalTickets").asLong()).isEqualTo(1);
        } else {
            assertThat(bodyOf(result)).doesNotContain("totalTickets");
        }
    }

    private Long assigneeInDatabase(Long ticketId) {
        // Flush the pending UPDATE so the JDBC read observes what was written.
        entityManager.flush();
        return jdbcTemplate.queryForObject(
                "SELECT assigned_to_id FROM tickets WHERE id = ?", Long.class, ticketId);
    }

    private List<String> userEmails(MvcResult result) {
        JsonNode users = jsonOf(result);
        assertThat(users.isArray()).isTrue();
        return users.valueStream().map(node -> node.path("email").asString()).toList();
    }

    private boolean ticketExistsInDatabase(Long ticketId) {
        // Flush the pending DELETE so the JDBC read observes what was written.
        entityManager.flush();
        return jdbcTemplate.queryForObject(
                "SELECT count(*) FROM tickets WHERE id = ?", Long.class, ticketId) > 0;
    }
}
