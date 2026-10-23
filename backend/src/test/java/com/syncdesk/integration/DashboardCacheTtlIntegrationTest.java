package com.syncdesk.integration;

import com.syncdesk.config.CacheNames;
import com.syncdesk.entity.User;
import com.syncdesk.enums.Role;
import com.syncdesk.support.AbstractIntegrationTest;
import com.syncdesk.support.RedisTestContainerConfig;
import com.syncdesk.support.TestUserFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Import;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.test.context.TestPropertySource;
import tools.jackson.databind.JsonNode;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Verifies that the dashboard cache is refreshed once its TTL expires.
 *
 * <p>Uses a short TTL (instead of the 60-second production default) so the
 * expiry can be observed without a slow test. The underlying data is changed
 * through JDBC directly — bypassing the service layer, hence without triggering
 * an eviction — so the only way the change becomes visible is by TTL expiry.
 */
@TestPropertySource(properties = "syncdesk.cache.dashboard-ttl=2s")
@Import(RedisTestContainerConfig.class)
class DashboardCacheTtlIntegrationTest extends AbstractIntegrationTest {

    private static final String GLOBAL_KEY = CacheNames.DASHBOARD_METRICS + "::global";

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @BeforeEach
    void clearDashboardCache() {
        stringRedisTemplate.delete(GLOBAL_KEY);
        awaitCache(false);
    }

    @Test
    void expiredCacheIsRefreshedFromDatabase() throws Exception {
        User admin = users.create(Role.ADMIN);
        String token = auth.login(admin.getEmail(), TestUserFactory.DEFAULT_PASSWORD);

        assertThat(fetchMetrics(token).path("totalTickets").asLong()).isZero();
        awaitCache(true);

        // Bypass the service so the cache is NOT evicted.
        jdbcTemplate.update("""
                INSERT INTO tickets (title, description, status, priority, created_at, updated_at, created_by_id)
                VALUES ('direct insert', 'bypasses the cache', 'OPEN', 'LOW', NOW(), NOW(), ?)
                """, admin.getId());

        // Within the TTL the cached snapshot is still served (proving it is cached).
        assertThat(fetchMetrics(token).path("totalTickets").asLong()).isZero();

        // After expiry the entry is gone and the snapshot is rebuilt from PostgreSQL.
        awaitCache(false);
        assertThat(fetchMetrics(token).path("totalTickets").asLong()).isEqualTo(1);
    }

    private JsonNode fetchMetrics(String token) throws Exception {
        return jsonOf(mockMvc.perform(get("/api/dashboard/metrics")
                        .header(HttpHeaders.AUTHORIZATION, auth.bearer(token)))
                .andExpect(status().isOk())
                .andReturn());
    }

    private boolean cached() {
        return Boolean.TRUE.equals(stringRedisTemplate.hasKey(GLOBAL_KEY));
    }

    private void awaitCache(boolean expected) {
        long deadline = System.currentTimeMillis() + 15_000;
        while (System.currentTimeMillis() < deadline) {
            if (cached() == expected) {
                return;
            }
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new IllegalStateException(e);
            }
        }
        throw new AssertionError("Cache key '" + GLOBAL_KEY + "' did not become "
                + (expected ? "present" : "absent") + " within the timeout");
    }
}
