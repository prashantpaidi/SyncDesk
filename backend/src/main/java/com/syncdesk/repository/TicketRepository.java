package com.syncdesk.repository;

import com.syncdesk.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

import com.syncdesk.entity.User;
import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByCreatedByOrderByCreatedAtDesc(User createdBy);
}
