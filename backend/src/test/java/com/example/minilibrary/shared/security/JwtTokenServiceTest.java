package com.example.minilibrary.shared.security;

import com.example.minilibrary.auth.Role;
import com.example.minilibrary.auth.User;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.text.ParseException;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenServiceTest {

    private JwtTokenService jwtTokenService;

    @BeforeEach
    void setUp() throws Exception {
        jwtTokenService = new JwtTokenService();

        // Inject @Value fields via reflection since we're not using Spring context
        Field secretField = JwtTokenService.class.getDeclaredField("secret");
        secretField.setAccessible(true);
        // HMAC-SHA256 requires at least 256 bits (32 bytes)
        secretField.set(jwtTokenService, "my-super-secret-key-that-is-long-enough-for-hs256!");

        Field ttlField = JwtTokenService.class.getDeclaredField("ttlSeconds");
        ttlField.setAccessible(true);
        ttlField.set(jwtTokenService, 3600L);
    }

    @Test
    void createToken_ShouldReturnValidJwt() throws ParseException {
        User user = new User("test@example.com", "password", Role.USER);

        String token = jwtTokenService.createToken(user);

        assertNotNull(token);
        assertFalse(token.isEmpty());

        // Parse and verify claims
        SignedJWT signedJWT = SignedJWT.parse(token);
        JWTClaimsSet claims = signedJWT.getJWTClaimsSet();

        assertEquals("test@example.com", claims.getSubject());
        assertEquals("USER", claims.getStringClaim("role"));
        assertNotNull(claims.getIssueTime());
        assertNotNull(claims.getExpirationTime());
        assertTrue(claims.getExpirationTime().after(claims.getIssueTime()));
    }

    @Test
    void createToken_ShouldContainCorrectRole_ForAdmin() throws ParseException {
        User user = new User("admin@example.com", "password", Role.ADMIN);

        String token = jwtTokenService.createToken(user);
        SignedJWT signedJWT = SignedJWT.parse(token);
        JWTClaimsSet claims = signedJWT.getJWTClaimsSet();

        assertEquals("ADMIN", claims.getStringClaim("role"));
    }

    @Test
    void createToken_ShouldThrowRuntimeException_WhenSecretInvalid() throws Exception {
        // Set a secret that's too short for HMAC-SHA256
        Field secretField = JwtTokenService.class.getDeclaredField("secret");
        secretField.setAccessible(true);
        secretField.set(jwtTokenService, "short");

        User user = new User("test@example.com", "password", Role.USER);

        assertThrows(RuntimeException.class, () -> jwtTokenService.createToken(user));
    }
}
