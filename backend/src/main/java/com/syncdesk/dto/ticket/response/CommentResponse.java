package com.syncdesk.dto.ticket.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentResponse {
    private Long id;
    private String content;
    private Long authorId;
    private String authorName;
    private boolean isVisibleToUser;
    private LocalDateTime createdAt;
}
