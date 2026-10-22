package com.syncdesk.support;

import com.syncdesk.entity.Ticket;
import com.syncdesk.entity.User;
import com.syncdesk.enums.TicketPriority;
import com.syncdesk.enums.TicketStatus;
import com.syncdesk.repository.TicketRepository;

import java.util.concurrent.atomic.AtomicInteger;

/**
 * Creates persisted {@link Ticket}s for integration tests.
 *
 * <p>Tickets are written straight through the repository (not the service) so
 * fixtures can start from any status/priority combination, including states the
 * create endpoint would not accept.
 */
public class TestTicketFactory {

    private static final AtomicInteger SEQUENCE = new AtomicInteger();

    private final TicketRepository ticketRepository;

    public TestTicketFactory(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    public Ticket openTicketFor(User creator) {
        return create(creator, TicketStatus.OPEN, TicketPriority.MEDIUM);
    }

    public Ticket create(User creator, TicketStatus status, TicketPriority priority) {
        Ticket ticket = Ticket.builder()
                .title("Test ticket " + SEQUENCE.incrementAndGet())
                .description("Fixture ticket created by TestTicketFactory")
                .status(status)
                .priority(priority)
                .createdBy(creator)
                .build();
        return ticketRepository.saveAndFlush(ticket);
    }
}
