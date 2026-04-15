package com.ticoin.client;

import com.ticoin.dto.AssetDto;
import com.ticoin.dto.CandleDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class YahooFinanceClient {

    private final WebClient webClient;

    public YahooFinanceClient(WebClient.Builder builder,
                              @Value("${ticoin.api.yahoo.base-url}") String baseUrl) {
        this.webClient = builder.baseUrl(baseUrl).build();
    }

    @Cacheable(value = "yahoo-quote", key = "#symbols.toString()")
    public List<AssetDto> fetchQuotes(List<String> symbols) {
        try {
            String symbolParam = String.join(",", symbols);
            Map<String, Object> resp = webClient.get()
                    .uri(uriBuilder -> uriBuilder.path("/v7/finance/quote")
                            .queryParam("symbols", symbolParam)
                            .build())
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (resp == null) return List.of();
            Map<String, Object> quoteResponse = (Map<String, Object>) resp.get("quoteResponse");
            if (quoteResponse == null) return List.of();
            List<Map<String, Object>> result = (List<Map<String, Object>>) quoteResponse.get("result");
            if (result == null) return List.of();

            return result.stream().map(this::mapToAsset).toList();
        } catch (Exception e) {
            log.warn("Yahoo quote fetch failed: {}", e.getMessage());
            return List.of();
        }
    }

    @Cacheable(value = "yahoo-chart", key = "#symbol + ':' + #range + ':' + #interval")
    public List<CandleDto> fetchChart(String symbol, String range, String interval) {
        try {
            Map<String, Object> resp = webClient.get()
                    .uri(uriBuilder -> uriBuilder.path("/v8/finance/chart/{symbol}")
                            .queryParam("range", range)
                            .queryParam("interval", interval)
                            .build(symbol))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (resp == null) return List.of();
            Map<String, Object> chart = (Map<String, Object>) resp.get("chart");
            List<Map<String, Object>> result = (List<Map<String, Object>>) chart.get("result");
            if (result == null || result.isEmpty()) return List.of();

            Map<String, Object> first = result.get(0);
            List<Number> timestamps = (List<Number>) first.get("timestamp");
            Map<String, Object> indicators = (Map<String, Object>) first.get("indicators");
            List<Map<String, Object>> quote = (List<Map<String, Object>>) indicators.get("quote");
            if (quote == null || quote.isEmpty()) return List.of();
            Map<String, Object> q = quote.get(0);
            List<Number> opens = (List<Number>) q.get("open");
            List<Number> highs = (List<Number>) q.get("high");
            List<Number> lows = (List<Number>) q.get("low");
            List<Number> closes = (List<Number>) q.get("close");
            List<Number> volumes = (List<Number>) q.get("volume");

            List<CandleDto> out = new ArrayList<>();
            for (int i = 0; i < timestamps.size(); i++) {
                if (opens.get(i) == null || closes.get(i) == null) continue;
                out.add(new CandleDto(
                        timestamps.get(i).longValue(),
                        bd(opens.get(i)),
                        bd(highs.get(i)),
                        bd(lows.get(i)),
                        bd(closes.get(i)),
                        bd(volumes.get(i))
                ));
            }
            return out;
        } catch (Exception e) {
            log.warn("Yahoo chart failed for {}: {}", symbol, e.getMessage());
            return List.of();
        }
    }

    private AssetDto mapToAsset(Map<String, Object> m) {
        return new AssetDto(
                (String) m.get("symbol"),
                (String) m.getOrDefault("shortName", m.get("symbol")),
                "STOCK",
                bd(m.get("regularMarketPrice")),
                bd(m.get("regularMarketChange")),
                bd(m.get("regularMarketChangePercent")),
                bd(m.get("marketCap")),
                bd(m.get("regularMarketVolume")),
                bd(m.get("regularMarketDayHigh")),
                bd(m.get("regularMarketDayLow")),
                null,
                List.of()
        );
    }

    private BigDecimal bd(Object o) {
        if (o == null) return BigDecimal.ZERO;
        if (o instanceof Number n) return new BigDecimal(n.toString());
        try { return new BigDecimal(o.toString()); } catch (Exception e) { return BigDecimal.ZERO; }
    }
}
