package com.unihub.app.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(config->config.disable())
            .cors(Customizer.withDefaults())
            .sessionManagement(session->session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests((authorize) ->
                authorize
                    .requestMatchers("/api/v1/auth/**").permitAll()
                    .anyRequest().authenticated())
            .oauth2Login(login-> {
                        login
                                .authorizationEndpoint(config -> config.baseUri("/api/v1/auth/oauth2/authorization"))
                                .redirectionEndpoint( config-> config.baseUri("/api/v1/auth/login/oauth2/callback/*"))
                                .successHandler(null)
                                .failureHandler(null);
            });

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource(){
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOriginPatterns(Arrays.asList("*"));
        config.setAllowCredentials(true);
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setAllowedMethods(
                Arrays.asList(
                        HttpMethod.GET.name(),
                        HttpMethod.POST.name(),
                        HttpMethod.PUT.name(),
                        HttpMethod.DELETE.name(),
                        HttpMethod.PATCH.name(),
                        HttpMethod.OPTIONS.name(),
                        HttpMethod.HEAD.name()
                )
        );

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService(PasswordEncoder passwordEncoder){
        UserDetails one = User.withUsername("david")
                .password(passwordEncoder.encode("pass"))
                .roles("USER")
                .build();
        UserDetails two = User.withUsername("john")
                .password(passwordEncoder.encode("pass"))
                .roles("USER","ADMIN")
                .build();
        UserDetailsService userDetailsService = new InMemoryUserDetailsManager(one,two);

        return userDetailsService;
    }
}
