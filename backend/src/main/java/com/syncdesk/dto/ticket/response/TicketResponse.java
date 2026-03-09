package com.syncdesk.dto.ticket.response;

import com.syncdesk.enums.TicketPriority;
import com.syncdesk.enums.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketResponse {
    private Long id;
    private String title;
    private String description;
    private TicketStatus status;
    private TicketPriority priority;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Creator info
    private Long createdById;
    private String createdByName;

    // Assignee info
    private Long assignedToId;
    private String assignedToName;
}
