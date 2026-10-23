package com.syncdesk.support;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.utility.DockerImageName;

/**
 * Declares a disposable Redis container for the cache integration tests.
 *
 * <p>Redis is a real external dependency of the cache-aside path, so the tests
 * exercise it for real (no mocks).
 *
 * <p>Spring Boot 4 does not derive Redis connection details from a plain
 * {@link GenericContainer} through {@code @ServiceConnection} (only from
 * recognised container types), so the {@link RedisConnectionFactory} is built
 * explicitly from the running container. A {@code redis:7-alpine} container is
 * used, matching the compose file and CI.
 *
 * <p>Imported only by the tests that actually need Redis, so the rest of the
 * suite is not slowed down by an extra container.
 */
@TestConfiguration(proxyBeanMethods = false)
public class RedisTestContainerConfig {

    private static final DockerImageName REDIS_IMAGE = DockerImageName.parse("redis:7-alpine");
    private static final int REDIS_PORT = 6379;

    @Bean(initMethod = "start", destroyMethod = "stop")
    GenericContainer<?> redisContainer() {
        return new GenericContainer<>(REDIS_IMAGE).withExposedPorts(REDIS_PORT);
    }

    @Bean
    RedisConnectionFactory redisConnectionFactory(GenericContainer<?> redisContainer) {
        LettuceConnectionFactory factory =
                new LettuceConnectionFactory("127.0.0.1", redisContainer.getMappedPort(REDIS_PORT));
        // Establish the connection up front and share it, mirroring the
        // application setting, so cache operations are applied eagerly.
        factory.setShareNativeConnection(true);
        factory.setEagerInitialization(true);
        return factory;
    }
}
