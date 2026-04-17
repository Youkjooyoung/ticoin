package com.ticoin.security;

import com.ticoin.entity.User;
import com.ticoin.service.UserService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserService userService;

    @Value("${ticoin.auth.redirect-url:http://localhost:5174/auth/callback}")
    private String redirectUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        if (!(authentication instanceof OAuth2AuthenticationToken token)) {
            response.sendRedirect(redirectUrl + "?error=unknown");
            return;
        }

        String registrationId = token.getAuthorizedClientRegistrationId();
        OAuth2User principal = token.getPrincipal();
        Map<String, Object> attributes = principal.getAttributes();

        OAuthPayload payload = extractPayload(registrationId, attributes);
        if (payload == null) {
            response.sendRedirect(redirectUrl + "?error=invalid_provider");
            return;
        }

        User user = userService.upsertFromOAuth(
                registrationId, payload.providerId, payload.email, payload.name, payload.avatarUrl
        );

        String jwt = jwtService.issue(user.getId(), user.getEmail(), user.getRole());
        String target = redirectUrl
                + "?token=" + URLEncoder.encode(jwt, StandardCharsets.UTF_8)
                + "&provider=" + URLEncoder.encode(registrationId, StandardCharsets.UTF_8);

        log.info("OAuth2 success for provider={}, userId={}", registrationId, user.getId());
        getRedirectStrategy().sendRedirect(request, response, target);
    }

    private OAuthPayload extractPayload(String provider, Map<String, Object> attrs) {
        return switch (provider) {
            case "google" -> new OAuthPayload(
                    String.valueOf(attrs.get("sub")),
                    (String) attrs.get("email"),
                    (String) attrs.get("name"),
                    (String) attrs.get("picture")
            );
            case "kakao" -> {
                String id = String.valueOf(attrs.get("id"));
                @SuppressWarnings("unchecked")
                Map<String, Object> account = (Map<String, Object>) attrs.getOrDefault("kakao_account", Map.of());
                @SuppressWarnings("unchecked")
                Map<String, Object> profile = (Map<String, Object>) account.getOrDefault("profile", Map.of());
                yield new OAuthPayload(
                        id,
                        (String) account.get("email"),
                        (String) profile.get("nickname"),
                        (String) profile.get("profile_image_url")
                );
            }
            default -> null;
        };
    }

    private record OAuthPayload(String providerId, String email, String name, String avatarUrl) {}
}
