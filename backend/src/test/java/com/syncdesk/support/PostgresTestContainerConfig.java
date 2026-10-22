package com.syncdesk.support;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;

/**
 * Declares the single PostgreSQL container used by every integration test.
 *
 * <p>The container is published as a regular bean and annotated with
 * {@link ServiceConnection}, so Spring Boot starts it and derives the datasource
 * connection details (URL, username, password) from it. Because the whole suite
 * shares one cached application context, the container is started once and
 * reused across all test classes rather than being recreated per class.
 *
 * <p>Unlike a locally installed PostgreSQL, the container is fully disposable:
 * it is removed automatically after the test run.
 */
@TestConfiguration(proxyBeanMethods = false)
public class PostgresTestContainerConfig {

    private static final DockerImageName POSTGRES_IMAGE = DockerImageName.parse("postgres:16-alpine");

    @Bean
    @ServiceConnection
    PostgreSQLContainer postgresContainer() {
        return new PostgreSQLContainer(POSTGRES_IMAGE)
                .withDatabaseName("syncdesk")
                .withUsername("syncdesk")
                .withPassword("syncdesk");
    }
}
