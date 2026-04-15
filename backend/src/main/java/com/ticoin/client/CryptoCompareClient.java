package com.ticoin.client;

import com.ticoin.dto.NewsDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class CryptoCompareClient {

    private final WebClient webClient;

    public CryptoCompareClient(WebClient.Builder builder,
                               @Value("${ticoin.api.cryptocompare.base-url}") String baseUrl) {
        this.webClient = builder.baseUrl(baseUrl).build();
    }

    @Cacheable(value = "crypto-news", key = "#category == null ? 'ALL' : #category")
    public List<NewsDto> fetchNews(String category) {
        try {
            Map<String, Object> resp = webClient.get()
                    .uri(uriBuilder -> {
                        var b = uriBuilder.path("/data/v2/news/").queryParam("lang", "EN");
                        if (category != null && !category.isBlank()) b.queryParam("categories", category);
                        return b.build();
                    })
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (resp == null) return List.of();
            List<Map<String, Object>> data = (List<Map<String, Object>>) resp.get("Data");
            if (data == null) return List.of();

            return data.stream().limit(30).map(this::mapToNews).toList();
        } catch (Exception e) {
            log.warn("CryptoCompare news fetch failed: {}", e.getMessage());
            return List.of();
        }
    }

    private NewsDto mapToNews(Map<String, Object> m) {
        long published = ((Number) m.getOrDefault("published_on", 0)).longValue();
        return new NewsDto(
                String.valueOf(m.get("id")),
                (String) m.get("title"),
                (String) m.get("body"),
                (String) m.get("url"),
                (String) m.get("source"),
                (String) m.get("imageurl"),
                Instant.ofEpochSecond(published),
                (String) m.get("categories")
        );
    }
}
