package com.syncdesk.repository;

import com.syncdesk.entity.TicketComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketCommentRepository extends JpaRepository<TicketComment, Long> {
    List<TicketComment> findByTicketIdOrderByCreatedAtDesc(Long ticketId);

    List<TicketComment> findByTicketIdAndIsVisibleToUserTrueOrderByCreatedAtDesc(Long ticketId);
}
