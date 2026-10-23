package com.syncdesk.dto.ticket.response;

import java.time.Instant;
import java.util.Map;

/**
 * Aggregate snapshot returned by {@code GET /api/dashboard/metrics}.
 *
 * <p>Contains only aggregate counts, so the payload is identical for every
 * authenticated caller and can be cached under a single shared key.
 *
 * <p>{@code ticketsByStatus} / {@code ticketsByPriority} are keyed by enum name
 * and always contain an entry for every enum constant (zero-filled), which keeps
 * the JSON shape deterministic for callers and for tests.
 *
 * @param totalTickets       total number of tickets
 * @param ticketsByStatus    ticket count per {@code TicketStatus}
 * @param ticketsByPriority  ticket count per {@code TicketPriority}
 * @param unassignedTickets  tickets with no assignee
 * @param generatedAt        when this snapshot was computed (i.e. when it was
 *                           cached, if it was served from cache)
 */
public record DashboardMetricsResponse(
        long totalTickets,
        Map<String, Long> ticketsByStatus,
        Map<String, Long> ticketsByPriority,
        long unassignedTickets,
        Instant generatedAt) {
}
