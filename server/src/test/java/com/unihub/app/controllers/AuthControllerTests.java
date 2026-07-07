package com.unihub.app.controllers;

import com.unihub.app.config.SecurityConfig;
import com.unihub.app.config.SessionProperties;
import com.unihub.app.dto.auth.LocalRegisterRequestDto;
import com.unihub.app.entities.User;
import com.unihub.app.mappers.ObjectErrorMapper;
import com.unihub.app.mappers.UserMapper;
import com.unihub.app.repositories.SessionRepository;
import com.unihub.app.repositories.UserRepository;
import com.unihub.app.services.JwtService;
import com.unihub.app.services.SessionService;
import com.unihub.app.services.UserService;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@EnableConfigurationProperties(SessionProperties.class)
@Import({SessionService.class, UserService.class, JwtService.class, SecurityConfig.class, UserMapper.class, ObjectErrorMapper.class})
public class AuthControllerTests {

    private static final String BASE_URL = "/api/v1/auth";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private SessionRepository sessionRepository;

    @MockitoBean
    private UserRepository userRepository;

    @Test
    @DisplayName("""
            Given: unauthenticated user
            When: /register/password endpoint is called a valid and unique set of credentials
            Then: 200 ok is returned
            """)
    public void testLocalRegister1() throws Exception {
        when(userRepository.findByUsernameOrEmail(anyString(),anyString())).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation -> {
                    User user = invocation.getArgument(0, User.class);
                    user.setId(UUID.randomUUID());
                    return user;
                });

        var request = new LocalRegisterRequestDto("test@gmail.com","test","12345678");

        var response = mockMvc.perform(post(BASE_URL + "/register/local")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)));

        response.andExpect(status().isOk())
                .andExpect(jsonPath("$.user.id").exists())
                .andExpect(jsonPath("$.user.username").value(request.getUsername()))
                .andExpect(jsonPath("$.user.email").value(request.getEmail()))
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(cookie().exists("refreshToken"));
    }

    @Test
    @DisplayName("""
            Given: unauthenticated user
            When: /register/password endpoint is called with an existing username
            Then: 409 conflict is returned
            """)
    public void testLocalRegister2() throws Exception {
        when(userRepository.findByUsernameOrEmail(anyString(),anyString()))
                .thenAnswer(invocation -> {
                    String username = invocation.getArgument(0, String.class);
                    return Optional.of(User.builder()
                            .username(username)
                            .id(UUID.randomUUID())
                            .email("random@gmail.com")
                            .build());
                });

        var request = new LocalRegisterRequestDto("test@gmail.com","test","12345678");

        var response = mockMvc.perform(post(BASE_URL + "/register/local")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)));

        response.andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("Username is taken"));
    }

    @Test
    @DisplayName("""
            Given: unauthenticated user
            When: /register/password endpoint is called with an existing email
            Then: 409 conflict is returned
            """)
    public void testLocalRegister3() throws Exception {
        when(userRepository.findByUsernameOrEmail(anyString(),anyString()))
                .thenAnswer(invocation -> {
                    String email = invocation.getArgument(1, String.class);
                    return Optional.of(User.builder()
                            .email(email)
                            .id(UUID.randomUUID())
                            .username("abc")
                            .build());
                });

        var request = new LocalRegisterRequestDto("test@gmail.com","test","12345678");

        var response = mockMvc.perform(post(BASE_URL + "/register/local")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)));

        response.andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("Email is taken"));
    }

    @Test
    @DisplayName("""
            Given: unauthenticated user
            When: /register/password endpoint is called with both an existing email and username
            Then: 409 conflict is returned
            """)
    public void testLocalRegister4() throws Exception {
        when(userRepository.findByUsernameOrEmail(anyString(),anyString()))
                .thenAnswer(invocation -> {
                    String email = invocation.getArgument(1, String.class);
                    String username = invocation.getArgument(0, String.class);
                    return Optional.of(User.builder()
                            .email(email)
                            .id(UUID.randomUUID())
                            .username(username)
                            .build());
                });

        var request = new LocalRegisterRequestDto("test@gmail.com","test","12345678");

        var response = mockMvc.perform(post(BASE_URL + "/register/local")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)));

        response.andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("Username and email are already taken"));
    }


}
