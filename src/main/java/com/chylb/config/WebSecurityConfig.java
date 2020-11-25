package com.chylb.config;//package com.example;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@Configuration
public class WebSecurityConfig {

    @EnableWebSecurity
    public static class OAuth2LoginSecurityConfig extends WebSecurityConfigurerAdapter {

        @Override
        protected void configure(HttpSecurity http) throws Exception {
            http
                    .authorizeRequests(a -> a
                            .antMatchers("/login", "/error", "/webjars/**", "/images/**", "/css/**", "/js/**").permitAll()
                            .anyRequest().authenticated()
                    )
                    .exceptionHandling(e -> e
                            .defaultAuthenticationEntryPointFor(getRestAuthenticationEntryPoint(), new AntPathRequestMatcher("/api/**"))
                    )
                    .csrf(c -> c
                            .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                    )
                    .logout(l -> l
                            .logoutSuccessUrl("/login").permitAll()
                    )
                    .oauth2Login()
                    .loginPage("/login")
                    .defaultSuccessUrl("/home", true);
        }

        private AuthenticationEntryPoint getRestAuthenticationEntryPoint() {
            return new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED);
        }
    }
}

