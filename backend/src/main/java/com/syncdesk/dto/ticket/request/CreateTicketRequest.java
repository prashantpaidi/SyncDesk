package com.syncdesk.dto.ticket.request;

import com.syncdesk.enums.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

// CreateTicketRequest.java
@Data
public class CreateTicketRequest {
    @NotBlank
    private String title;

    @NotBlank
    private String description;

    private TicketPriority priority = TicketPriority.MEDIUM;
}