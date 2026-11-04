package com.syncdesk.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.interceptor.CacheErrorHandler;

/**
 * Makes Redis a best-effort cache rather than a hard availability dependency.
 *
 * <p>Spring's default {@code SimpleCacheErrorHandler} rethrows any cache
 * exception, which would turn a Redis outage into a failed request. This handler
 * logs the failure and swallows it instead, so:
 * <ul>
 *   <li>a failing read is treated as a cache miss and the request is served from
 *       PostgreSQL;</li>
 *   <li>a failing write/evict is ignored (the stale entry is bounded by the TTL).</li>
 * </ul>
 */
@Slf4j
public class LoggingCacheErrorHandler implements CacheErrorHandler {

    @Override
    public void handleCacheGetError(RuntimeException exception, Cache cache, Object key) {
        log.warn("Cache read failed for cache '{}' key '{}'; falling back to source. Cause: {}",
                cache.getName(), key, exception.getMessage());
    }

    @Override
    public void handleCachePutError(RuntimeException exception, Cache cache, Object key, Object value) {
        log.warn("Cache write failed for cache '{}' key '{}'; continuing without caching. Cause: {}",
                cache.getName(), key, exception.getMessage());
    }

    @Override
    public void handleCacheEvictError(RuntimeException exception, Cache cache, Object key) {
        log.warn("Cache evict failed for cache '{}' key '{}'; stale entry bounded by TTL. Cause: {}",
                cache.getName(), key, exception.getMessage());
    }

    @Override
    public void handleCacheClearError(RuntimeException exception, Cache cache) {
        log.warn("Cache clear failed for cache '{}'; stale entries bounded by TTL. Cause: {}",
                cache.getName(), exception.getMessage());
    }
}
