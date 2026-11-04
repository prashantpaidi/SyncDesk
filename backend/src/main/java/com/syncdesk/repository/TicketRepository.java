package com.syncdesk.repository;

import com.syncdesk.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.syncdesk.entity.User;
import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByCreatedByOrderByCreatedAtDesc(User createdBy);

    /**
     * Ticket count grouped by status. Rows are {@code [TicketStatus, Long]}.
     * Used by the cached dashboard metrics snapshot.
     */
    @Query("select t.status, count(t) from Ticket t group by t.status")
    List<Object[]> countGroupedByStatus();

    /**
     * Ticket count grouped by priority. Rows are {@code [TicketPriority, Long]}.
     * Used by the cached dashboard metrics snapshot.
     */
    @Query("select t.priority, count(t) from Ticket t group by t.priority")
    List<Object[]> countGroupedByPriority();

    /**
     * Number of tickets that have not been assigned to anyone.
     */
    long countByAssignedToIsNull();
}
