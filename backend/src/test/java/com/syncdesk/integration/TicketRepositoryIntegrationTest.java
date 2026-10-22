package com.syncdesk.integration;

import com.syncdesk.entity.Ticket;
import com.syncdesk.entity.TicketComment;
import com.syncdesk.entity.User;
import com.syncdesk.enums.Role;
import com.syncdesk.support.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;

import java.sql.Timestamp;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Repository level tests for the query paths that carry real logic
 * (filtering by owner and by comment visibility, ordering by creation time).
 *
 * <p>Rows are written through JPA and then read back through Spring Data so the
 * SQL is executed by PostgreSQL, not simulated in memory.
 */
class TicketRepositoryIntegrationTest extends AbstractIntegrationTest {

    @Test
    void findByCreatedByOrderByCreatedAtDesc_returnsOnlyOwnTicketsNewestFirst() {
        User owner = users.create(Role.CUSTOMER);
        User other = users.create(Role.CUSTOMER);

        Ticket oldest = tickets.openTicketFor(owner);
        Ticket middle = tickets.openTicketFor(owner);
        Ticket newest = tickets.openTicketFor(owner);
        Ticket otherUsersTicket = tickets.openTicketFor(other);

        pinCreatedAt(oldest, "2024-01-01 10:00:00");
        pinCreatedAt(middle, "2024-01-02 10:00:00");
        pinCreatedAt(newest, "2024-01-03 10:00:00");
        pinCreatedAt(otherUsersTicket, "2024-01-04 10:00:00");
        reloadFromDatabase();

        List<Long> returnedIds = ticketRepository.findByCreatedByOrderByCreatedAtDesc(owner).stream()
                .map(Ticket::getId)
                .toList();

        assertThat(returnedIds).containsExactly(newest.getId(), middle.getId(), oldest.getId());
    }

    @Test
    void commentQueries_sortNewestFirstAndHonourVisibility() {
        User author = users.create(Role.AGENT);
        User customer = users.create(Role.CUSTOMER);
        Ticket ticket = tickets.openTicketFor(customer);

        TicketComment oldest = persistComment(ticket, author, "Oldest comment", true);
        TicketComment hidden = persistComment(ticket, author, "Hidden comment", false);
        TicketComment newest = persistComment(ticket, author, "Newest comment", true);

        pinCommentCreatedAt(oldest, "2024-02-01 10:00:00");
        pinCommentCreatedAt(hidden, "2024-02-02 10:00:00");
        pinCommentCreatedAt(newest, "2024-02-03 10:00:00");
        reloadFromDatabase();

        List<Long> allComments = ticketCommentRepository.findByTicketIdOrderByCreatedAtDesc(ticket.getId()).stream()
                .map(TicketComment::getId)
                .toList();
        assertThat(allComments).containsExactly(newest.getId(), hidden.getId(), oldest.getId());

        List<Long> visibleOnly = ticketCommentRepository
                .findByTicketIdAndIsVisibleToUserTrueOrderByCreatedAtDesc(ticket.getId()).stream()
                .map(TicketComment::getId)
                .toList();
        assertThat(visibleOnly).containsExactly(newest.getId(), oldest.getId());
    }

    @Test
    void ticketsTable_isIndexedOnStatusAndPriority() {
        List<String> indexDefinitions = jdbcTemplate.queryForList(
                "SELECT indexdef FROM pg_indexes WHERE tablename = 'tickets' AND indexname = 'idx_ticket_status_priority'",
                String.class);

        assertThat(indexDefinitions).hasSize(1);
        assertThat(indexDefinitions.getFirst())
                .containsIgnoringCase("status")
                .containsIgnoringCase("priority");
    }

    private TicketComment persistComment(Ticket ticket, User author, String content, boolean visibleToUser) {
        return ticketCommentRepository.saveAndFlush(TicketComment.builder()
                .ticket(ticket)
                .author(author)
                .content(content)
                .isVisibleToUser(visibleToUser)
                .build());
    }

    private void pinCreatedAt(Ticket ticket, String timestamp) {
        jdbcTemplate.update("UPDATE tickets SET created_at = ? WHERE id = ?",
                Timestamp.valueOf(timestamp), ticket.getId());
    }

    private void pinCommentCreatedAt(TicketComment comment, String timestamp) {
        jdbcTemplate.update("UPDATE ticket_comments SET created_at = ? WHERE id = ?",
                Timestamp.valueOf(timestamp), comment.getId());
    }

    private void reloadFromDatabase() {
        entityManager.flush();
        entityManager.clear();
    }
}
