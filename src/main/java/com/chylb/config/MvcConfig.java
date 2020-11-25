package com.chylb.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class MvcConfig implements WebMvcConfigurer {

    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/home").setViewName("home");
        registry.addViewController("/").setViewName("home");
        registry.addViewController("/login").setViewName("login");
        registry.addViewController("/activities").setViewName("activities");
        registry.addViewController("/distances").setViewName("distances");
        registry.addViewController("/distance/{id}").setViewName("distance");
        registry.addViewController("/activity/{id}").setViewName("activity");
        registry.addViewController("/error").setViewName("error");
    }
}

