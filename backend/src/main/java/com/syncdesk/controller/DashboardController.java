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
 * <p>Access is covered by the existing {@code anyRequest().authenticated()} rule
 * in {@code SecurityConfig}: the payload is non-sensitive aggregate counts that
 * are identical for every authenticated caller.
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
