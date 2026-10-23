package com.syncdesk.service;

import com.syncdesk.config.CacheNames;
import com.syncdesk.dto.ticket.response.DashboardMetricsResponse;
import com.syncdesk.enums.TicketPriority;
import com.syncdesk.enums.TicketStatus;
import com.syncdesk.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Read-only aggregate queries backing the dashboard.
 *
 * <p>The metrics response is served cache-aside from Redis: the first call runs
 * the aggregate queries and stores the snapshot; subsequent calls return the
 * cached snapshot until it is evicted by a ticket mutation or expires.
 */
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TicketRepository ticketRepository;

    /**
     * Computes the dashboard metrics snapshot.
     *
     * <p>Executes three aggregate queries (count by status, count by priority,
     * count unassigned). This is the database work the cache avoids on a hit.
     */
    @Cacheable(cacheNames = CacheNames.DASHBOARD_METRICS, key = CacheNames.DASHBOARD_METRICS_KEY)
    @Transactional(readOnly = true)
    public DashboardMetricsResponse getDashboardMetrics() {
        Map<String, Long> byStatus = new LinkedHashMap<>();
        for (TicketStatus status : TicketStatus.values()) {
            byStatus.put(status.name(), 0L);
        }
        long total = 0L;
        for (Object[] row : ticketRepository.countGroupedByStatus()) {
            TicketStatus status = (TicketStatus) row[0];
            long count = ((Number) row[1]).longValue();
            byStatus.put(status.name(), count);
            total += count;
        }

        Map<String, Long> byPriority = new LinkedHashMap<>();
        for (TicketPriority priority : TicketPriority.values()) {
            byPriority.put(priority.name(), 0L);
        }
        for (Object[] row : ticketRepository.countGroupedByPriority()) {
            TicketPriority priority = (TicketPriority) row[0];
            byPriority.put(priority.name(), ((Number) row[1]).longValue());
        }

        long unassigned = ticketRepository.countByAssignedToIsNull();

        return new DashboardMetricsResponse(total, byStatus, byPriority, unassigned, Instant.now());
    }
}
