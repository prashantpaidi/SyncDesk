package com.syncdesk.dto.ticket.request;

import com.syncdesk.enums.TicketStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StatusUpdateRequest {
    private TicketStatus status;
}
