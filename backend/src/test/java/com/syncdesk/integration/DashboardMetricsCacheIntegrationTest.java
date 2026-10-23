package com.syncdesk.integration;

import com.syncdesk.config.CacheNames;
import com.syncdesk.dto.ticket.request.CreateTicketRequest;
import com.syncdesk.entity.Ticket;
import com.syncdesk.entity.User;
import com.syncdesk.enums.Role;
import com.syncdesk.enums.TicketPriority;
import com.syncdesk.enums.TicketStatus;
import com.syncdesk.service.TicketService;
import com.syncdesk.support.AbstractIntegrationTest;
import com.syncdesk.support.RedisTestContainerConfig;
import com.syncdesk.support.TestUserFactory;
import jakarta.persistence.EntityManagerFactory;
import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Import;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import tools.jackson.databind.JsonNode;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Real-behaviour tests for the Redis cache-aside path behind
 * {@code GET /api/dashboard/metrics}.
 *
 * <p>Runs against a disposable Redis container (no mocks). Two
 * implementation-independent signals are used: Hibernate's query-execution count
 * (proving a cache hit skips the aggregate queries) and the presence of the cache
 * entry in Redis.
 *
 * <p>Unlike the rest of the suite this class does <strong>not</strong> run inside
 * a rolled-back transaction: the cache manager is transaction-aware, so cache
 * writes and evictions are only applied once the surrounding transaction
 * <em>commits</em>. A rollback would therefore discard them and the caching
 * behaviour could not be observed at all. State is reset in {@link #resetState()}
 * instead of by rollback.
 */
@Transactional(propagation = Propagation.NOT_SUPPORTED)
@Import(RedisTestContainerConfig.class)
class DashboardMetricsCacheIntegrationTest extends AbstractIntegrationTest {

    private static final String GLOBAL_KEY = CacheNames.DASHBOARD_METRICS + "::global";

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @Autowired
    private EntityManagerFactory entityManagerFactory;

    @Autowired
    private TicketService ticketService;

    @Autowired
    private PlatformTransactionManager transactionManager;

    @BeforeEach
    void resetState() {
        ticketCommentRepository.deleteAllInBatch();
        ticketRepository.deleteAllInBatch();
        stringRedisTemplate.delete(GLOBAL_KEY);
        awaitCache(false);
    }

    @Test
    void firstRequestReadsFromDatabase_thenSecondIsServedFromCache() throws Exception {
        User agent = users.create(Role.AGENT);
        tickets.create(users.create(Role.CUSTOMER), TicketStatus.OPEN, TicketPriority.HIGH);
        String token = auth.login(agent.getEmail(), TestUserFactory.DEFAULT_PASSWORD);

        assertThat(cached()).isFalse();

        Statistics stats = statistics();
        stats.clear();
        JsonNode first = fetchMetrics(token);
        long missQueries = stats.getQueryExecutionCount();

        // Miss: the aggregate queries ran and the snapshot was cached.
        assertThat(missQueries).isGreaterThanOrEqualTo(3);
        awaitCache(true);

        stats.clear();
        JsonNode second = fetchMetrics(token);
        long hitQueries = stats.getQueryExecutionCount();

        // Hit: strictly fewer queries (the aggregate queries were skipped) and the
        // same snapshot was returned.
        assertThat(hitQueries).isLessThan(missQueries);
        assertThat(second.path("totalTickets").asLong()).isEqualTo(first.path("totalTickets").asLong());
    }

    @Test
    void cachedMetricsReflectUnderlyingData() throws Exception {
        User customer = users.create(Role.CUSTOMER);
        User agent = users.create(Role.AGENT);
        tickets.create(customer, TicketStatus.OPEN, TicketPriority.HIGH);
        tickets.create(customer, TicketStatus.OPEN, TicketPriority.HIGH);
        Ticket closed = tickets.create(customer, TicketStatus.CLOSED, TicketPriority.LOW);
        closed.setAssignedTo(agent);
        ticketRepository.saveAndFlush(closed);

        String token = auth.login(agent.getEmail(), TestUserFactory.DEFAULT_PASSWORD);
        JsonNode body = fetchMetrics(token);

        assertThat(body.path("totalTickets").asLong()).isEqualTo(3);
        assertThat(body.path("ticketsByStatus").path("OPEN").asLong()).isEqualTo(2);
        assertThat(body.path("ticketsByStatus").path("CLOSED").asLong()).isEqualTo(1);
        assertThat(body.path("ticketsByStatus").path("RESOLVED").asLong()).isZero();
        assertThat(body.path("ticketsByPriority").path("HIGH").asLong()).isEqualTo(2);
        assertThat(body.path("ticketsByPriority").path("LOW").asLong()).isEqualTo(1);
        assertThat(body.path("ticketsByPriority").path("CRITICAL").asLong()).isZero();
        assertThat(body.path("unassignedTickets").asLong()).isEqualTo(2);
    }

    @Test
    void creatingTicketEvictsDashboardCache() throws Exception {
        User customer = users.create(Role.CUSTOMER);
        User agent = users.create(Role.AGENT);
        String staffToken = auth.login(agent.getEmail(), TestUserFactory.DEFAULT_PASSWORD);
        String customerToken = auth.login(customer.getEmail(), TestUserFactory.DEFAULT_PASSWORD);
        warmCache(staffToken);

        mockMvc.perform(post("/api/tickets")
                        .header(HttpHeaders.AUTHORIZATION, auth.bearer(customerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(Map.of(
                                "title", "New ticket", "description", "desc", "priority", "LOW"))))
                .andExpect(status().isCreated());

        awaitCache(false);
    }

    @Test
    void updatingTicketStatusEvictsDashboardCache() throws Exception {
        User customer = users.create(Role.CUSTOMER);
        User agent = users.create(Role.AGENT);
        Ticket ticket = tickets.openTicketFor(customer);
        String token = auth.login(agent.getEmail(), TestUserFactory.DEFAULT_PASSWORD);
        warmCache(token);

        mockMvc.perform(patch("/api/tickets/{id}/status", ticket.getId())
                        .header(HttpHeaders.AUTHORIZATION, auth.bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(Map.of("status", "RESOLVED"))))
                .andExpect(status().isOk());

        awaitCache(false);
    }

    @Test
    void assigningTicketEvictsDashboardCache() throws Exception {
        User customer = users.create(Role.CUSTOMER);
        User manager = users.create(Role.MANAGER);
        Ticket ticket = tickets.openTicketFor(customer);
        String token = auth.login(manager.getEmail(), TestUserFactory.DEFAULT_PASSWORD);
        warmCache(token);

        mockMvc.perform(patch("/api/tickets/{id}/assign/{userId}", ticket.getId(), manager.getId())
                        .header(HttpHeaders.AUTHORIZATION, auth.bearer(token)))
                .andExpect(status().isOk());

        awaitCache(false);
    }

    @Test
    void deletingTicketEvictsDashboardCache() throws Exception {
        User customer = users.create(Role.CUSTOMER);
        User admin = users.create(Role.ADMIN);
        Ticket ticket = tickets.openTicketFor(customer);
        String token = auth.login(admin.getEmail(), TestUserFactory.DEFAULT_PASSWORD);
        warmCache(token);

        mockMvc.perform(delete("/api/tickets/{id}", ticket.getId())
                        .header(HttpHeaders.AUTHORIZATION, auth.bearer(token)))
                .andExpect(status().isNoContent());

        awaitCache(false);
    }

    @Test
    void addingCommentDoesNotEvictDashboardCache() throws Exception {
        User customer = users.create(Role.CUSTOMER);
        User agent = users.create(Role.AGENT);
        Ticket ticket = tickets.openTicketFor(customer);
        String token = auth.login(agent.getEmail(), TestUserFactory.DEFAULT_PASSWORD);
        warmCache(token);

        mockMvc.perform(post("/api/tickets/{id}/comments", ticket.getId())
                        .header(HttpHeaders.AUTHORIZATION, auth.bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"content\":\"note\",\"isVisibleToUser\":true}"))
                .andExpect(status().isCreated());

        // Comments do not affect ticket aggregates, so the snapshot stays cached.
        awaitCache(true);
    }

    @Test
    void afterMutationFreshDataIsReturned() throws Exception {
        User agent = users.create(Role.AGENT);
        tickets.openTicketFor(agent);
        String token = auth.login(agent.getEmail(), TestUserFactory.DEFAULT_PASSWORD);

        assertThat(fetchMetrics(token).path("totalTickets").asLong()).isEqualTo(1);
        awaitCache(true);

        mockMvc.perform(post("/api/tickets")
                        .header(HttpHeaders.AUTHORIZATION, auth.bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(Map.of(
                                "title", "Second ticket", "description", "desc", "priority", "MEDIUM"))))
                .andExpect(status().isCreated());
        awaitCache(false);

        // Cache was evicted by the create, so the next read reflects the new row.
        assertThat(fetchMetrics(token).path("totalTickets").asLong()).isEqualTo(2);
        assertThat(fetchMetrics(token).path("ticketsByStatus").path("OPEN").asLong()).isEqualTo(2);
    }

    /**
     * Regression test for transaction-aware eviction: a mutation whose
     * transaction rolls back must not evict the cache. With a non-transaction-aware
     * manager the eviction would fire regardless and could leave the cache empty
     * (or, worse, repopulated from pre-commit state) for a mutation that never
     * happened.
     */
    @Test
    void rolledBackMutationDoesNotEvictCache() throws Exception {
        User customer = users.create(Role.CUSTOMER);
        User agent = users.create(Role.AGENT);
        String token = auth.login(agent.getEmail(), TestUserFactory.DEFAULT_PASSWORD);
        warmCache(token);

        long ticketsBefore = ticketRepository.count();

        CreateTicketRequest request = new CreateTicketRequest();
        request.setTitle("rollback");
        request.setDescription("must not persist");

        new TransactionTemplate(transactionManager).executeWithoutResult(status -> {
            ticketService.createTicket(request, customer);
            status.setRollbackOnly();
        });

        assertThat(ticketRepository.count()).isEqualTo(ticketsBefore);
        // The transaction rolled back, so its eviction was discarded: the snapshot
        // cached before the mutation is still valid and must still be present.
        assertThat(cached()).isTrue();
    }

    private void warmCache(String token) throws Exception {
        fetchMetrics(token);
        awaitCache(true);
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

    /**
     * Waits for the cache entry to reach the expected state. Cache delivery is not
     * instantaneous, so assertions poll rather than assume the write/eviction has
     * already been observed.
     */
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

    private Statistics statistics() {
        return entityManagerFactory.unwrap(SessionFactory.class).getStatistics();
    }
}
