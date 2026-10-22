package com.syncdesk.integration;

import com.syncdesk.entity.User;
import com.syncdesk.enums.Role;
import com.syncdesk.support.AbstractIntegrationTest;
import com.syncdesk.support.TestUserFactory;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import tools.jackson.databind.JsonNode;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.emptyString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for registration and login against a real PostgreSQL
 * database and the application's real Spring Security stack.
 */
class AuthIntegrationTest extends AbstractIntegrationTest {

    @Test
    void login_withValidCredentials_returnsAccessTokenAndRole() throws Exception {
        User manager = users.create(Role.MANAGER);

        JsonNode body = jsonOf(mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginRequest(manager.getEmail(), TestUserFactory.DEFAULT_PASSWORD)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", not(emptyString())))
                .andReturn());

        assertThat(body.path("role").asString()).isEqualTo("MANAGER");
        assertThat(body.path("id").asLong()).isEqualTo(manager.getId());
        assertThat(body.path("name").asString()).isEqualTo(manager.getName());
    }

    @Test
    void login_withWrongPassword_isRejected() throws Exception {
        User customer = users.create(Role.CUSTOMER);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginRequest(customer.getEmail(), "definitely-not-the-password")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Bad credentials"));
    }

    @Test
    void login_withUnknownEmail_isRejected() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginRequest("nobody-" + System.nanoTime() + "@syncdesk.test", "whatever")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Bad credentials"));
    }

    @Test
    void login_withInvalidPayload_isRejectedByValidation() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"not-an-email\",\"password\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.email").exists())
                .andExpect(jsonPath("$.password").exists());
    }

    @Test
    void register_persistsUserWithHashedPasswordAndReturnsToken() throws Exception {
        String email = "registered-" + System.nanoTime() + "@syncdesk.test";
        String rawPassword = "Syncdesk123!";

        JsonNode body = jsonOf(mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(Map.of(
                                "name", "New Customer",
                                "email", email,
                                "password", rawPassword))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", not(emptyString())))
                .andReturn());

        assertThat(body.path("role").asString()).isEqualTo("CUSTOMER");

        User persisted = userRepository.findByEmail(email).orElseThrow();
        assertThat(persisted.getName()).isEqualTo("New Customer");
        assertThat(persisted.getRole()).isEqualTo(Role.CUSTOMER);
        assertThat(persisted.getPassword()).isNotEqualTo(rawPassword);
        assertThat(passwordEncoder.matches(rawPassword, persisted.getPassword())).isTrue();
    }

    @Test
    void register_withAlreadyUsedEmail_isRejected() throws Exception {
        User existing = users.create(Role.CUSTOMER);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(Map.of(
                                "name", "Duplicate",
                                "email", existing.getEmail(),
                                "password", "Syncdesk123!"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("already exists")));
    }

    @Test
    void tokenFromLogin_grantsAccessToProtectedEndpoint() throws Exception {
        User agent = users.create(Role.AGENT);
        String token = auth.login(agent.getEmail(), TestUserFactory.DEFAULT_PASSWORD);

        mockMvc.perform(get("/api/tickets").header(HttpHeaders.AUTHORIZATION, auth.bearer(token)))
                .andExpect(status().isOk());
    }

    @Test
    void protectedEndpoint_withTamperedToken_isRejectedWith401() throws Exception {
        mockMvc.perform(get("/api/tickets").header(HttpHeaders.AUTHORIZATION, "Bearer not.a.real.token"))
                .andExpect(status().isUnauthorized());
    }

    private String loginRequest(String email, String password) {
        return jsonMapper.writeValueAsString(Map.of("email", email, "password", password));
    }
}
