package com.ticoin.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class OpenAiClient {

    private final WebClient webClient;
    private final String apiKey;
    private final String model;
    private final boolean enabled;

    public OpenAiClient(
            WebClient.Builder builder,
            @Value("${ticoin.api.openai.base-url:https://api.openai.com}") String baseUrl,
            @Value("${ticoin.api.openai.api-key:}") String apiKey,
            @Value("${ticoin.api.openai.model:gpt-5-mini}") String model
    ) {
        this.apiKey = apiKey;
        this.model = model;
        this.enabled = apiKey != null && !apiKey.isBlank();
        this.webClient = builder
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    public boolean isEnabled() {
        return enabled;
    }

    public String complete(String instructions, String input) {
        if (!enabled) {
            log.debug("OpenAI 클라이언트 비활성화: API 키가 설정되지 않았습니다");
            return null;
        }
        try {
            Map<String, Object> body = Map.of(
                    "model", model,
                    "instructions", instructions,
                    "input", input,
                    "max_output_tokens", 800
            );

            Map<?, ?> resp = webClient.post()
                    .uri("/v1/responses")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(30))
                    .block();

            return extractText(resp);
        } catch (Exception e) {
            log.warn("OpenAI API 호출 실패: {}", e.getMessage());
            return null;
        }
    }

    private String extractText(Map<?, ?> resp) {
        if (resp == null) return null;
        Object outputText = resp.get("output_text");
        if (outputText != null && !outputText.toString().isBlank()) {
            return outputText.toString();
        }
        Object output = resp.get("output");
        if (!(output instanceof List<?> items)) return null;
        StringBuilder text = new StringBuilder();
        for (Object item : items) {
            if (!(item instanceof Map<?, ?> itemMap)) continue;
            Object content = itemMap.get("content");
            if (!(content instanceof List<?> contentItems)) continue;
            for (Object contentItem : contentItems) {
                if (!(contentItem instanceof Map<?, ?> contentMap)) continue;
                Object value = contentMap.get("text");
                if (value != null) {
                    text.append(value);
                }
            }
        }
        return text.isEmpty() ? null : text.toString();
    }
}
