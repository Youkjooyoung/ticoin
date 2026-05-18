package com.ticoin.client;

import com.ticoin.dto.AssetDto;
import com.ticoin.dto.CandleDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Component
public class UpbitClient {

    private final WebClient webClient;

    public UpbitClient(WebClient.Builder builder,
                       @Value("${ticoin.api.upbit.base-url}") String baseUrl) {
        this.webClient = builder.baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.USER_AGENT, "ticoin/0.6.0")
                .defaultHeader(HttpHeaders.ACCEPT_LANGUAGE, "ko-KR,ko;q=0.9,en-US;q=0.8")
                .build();
    }

    @Cacheable(value = "upbit-markets", unless = "#result.isEmpty()")
    public List<Map<String, Object>> fetchKrwMarkets() {
        try {
            List<Map<String, Object>> resp = webClient.get()
                    .uri(uriBuilder -> uriBuilder.path("/v1/market/all")
                            .queryParam("isDetails", "false")
                            .build())
                    .retrieve()
                    .bodyToMono(List.class)
                    .block();

            if (resp == null) return List.of();
            return resp.stream()
                    .filter(m -> string(m.get("market")).startsWith("KRW-"))
                    .toList();
        } catch (Exception e) {
            log.warn("업비트 마켓 목록 조회 실패: {}", e.getMessage());
            return List.of();
        }
    }

    @Cacheable(value = "upbit-tickers", key = "#markets.toString()", unless = "#result.isEmpty()")
    public List<AssetDto> fetchTickers(List<String> markets) {
        if (markets == null || markets.isEmpty()) return List.of();
        List<String> normalized = markets.stream()
                .filter(Objects::nonNull)
                .map(s -> s.toUpperCase(Locale.ROOT))
                .distinct()
                .toList();
        if (normalized.isEmpty()) return List.of();

        Map<String, Map<String, Object>> marketNames = fetchKrwMarkets().stream()
                .collect(Collectors.toMap(m -> string(m.get("market")), Function.identity(), (a, b) -> a));

        try {
            List<Map<String, Object>> resp = webClient.get()
                    .uri(uriBuilder -> uriBuilder.path("/v1/ticker")
                            .queryParam("markets", String.join(",", normalized))
                            .build())
                    .retrieve()
                    .bodyToMono(List.class)
                    .block();

            if (resp == null) return List.of();
            return resp.stream()
                    .map(ticker -> mapToAsset(ticker, marketNames.get(string(ticker.get("market")))))
                    .toList();
        } catch (Exception e) {
            log.warn("업비트 현재가 조회 실패: {}", e.getMessage());
            return List.of();
        }
    }

    @Cacheable(value = "upbit-top", unless = "#result.isEmpty()")
    public List<AssetDto> fetchTopKrwTickers() {
        List<String> markets = fetchKrwMarkets().stream()
                .map(m -> string(m.get("market")))
                .limit(80)
                .toList();
        return fetchTickers(markets).stream()
                .sorted(Comparator.comparing(AssetDto::volume24h, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(12)
                .toList();
    }

    public List<AssetDto> searchKrwMarkets(String query) {
        String q = query == null ? "" : query.trim().toUpperCase(Locale.ROOT);
        if (q.isBlank()) return List.of();
        List<String> matches = fetchKrwMarkets().stream()
                .filter(m -> {
                    String market = string(m.get("market")).toUpperCase(Locale.ROOT);
                    String english = string(m.get("english_name")).toUpperCase(Locale.ROOT);
                    String korean = string(m.get("korean_name")).toUpperCase(Locale.ROOT);
                    return market.contains(q) || english.contains(q) || korean.contains(q);
                })
                .map(m -> string(m.get("market")))
                .limit(20)
                .toList();
        return fetchTickers(matches);
    }

    @Cacheable(value = "upbit-candles", key = "#market + ':' + #interval")
    public List<CandleDto> fetchCandles(String market, String interval) {
        String normalizedMarket = normalizeMarket(market);
        String normalizedInterval = interval == null ? "1D" : interval.toUpperCase(Locale.ROOT);
        String path = switch (normalizedInterval) {
            case "15M" -> "/v1/candles/minutes/15";
            case "1H" -> "/v1/candles/minutes/60";
            case "4H" -> "/v1/candles/minutes/240";
            case "1W" -> "/v1/candles/weeks";
            default -> "/v1/candles/days";
        };

        try {
            List<Map<String, Object>> resp = webClient.get()
                    .uri(uriBuilder -> uriBuilder.path(path)
                            .queryParam("market", normalizedMarket)
                            .queryParam("count", 120)
                            .build())
                    .retrieve()
                    .bodyToMono(List.class)
                    .block();

            if (resp == null) return List.of();
            List<CandleDto> out = new ArrayList<>();
            for (int i = resp.size() - 1; i >= 0; i--) {
                Map<String, Object> row = resp.get(i);
                out.add(new CandleDto(
                        time(row),
                        bd(row.get("opening_price")),
                        bd(row.get("high_price")),
                        bd(row.get("low_price")),
                        bd(row.get("trade_price")),
                        bd(row.get("candle_acc_trade_volume"))
                ));
            }
            return out;
        } catch (Exception e) {
            log.warn("업비트 캔들 조회 실패 market={} interval={}: {}", normalizedMarket, normalizedInterval, e.getMessage());
            return List.of();
        }
    }

    private AssetDto mapToAsset(Map<String, Object> ticker, Map<String, Object> marketInfo) {
        String market = string(ticker.get("market"));
        String name = marketInfo == null ? market : string(marketInfo.getOrDefault("korean_name", market));
        BigDecimal rate = bd(ticker.get("signed_change_rate")).multiply(new BigDecimal("100"));
        return new AssetDto(
                market,
                name,
                "CRYPTO",
                bd(ticker.get("trade_price")),
                bd(ticker.get("signed_change_price")),
                rate,
                BigDecimal.ZERO,
                bd(ticker.get("acc_trade_price_24h")),
                bd(ticker.get("high_price")),
                bd(ticker.get("low_price")),
                null,
                List.of()
        );
    }

    private String normalizeMarket(String symbol) {
        String value = symbol == null ? "KRW-BTC" : symbol.trim().toUpperCase(Locale.ROOT);
        if (!value.contains("-")) {
            return "KRW-" + value;
        }
        return value;
    }

    private long time(Map<String, Object> row) {
        Object timestamp = row.get("timestamp");
        if (timestamp instanceof Number n) return n.longValue() / 1000;
        Object utc = row.get("candle_date_time_utc");
        if (utc != null) {
            try {
                return Instant.parse(utc + "Z").getEpochSecond();
            } catch (Exception ignored) {
                return 0L;
            }
        }
        return 0L;
    }

    private String string(Object o) {
        return o == null ? "" : o.toString();
    }

    private BigDecimal bd(Object o) {
        if (o == null) return BigDecimal.ZERO;
        if (o instanceof Number n) return new BigDecimal(n.toString());
        try {
            return new BigDecimal(o.toString());
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }
}
