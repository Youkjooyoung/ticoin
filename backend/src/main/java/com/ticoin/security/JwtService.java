package com.ticoin.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

@Slf4j
@Service
public class JwtService {

    private final SecretKey key;
    private final Duration ttl;
    private final String issuer;

    public JwtService(
            @Value("${ticoin.auth.jwt.secret:change-me-in-production-at-least-32-characters-long}") String secret,
            @Value("${ticoin.auth.jwt.ttl:P7D}") Duration ttl,
            @Value("${ticoin.auth.jwt.issuer:ticoin}") String issuer
    ) {
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            byte[] padded = new byte[32];
            System.arraycopy(bytes, 0, padded, 0, bytes.length);
            bytes = padded;
        }
        this.key = Keys.hmacShaKeyFor(bytes);
        this.ttl = ttl;
        this.issuer = issuer;
    }

    public String issue(Long userId, String email, String role) {
        Instant now = Instant.now();
        return Jwts.builder()
                .issuer(issuer)
                .subject(String.valueOf(userId))
                .claim("email", email)
                .claim("role", role != null ? role : "USER")
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(ttl)))
                .signWith(key)
                .compact();
    }

    public Claims parse(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(key)
                    .requireIssuer(issuer)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            log.debug("JWT parse failed: {}", e.getMessage());
            return null;
        }
    }

    public Map<String, Object> asClaimMap(Claims claims) {
        if (claims == null) return Map.of();
        return Map.of(
                "userId", Long.valueOf(claims.getSubject()),
                "email", claims.get("email", String.class) == null ? "" : claims.get("email", String.class),
                "role", claims.get("role", String.class) == null ? "USER" : claims.get("role", String.class)
        );
    }
}
