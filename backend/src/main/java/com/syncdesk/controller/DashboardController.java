package com.syncdesk.controller;

import com.syncdesk.dto.ticket.response.DashboardMetricsResponse;
import com.syncdesk.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Read-only dashboard endpoints.
 *
 * <p>Staff-only: {@code SecurityConfig} restricts {@code /api/dashboard/**} to
 * AGENT, MANAGER and ADMIN, so customers (and anonymous callers) are rejected
 * before the controller is reached.
 *
 * <p>The payload is aggregate counts only and is identical for every authorised
 * caller, which is why the cached response can live under a single shared key.
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/metrics")
    public ResponseEntity<DashboardMetricsResponse> metrics() {
        return ResponseEntity.ok(dashboardService.getDashboardMetrics());
    }
}
