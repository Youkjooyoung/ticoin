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
public class RedditNewsClient {

    private final WebClient webClient;
    private final String baseUrl;

    public RedditNewsClient(WebClient.Builder builder,
                            @Value("${ticoin.api.reddit.base-url}") String baseUrl) {
        this.baseUrl = baseUrl;
        this.webClient = builder
                .baseUrl(baseUrl)
                .defaultHeader("User-Agent", "ticoin/1.0 (by /u/ticoin)")
                .build();
    }

    @Cacheable(value = "reddit-news", key = "#subreddit")
    public List<NewsDto> fetchTop(String subreddit) {
        try {
            Map<String, Object> resp = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/r/{sub}/top.json")
                            .queryParam("limit", 20)
                            .queryParam("t", "day")
                            .build(subreddit))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (resp == null) return List.of();
            Map<String, Object> data = (Map<String, Object>) resp.get("data");
            if (data == null) return List.of();
            List<Map<String, Object>> children = (List<Map<String, Object>>) data.get("children");
            if (children == null) return List.of();

            return children.stream()
                    .map(c -> (Map<String, Object>) c.get("data"))
                    .filter(d -> d != null && Boolean.FALSE.equals(d.getOrDefault("stickied", false)))
                    .limit(15)
                    .map(this::mapToNews)
                    .toList();
        } catch (Exception e) {
            log.warn("Reddit fetch failed for r/{}: {}", subreddit, e.getMessage());
            return List.of();
        }
    }

    private NewsDto mapToNews(Map<String, Object> d) {
        String permalink = (String) d.get("permalink");
        String url = (String) d.get("url");
        String thumbnail = (String) d.get("thumbnail");
        if (thumbnail == null || thumbnail.isBlank() || thumbnail.equals("self") || thumbnail.equals("default")) {
            thumbnail = null;
        } else {
            thumbnail = decodeHtmlEntities(thumbnail);
            if (thumbnail.contains("external-preview.redd.it") || thumbnail.contains("preview.redd.it")) {
                // Reddit's CDN blocks hotlinking via ORB — drop the URL instead of showing a broken icon.
                thumbnail = null;
            }
        }
        long created = ((Number) d.getOrDefault("created_utc", 0)).longValue();
        return new NewsDto(
                "reddit-" + d.get("id"),
                (String) d.get("title"),
                (String) d.getOrDefault("selftext", ""),
                url != null && !url.startsWith("http") ? (baseUrl + permalink) : url,
                "r/" + d.get("subreddit"),
                thumbnail,
                Instant.ofEpochSecond(created),
                "reddit"
        );
    }

    private static String decodeHtmlEntities(String s) {
        if (s == null) return null;
        return s.replace("&amp;", "&")
                .replace("&lt;", "<")
                .replace("&gt;", ">")
                .replace("&quot;", "\"")
                .replace("&#39;", "'");
    }
}
