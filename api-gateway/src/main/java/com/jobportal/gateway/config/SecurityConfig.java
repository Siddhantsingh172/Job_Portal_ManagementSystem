package com.jobportal.gateway.config;

import com.jobportal.commonsecurity.security.JwtAuthenticationFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import com.jobportal.commonsecurity.config.CommonSecurityConfiguration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Configuration
@Import(CommonSecurityConfiguration.class)
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    // Requests from the frontend (localhost:5173) skip JWT enforcement
    private static final String FRONTEND_ORIGIN = "http://localhost:5173";

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Always public
                        .requestMatchers(
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/actuator/health",
                                "/actuator/info",
                                "/api/users/register",
                                "/api/users/login",
                                "/api/users/refresh-token",
                                "/api/search/**"
                        ).permitAll()
                        // Everything else: handled by the filter below
                        .anyRequest().permitAll()
                )
                // Only apply JWT filter for non-frontend requests
                .addFilterBefore(new FrontendAwareJwtFilter(jwtAuthenticationFilter), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Wraps the JWT filter — skips it if the request comes from the frontend origin.
     * Direct API calls (Swagger, Postman) still go through JWT validation.
     */
    static class FrontendAwareJwtFilter extends OncePerRequestFilter {

        private final JwtAuthenticationFilter jwtAuthenticationFilter;

        FrontendAwareJwtFilter(JwtAuthenticationFilter jwtAuthenticationFilter) {
            this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        }

        @Override
        protected void doFilterInternal(HttpServletRequest request,
                                        HttpServletResponse response,
                                        FilterChain filterChain) throws ServletException, IOException {
            String origin = request.getHeader("Origin");
            String referer = request.getHeader("Referer");

            boolean fromFrontend = (origin != null && origin.startsWith(FRONTEND_ORIGIN))
                    || (referer != null && referer.startsWith(FRONTEND_ORIGIN));

            if (fromFrontend) {
                // Skip JWT — frontend has full access after login
                filterChain.doFilter(request, response);
            } else {
                // Direct API access — enforce JWT
                jwtAuthenticationFilter.doFilter(request, response, filterChain);
            }
        }
    }
}
