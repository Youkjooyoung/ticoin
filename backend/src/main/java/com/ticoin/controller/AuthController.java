package com.ticoin.controller;

import com.ticoin.dto.LoginRequest;
import com.ticoin.dto.RegisterRequest;
import com.ticoin.entity.User;
import com.ticoin.repository.UserRepository;
import com.ticoin.security.JwtService;
import com.ticoin.service.UserService;
import jakarta.validation.Valid;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final UserService userService;

    @Value("${spring.security.oauth2.client.registration.google.client-id:disabled}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.kakao.client-id:disabled}")
    private String kakaoClientId;

    @GetMapping("/providers")
    public Map<String, Object> providers() {
        return Map.of(
                "providers", List.of(
                        Map.of("id", "local", "label", "Email",
                               "enabled", true,
                               "loginUrl", "/login"),
                        Map.of("id", "google", "label", "Google",
                               "enabled", isEnabled(googleClientId),
                               "loginUrl", "/oauth2/authorization/google"),
                        Map.of("id", "kakao",  "label", "Kakao",
                               "enabled", isEnabled(kakaoClientId),
                               "loginUrl", "/oauth2/authorization/kakao")
                ),
                "guestMode", true
        );
    }

    @PostMapping("/register")
    public Map<String, Object> register(@Valid @RequestBody RegisterRequest request) {
        User user = userService.registerLocal(request.email(), request.password(), request.name());
        return authPayload(user);
    }

    @PostMapping("/login")
    public Map<String, Object> login(@Valid @RequestBody LoginRequest request) {
        User user = userService.loginLocal(request.email(), request.password());
        return authPayload(user);
    }

    private boolean isEnabled(String clientId) {
        return clientId != null && !clientId.isBlank() && !"disabled".equals(clientId);
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            return ResponseEntity.ok(Map.of("authenticated", false));
        }
        Claims claims = jwtService.parse(header.substring(7));
        if (claims == null) {
            return ResponseEntity.ok(Map.of("authenticated", false));
        }
        Long userId = Long.valueOf(claims.getSubject());
        return userRepository.findById(userId)
                .<ResponseEntity<Map<String, Object>>>map(user -> ResponseEntity.ok(Map.of(
                        "authenticated", true,
                        "user", Map.of(
                                "id", user.getId(),
                                "email", user.getEmail() != null ? user.getEmail() : "",
                                "name", user.getName() != null ? user.getName() : "",
                                "avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : "",
                                "provider", user.getProvider(),
                                "role", user.getRole()
                        )
                )))
                .orElse(ResponseEntity.ok(Map.of("authenticated", false)));
    }

    @GetMapping("/failure")
    public Map<String, Object> failure() {
        return Map.of("error", "oauth2_failed");
    }

    private Map<String, Object> authPayload(User user) {
        return Map.of(
                "token", jwtService.issue(user.getId(), user.getEmail(), user.getRole()),
                "user", Map.of(
                        "id", user.getId(),
                        "email", user.getEmail() != null ? user.getEmail() : "",
                        "name", user.getName() != null ? user.getName() : "",
                        "avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : "",
                        "provider", user.getProvider(),
                        "role", user.getRole()
                )
        );
    }
}
