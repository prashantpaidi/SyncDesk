package com.syncdesk.config;

import com.syncdesk.dto.ticket.response.DashboardMetricsResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.JacksonJsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext.SerializationPair;
import org.springframework.data.redis.serializer.RedisSerializer;
import tools.jackson.databind.ObjectMapper;

import java.time.Duration;

/**
 * Redis cache-aside configuration for the read-heavy dashboard metrics endpoint.
 *
 * <p>Caching is toggled by {@code syncdesk.cache.enabled} (default {@code true}).
 * Because {@link EnableCaching} itself is conditional, turning the property off
 * removes the caching interceptor entirely — every call goes straight to
 * PostgreSQL. That is what the k6 baseline run uses, without changing code.
 *
 * <p>Keys are plain strings (e.g. {@code dashboardMetrics::global}) so cache
 * entries are readable in Redis; values are JSON, using the application's
 * configured {@link ObjectMapper}.
 */
@Configuration
@EnableCaching
@ConditionalOnProperty(prefix = "syncdesk.cache", name = "enabled", havingValue = "true", matchIfMissing = true)
public class CacheConfig implements CachingConfigurer {

    @Override
    public CacheErrorHandler errorHandler() {
        return new LoggingCacheErrorHandler();
    }

    /**
     * Redis-backed {@link RedisCacheManager} with a bounded TTL.
     *
     * <p>{@code transactionAware()} defers cache writes and evictions until the
     * surrounding transaction commits. Without it, {@code @CacheEvict} fires when
     * the mutation method returns — just before the commit — so a concurrent
     * reader could repopulate the entry with pre-commit data and leave it stale
     * for up to the TTL. With it, the invariant is: commit succeeds → eviction →
     * the next reader rebuilds from committed state. The TTL remains a backstop
     * for anything the eager eviction misses (e.g. a Redis outage).
     */
    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory,
            ObjectMapper objectMapper,
            @Value("${syncdesk.cache.dashboard-ttl:60s}") Duration dashboardTtl) {
        RedisCacheConfiguration defaults = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(dashboardTtl)
                .serializeKeysWith(SerializationPair.fromSerializer(RedisSerializer.string()))
                .serializeValuesWith(SerializationPair.fromSerializer(
                        new JacksonJsonRedisSerializer<>(objectMapper, DashboardMetricsResponse.class)));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaults)
                .transactionAware()
                .build();
    }
}
