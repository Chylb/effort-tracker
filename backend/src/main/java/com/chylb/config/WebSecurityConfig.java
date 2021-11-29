package com.chylb.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcOperations;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.oauth2.client.InMemoryOAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.JdbcOAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@Configuration
public class WebSecurityConfig {

    @EnableWebSecurity
    public static class OAuth2LoginSecurityConfig extends WebSecurityConfigurerAdapter {
        @Autowired
        private JdbcOperations jdbcOperations;
        @Autowired
        private ClientRegistrationRepository clientRegistrationRepository;

        @Override
        protected void configure(HttpSecurity http) throws Exception {
            http
                    .authorizeRequests(a -> a
                            .antMatchers(HttpMethod.OPTIONS,"**").permitAll()
                            .antMatchers("/v3/**", "/swagger-ui.html", "/swagger-ui/**", "/login/**", "/callback").permitAll()
                            .anyRequest().authenticated()
                    )
                    .exceptionHandling(e -> e
                            .defaultAuthenticationEntryPointFor(getRestAuthenticationEntryPoint(), new AntPathRequestMatcher("**"))
                    )
                    .csrf().disable()
                    .oauth2Login()
                    .authorizedClientService(authorizedClientService())
                    .authorizationEndpoint().authorizationRequestResolver(new CustomAuthorizationRequestResolver(this.clientRegistrationRepository))
                    .and()
                    .defaultSuccessUrl("http://localhost:3000/", true);
        }

        private AuthenticationEntryPoint getRestAuthenticationEntryPoint() {
            return new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED);
        }

        private OAuth2AuthorizedClientService authorizedClientService() {
            return new JdbcOAuth2AuthorizedClientService(jdbcOperations, clientRegistrationRepository);
        }
    }
}

