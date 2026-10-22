package com.syncdesk.support;

import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import tools.jackson.databind.json.JsonMapper;

import java.nio.charset.StandardCharsets;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Obtains JWTs for integration tests by driving the real
 * {@code POST /api/auth/login} endpoint, so the tokens the tests use are exactly
 * the ones the application issues.
 */
public class TestAuthHelper {

    private final MockMvc mockMvc;
    private final JsonMapper jsonMapper;

    public TestAuthHelper(MockMvc mockMvc, JsonMapper jsonMapper) {
        this.mockMvc = mockMvc;
        this.jsonMapper = jsonMapper;
    }

    public String login(String email, String rawPassword) {
        try {
            MvcResult result = mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(jsonMapper.writeValueAsString(Map.of(
                                    "email", email,
                                    "password", rawPassword))))
                    .andExpect(status().isOk())
                    .andReturn();
            String body = new String(result.getResponse().getContentAsByteArray(), StandardCharsets.UTF_8);
            String token = jsonMapper.readTree(body).path("token").asString("");
            if (token.isEmpty()) {
                throw new IllegalStateException("Login response did not contain a token");
            }
            return token;
        } catch (Exception ex) {
            throw new IllegalStateException("Could not log in as " + email, ex);
        }
    }

    public String bearer(String token) {
        return "Bearer " + token;
    }
}
