package com.syncdesk.integration;

import com.syncdesk.entity.Ticket;
import com.syncdesk.entity.TicketComment;
import com.syncdesk.entity.User;
import com.syncdesk.enums.Role;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for ticket comments.
 *
 * <p>Comments carry a visibility flag: customers only ever see comments marked
 * visible to them, while staff see the full history.
 */
class CommentIntegrationTest extends AbstractIntegrationTest {

    @Test
    void addComment_persistsCommentLinkedToTicketAndAuthor() throws Exception {
        User agent = users.create(Role.AGENT);
        User customer = users.create(Role.CUSTOMER);
        Ticket ticket = tickets.openTicketFor(customer);
        String agentToken = auth.login(agent.getEmail(), TestUserFactory.DEFAULT_PASSWORD);

        JsonNode body = jsonOf(mockMvc.perform(post("/api/tickets/{id}/comments", ticket.getId())
                        .header(HttpHeaders.AUTHORIZATION, auth.bearer(agentToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(Map.of("content", "Looking into this now."))))
                .andExpect(status().isCreated())
                .andReturn());

        long commentId = body.path("id").asLong();
        assertThat(commentId).isPositive();
        assertThat(body.path("content").asString()).isEqualTo("Looking into this now.");
        assertThat(body.path("authorId").asLong()).isEqualTo(agent.getId());
        assertThat(body.path("authorName").asString()).isEqualTo(agent.getName());
        assertThat(body.path("isVisibleToUser").asBoolean()).isTrue();

        Map<String, Object> persisted = jdbcTemplate.queryForMap(
                "SELECT ticket_id, author_id, content, is_visible_to_user FROM ticket_comments WHERE id = ?",
                commentId);
        assertThat(persisted)
                .containsEntry("ticket_id", ticket.getId())
                .containsEntry("author_id", agent.getId())
                .containsEntry("content", "Looking into this now.")
                .containsEntry("is_visible_to_user", true);
    }

    @Test
    void addComment_markedInternal_isStoredAsNotVisibleToUser() throws Exception {
        User agent = users.create(Role.AGENT);
        User customer = users.create(Role.CUSTOMER);
        Ticket ticket = tickets.openTicketFor(customer);
        String agentToken = auth.login(agent.getEmail(), TestUserFactory.DEFAULT_PASSWORD);

        JsonNode body = jsonOf(mockMvc.perform(post("/api/tickets/{id}/comments", ticket.getId())
                        .header(HttpHeaders.AUTHORIZATION, auth.bearer(agentToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"content\":\"Internal note\",\"isVisibleToUser\":false}"))
                .andExpect(status().isCreated())
                .andReturn());

        assertThat(body.path("isVisibleToUser").asBoolean()).isFalse();
        assertThat(jdbcTemplate.queryForObject(
                "SELECT is_visible_to_user FROM ticket_comments WHERE id = ?",
                Boolean.class,
                body.path("id").asLong())).isFalse();
    }

    @Test
    void addComment_toUnknownTicket_isRejected() throws Exception {
        User agent = users.create(Role.AGENT);
        String agentToken = auth.login(agent.getEmail(), TestUserFactory.DEFAULT_PASSWORD);

        mockMvc.perform(post("/api/tickets/{id}/comments", 9_999_999L)
                        .header(HttpHeaders.AUTHORIZATION, auth.bearer(agentToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(Map.of("content", "Orphan comment"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Ticket not found with id: 9999999"));

        assertThat(ticketCommentRepository.count()).isZero();
    }

    @Test
    void addComment_withBlankContent_isRejectedByValidation() throws Exception {
        User agent = users.create(Role.AGENT);
        User customer = users.create(Role.CUSTOMER);
        Ticket ticket = tickets.openTicketFor(customer);
        String agentToken = auth.login(agent.getEmail(), TestUserFactory.DEFAULT_PASSWORD);

        mockMvc.perform(post("/api/tickets/{id}/comments", ticket.getId())
                        .header(HttpHeaders.AUTHORIZATION, auth.bearer(agentToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(Map.of("content", ""))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.content").value("must not be blank"));
    }

    @Test
    void getComments_asCustomer_hidesInternalComments() throws Exception {
        User agent = users.create(Role.AGENT);
        User customer = users.create(Role.CUSTOMER);
        Ticket ticket = tickets.openTicketFor(customer);
        persistComment(ticket, agent, "Public update", true);
        persistComment(ticket, agent, "Internal escalation note", false);

        String agentToken = auth.login(agent.getEmail(), TestUserFactory.DEFAULT_PASSWORD);
        List<String> visibleToAgent = commentContents(agentToken, ticket.getId());
        assertThat(visibleToAgent).containsExactlyInAnyOrder("Public update", "Internal escalation note");

        String customerToken = auth.login(customer.getEmail(), TestUserFactory.DEFAULT_PASSWORD);
        List<String> visibleToCustomer = commentContents(customerToken, ticket.getId());
        assertThat(visibleToCustomer).containsExactly("Public update");
    }

    private void persistComment(Ticket ticket, User author, String content, boolean visibleToUser) {
        ticketCommentRepository.saveAndFlush(TicketComment.builder()
                .ticket(ticket)
                .author(author)
                .content(content)
                .isVisibleToUser(visibleToUser)
                .build());
    }

    private List<String> commentContents(String token, Long ticketId) throws Exception {
        JsonNode body = jsonOf(mockMvc.perform(get("/api/tickets/{id}/comments", ticketId)
                        .header(HttpHeaders.AUTHORIZATION, auth.bearer(token)))
                .andExpect(status().isOk())
                .andReturn());
        return body.valueStream().map(node -> node.path("content").asString()).toList();
    }
}
