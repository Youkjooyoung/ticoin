package com.ticoin.client;

import com.ticoin.dto.AssetDto;
import com.ticoin.dto.CandleDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.util.*;

@Slf4j
@Component
public class CoinGeckoClient {

    private final WebClient webClient;

    public CoinGeckoClient(WebClient.Builder builder,
                           @Value("${ticoin.api.coingecko.base-url}") String baseUrl) {
        this.webClient = builder.baseUrl(baseUrl).build();
    }

    @Cacheable("coingecko-markets")
    public List<AssetDto> fetchMarkets(List<String> ids) {
        String idsParam = String.join(",", ids);
        try {
            List<Map<String, Object>> resp = webClient.get()
                    .uri(uriBuilder -> uriBuilder.path("/coins/markets")
                            .queryParam("vs_currency", "usd")
                            .queryParam("ids", idsParam)
                            .queryParam("order", "market_cap_desc")
                            .queryParam("sparkline", "true")
                            .queryParam("price_change_percentage", "24h")
                            .build())
                    .retrieve()
                    .bodyToMono(List.class)
                    .block();

            if (resp == null) return List.of();
            return resp.stream().map(this::mapToAsset).toList();
        } catch (Exception e) {
            log.warn("CoinGecko markets fetch failed: {}", e.getMessage());
            return List.of();
        }
    }

    @Cacheable(value = "coingecko-trending", unless = "#result.isEmpty()")
    public List<AssetDto> fetchTrending() {
        try {
            Map<String, Object> resp = webClient.get()
                    .uri("/search/trending")
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (resp == null) return List.of();
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> coins = (List<Map<String, Object>>) resp.get("coins");
            if (coins == null) return List.of();

            List<String> ids = coins.stream()
                    .map(c -> (Map<String, Object>) c.get("item"))
                    .map(item -> (String) item.get("id"))
                    .limit(10)
                    .toList();

            return fetchMarkets(ids);
        } catch (Exception e) {
            log.warn("CoinGecko trending failed: {}", e.getMessage());
            return List.of();
        }
    }

    @Cacheable(value = "coingecko-ohlc", key = "#id + ':' + #days")
    public List<CandleDto> fetchOhlc(String id, int days) {
        try {
            List<List<Object>> resp = webClient.get()
                    .uri(uriBuilder -> uriBuilder.path("/coins/{id}/ohlc")
                            .queryParam("vs_currency", "usd")
                            .queryParam("days", days)
                            .build(id))
                    .retrieve()
                    .bodyToMono(List.class)
                    .block();

            if (resp == null) return List.of();
            return resp.stream()
                    .map(row -> new CandleDto(
                            ((Number) row.get(0)).longValue() / 1000,
                            bd(row.get(1)),
                            bd(row.get(2)),
                            bd(row.get(3)),
                            bd(row.get(4)),
                            BigDecimal.ZERO))
                    .toList();
        } catch (Exception e) {
            log.warn("CoinGecko OHLC failed for {}: {}", id, e.getMessage());
            return List.of();
        }
    }

    @SuppressWarnings("unchecked")
    private AssetDto mapToAsset(Map<String, Object> m) {
        List<CandleDto> sparkline = List.of();
        Object sparkObj = m.get("sparkline_in_7d");
        if (sparkObj instanceof Map<?, ?> sparkMap) {
            Object priceObj = sparkMap.get("price");
            if (priceObj instanceof List<?> prices) {
                sparkline = new ArrayList<>();
                long now = System.currentTimeMillis() / 1000;
                for (int i = 0; i < prices.size(); i++) {
                    BigDecimal p = bd(prices.get(i));
                    sparkline.add(new CandleDto(now - (prices.size() - i) * 3600L, p, p, p, p, BigDecimal.ZERO));
                }
            }
        }
        return new AssetDto(
                ((String) m.get("symbol")).toUpperCase(),
                (String) m.get("name"),
                "CRYPTO",
                bd(m.get("current_price")),
                bd(m.get("price_change_24h")),
                bd(m.get("price_change_percentage_24h")),
                bd(m.get("market_cap")),
                bd(m.get("total_volume")),
                bd(m.get("high_24h")),
                bd(m.get("low_24h")),
                (String) m.get("image"),
                sparkline
        );
    }

    private BigDecimal bd(Object o) {
        if (o == null) return BigDecimal.ZERO;
        if (o instanceof Number n) return new BigDecimal(n.toString());
        try { return new BigDecimal(o.toString()); } catch (Exception e) { return BigDecimal.ZERO; }
    }
}
