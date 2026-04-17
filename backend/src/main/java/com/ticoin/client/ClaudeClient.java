package com.ticoin.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Minimal Anthropic Messages API client.
 * <p>
 * Uses Claude Haiku (cheapest + fastest) for market analysis summaries.
 * Returns null when the API key is not configured (disables the feature gracefully).
 */
@Slf4j
@Component
public class ClaudeClient {

    private final WebClient webClient;
    private final String apiKey;
    private final String model;
    private final boolean enabled;

    public ClaudeClient(
            WebClient.Builder builder,
            @Value("${ticoin.api.anthropic.base-url:https://api.anthropic.com}") String baseUrl,
            @Value("${ticoin.api.anthropic.api-key:}") String apiKey,
            @Value("${ticoin.api.anthropic.model:claude-haiku-4-5-20251001}") String model
    ) {
        this.apiKey = apiKey;
        this.model = model;
        this.enabled = apiKey != null && !apiKey.isBlank();
        this.webClient = builder
                .baseUrl(baseUrl)
                .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader("anthropic-version", "2023-06-01")
                .build();
    }

    public boolean isEnabled() {
        return enabled;
    }

    public String complete(String systemPrompt, String userPrompt) {
        if (!enabled) {
            log.debug("Claude client disabled (no API key)");
            return null;
        }
        try {
            Map<String, Object> body = Map.of(
                    "model", model,
                    "max_tokens", 800,
                    "system", systemPrompt,
                    "messages", List.of(Map.of(
                            "role", "user",
                            "content", userPrompt
                    ))
            );

            Map<?, ?> resp = webClient.post()
                    .uri("/v1/messages")
                    .header("x-api-key", apiKey)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(30))
                    .block();

            if (resp == null) return null;
            Object content = resp.get("content");
            if (!(content instanceof List<?> list) || list.isEmpty()) return null;
            Object first = list.get(0);
            if (!(first instanceof Map<?, ?> m)) return null;
            Object text = m.get("text");
            return text == null ? null : text.toString();
        } catch (Exception e) {
            log.warn("Claude API call failed: {}", e.getMessage());
            return null;
        }
    }
}
