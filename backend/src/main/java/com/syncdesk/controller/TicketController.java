package com.syncdesk.controller;

import com.syncdesk.dto.ticket.request.CommentRequest;
import com.syncdesk.dto.ticket.request.CreateTicketRequest;
import com.syncdesk.dto.ticket.response.CommentResponse;
import com.syncdesk.dto.ticket.response.TicketResponse;
import com.syncdesk.entity.User;
import com.syncdesk.enums.TicketStatus;
import com.syncdesk.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(
            @Valid @RequestBody CreateTicketRequest request,
            @AuthenticationPrincipal User currentUser) {
        TicketResponse response = ticketService.createTicket(request, currentUser);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<TicketResponse>> getAllTickets(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ticketService.getAllTickets(currentUser));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TicketResponse> updateTicketStatus(
            @PathVariable Long id,
            @RequestParam TicketStatus status) {
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, status));
    }

    @PatchMapping("/{id}/assign/{userId}")
    public ResponseEntity<TicketResponse> assignTicket(
            @PathVariable Long id,
            @PathVariable Long userId) {
        return ResponseEntity.ok(ticketService.assignTicket(id, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long id,
            @Valid @RequestBody CommentRequest request,
            @AuthenticationPrincipal User currentUser) {
        CommentResponse response = ticketService.addComment(id, request, currentUser);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<CommentResponse>> getCommentsForTicket(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ticketService.getCommentsForTicket(id, currentUser));
    }
}