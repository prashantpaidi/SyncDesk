package com.syncdesk.config;

/**
 * Cache names and keys used across the application.
 *
 * <p>Centralised so the {@code @Cacheable}/{@code @CacheEvict} annotations that
 * must agree on a cache entry cannot drift apart.
 */
public final class CacheNames {

    /**
     * Cached {@code GET /api/dashboard/metrics} response. A single global entry:
     * the payload is aggregate counts that are identical for every authenticated
     * caller, so it is safe to share one key across users.
     */
    public static final String DASHBOARD_METRICS = "dashboardMetrics";

    /**
     * SpEL literal for the single entry in {@link #DASHBOARD_METRICS}
     * (Redis key {@code dashboardMetrics::global}).
     */
    public static final String DASHBOARD_METRICS_KEY = "'global'";

    private CacheNames() {
    }
}
