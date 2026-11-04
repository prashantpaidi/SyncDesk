package com.syncdesk.config;

import com.syncdesk.service.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.config.Customizer;
import org.springframework.beans.factory.annotation.Value;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    @Value("${cors.allowed-origins}")
    private List<String> allowedOrigins;

    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * Configures HTTP security and builds the application's SecurityFilterChain.
     *
     * @param http the HttpSecurity instance to configure
     * @return the configured SecurityFilterChain enforcing CORS, disabled CSRF, stateless sessions,
     *         permitting requests under /api/auth/**, restricting ticket deletion to ADMIN and
     *         ticket assignment to MANAGER/ADMIN, restricting user listing and the dashboard
     *         metrics endpoint to staff roles, requiring authentication for all other endpoints,
     *         and registering the custom authentication provider and JWT authentication filter
     * @throws Exception if an error occurs while configuring or building the security filter chain
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**", "/error").permitAll()
                        // Administrative operations are restricted at the filter chain, so the
                        // controller is never reached for an unauthorised caller.
                        .requestMatchers(HttpMethod.DELETE, "/api/tickets/*").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/tickets/*/assign/*").hasAnyRole("MANAGER", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/users").hasAnyRole("MANAGER", "ADMIN")
                        // Dashboard aggregates are staff-only: customers must not see global
                        // ticket counts, priorities or unassigned volume.
                        .requestMatchers(HttpMethod.GET, "/api/dashboard/**").hasAnyRole("AGENT", "MANAGER", "ADMIN")
                        .anyRequest().authenticated())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exceptions -> exceptions
                        // Requests without (or with an invalid) token are unauthenticated -> 401.
                        // Authenticated requests that are not permitted remain 403.
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Creates a PasswordEncoder that hashes passwords using the BCrypt algorithm.
     *
     * @return a PasswordEncoder that encodes passwords with BCrypt
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Creates a CorsConfigurationSource configured with the application's allowed origins and standard HTTP methods.
     *
     * <p>The resulting source applies the CORS configuration to all paths ("/**"), permits the HTTP methods
     * GET, POST, PUT, DELETE, OPTIONS, and HEAD, allows all headers, and enables credentials.</p>
     *
     * @return a CorsConfigurationSource configured with the injected allowed origins, permitted methods, allowed headers, and credentials enabled
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}