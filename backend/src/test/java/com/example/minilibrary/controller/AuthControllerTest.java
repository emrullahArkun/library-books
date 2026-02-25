package com.example.minilibrary.controller;

import com.example.minilibrary.dto.auth.LoginRequest;
import com.example.minilibrary.dto.auth.RegisterRequest;
import com.example.minilibrary.model.Role;
import com.example.minilibrary.model.User;
import com.example.minilibrary.security.JwtTokenService;
import com.example.minilibrary.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.security.Principal;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @Mock
    private JwtTokenService jwtTokenService;

    @InjectMocks
    private AuthController authController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
        objectMapper = new ObjectMapper();
    }

    @Test
    void register_ShouldReturnOk() throws Exception {
        RegisterRequest request = new RegisterRequest("test@example.com", "password");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void login_ShouldReturnToken() throws Exception {
        LoginRequest request = new LoginRequest("test@example.com", "password");
        User user = new User();
        user.setEmail("test@example.com");
        user.setRole(Role.USER);

        when(authService.login(anyString(), anyString())).thenReturn(user);
        when(jwtTokenService.createToken(any(User.class))).thenReturn("jwt-token");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    void getSession_ShouldReturnUserDetails_WhenPrincipalExists() throws Exception {
        Principal principal = () -> "test@example.com";
        User user = new User();
        user.setEmail("test@example.com");
        user.setRole(Role.USER);

        when(authService.getUserByEmail("test@example.com")).thenReturn(user);

        mockMvc.perform(get("/api/auth/session")
                .principal(principal))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.valid").value(true));
    }

    @Test
    void getSession_ShouldReturn401_WhenPrincipalIsNull() throws Exception {
        mockMvc.perform(get("/api/auth/session"))
                .andExpect(status().isUnauthorized());
    }
}
