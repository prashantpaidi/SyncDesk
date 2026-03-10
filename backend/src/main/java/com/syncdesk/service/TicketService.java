package com.syncdesk.service;

import com.syncdesk.dto.ticket.request.CreateTicketRequest;
import com.syncdesk.dto.ticket.response.TicketResponse;
import com.syncdesk.entity.Ticket;
import com.syncdesk.entity.User;
import com.syncdesk.enums.TicketStatus;
import com.syncdesk.exception.ResourceNotFoundException;
import com.syncdesk.repository.TicketRepository;
import com.syncdesk.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final TicketCommentRepository ticketCommentRepository;

    @Transactional
    public TicketResponse createTicket(CreateTicketRequest request, User currentUser) {
        Ticket ticket = Ticket.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority())
                .status(TicketStatus.OPEN)
                .createdBy(currentUser)
                .build();

        Ticket savedTicket = ticketRepository.save(ticket);
        return mapToResponse(savedTicket);
    }

    @Transactional(readOnly = true)
    public List<TicketResponse> getAllTickets() {
        return ticketRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TicketResponse getTicketById(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));
        return mapToResponse(ticket);
    }

    @Transactional
    public TicketResponse updateTicketStatus(Long id, TicketStatus status) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));

        ticket.setStatus(status);
        Ticket updatedTicket = ticketRepository.save(ticket);
        return mapToResponse(updatedTicket);
    }

    @Transactional
    public TicketResponse assignTicket(Long ticketId, Long userId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        ticket.setAssignedTo(user);
        Ticket updatedTicket = ticketRepository.save(ticket);
        return mapToResponse(updatedTicket);
    }

    @Transactional
    public void deleteTicket(Long id) {
        if (!ticketRepository.existsById(id)) {
            throw new ResourceNotFoundException("Ticket not found with id: " + id);
        }
        ticketRepository.deleteById(id);
    }

    @Transactional
    public com.syncdesk.dto.ticket.response.CommentResponse addComment(Long ticketId,
            com.syncdesk.dto.ticket.request.CommentRequest request, User currentUser) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));

        com.syncdesk.entity.TicketComment comment = com.syncdesk.entity.TicketComment.builder()
                .ticket(ticket)
                .author(currentUser)
                .content(request.getContent())
                .isVisibleToUser(request.isVisibleToUser())
                .build();

        com.syncdesk.entity.TicketComment savedComment = ticketCommentRepository.save(comment);
        return mapToCommentResponse(savedComment);
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsForTicket(Long ticketId,
            User currentUser) {
        if (!ticketRepository.existsById(ticketId)) {
            throw new ResourceNotFoundException("Ticket not found with id: " + ticketId);
        }

        List<TicketComment> comments;
        if (currentUser.getRole() == com.syncdesk.enums.Role.CUSTOMER) {
            comments = ticketCommentRepository.findByTicketIdAndIsVisibleToUserTrueOrderByCreatedAtDesc(ticketId);
        } else {
            comments = ticketCommentRepository.findByTicketIdOrderByCreatedAtDesc(ticketId);
        }

        return comments.stream()
                .map(this::mapToCommentResponse)
                .collect(Collectors.toList());
    }

    private CommentResponse mapToCommentResponse(
            TicketComment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .authorId(comment.getAuthor() != null ? comment.getAuthor().getId() : null)
                .authorName(comment.getAuthor() != null ? comment.getAuthor().getName() : null)
                .isVisibleToUser(comment.isVisibleToUser())
                .createdAt(comment.getCreatedAt())
                .build();
    }

    private TicketResponse mapToResponse(Ticket ticket) {
        return TicketResponse.builder()
                .id(ticket.getId())
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .status(ticket.getStatus())
                .priority(ticket.getPriority())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .createdById(ticket.getCreatedBy() != null ? ticket.getCreatedBy().getId() : null)
                .createdByName(ticket.getCreatedBy() != null ? ticket.getCreatedBy().getName() : null)
                .assignedToId(ticket.getAssignedTo() != null ? ticket.getAssignedTo().getId() : null)
                .assignedToName(ticket.getAssignedTo() != null ? ticket.getAssignedTo().getName() : null)
                .build();
    }
}
