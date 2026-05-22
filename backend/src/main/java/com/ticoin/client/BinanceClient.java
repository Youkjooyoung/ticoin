package com.ticoin.client;

import com.ticoin.dto.AssetDto;
import com.ticoin.dto.CandleDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Component
public class BinanceClient {

    private final WebClient webClient;

    public BinanceClient(WebClient.Builder builder,
                         @Value("${ticoin.api.binance.base-url:https://api.binance.com}") String baseUrl) {
        ExchangeStrategies strategies = ExchangeStrategies.builder()
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(32 * 1024 * 1024))
                .build();
        this.webClient = builder.baseUrl(baseUrl).exchangeStrategies(strategies).build();
    }

    @Cacheable(value = "binance-usdt-markets", unless = "#result.isEmpty()")
    public List<AssetDto> fetchUsdtMarkets() {
        try {
            Map<String, Object> exchangeInfo = webClient.get()
                    .uri("/api/v3/exchangeInfo")
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
            List<Map<String, Object>> tickers = webClient.get()
                    .uri("/api/v3/ticker/24hr")
                    .retrieve()
                    .bodyToMono(List.class)
                    .block();

            if (exchangeInfo == null || tickers == null) return List.of();
            List<Map<String, Object>> symbols = list(exchangeInfo.get("symbols"));
            Map<String, Map<String, Object>> tickerMap = tickers.stream()
                    .collect(Collectors.toMap(t -> str(t.get("symbol")), Function.identity(), (a, b) -> a));

            return symbols.stream()
                    .filter(this::isActiveUsdtSpot)
                    .map(symbol -> mapToAsset(symbol, tickerMap.get(str(symbol.get("symbol")))))
                    .filter(asset -> asset.price().compareTo(BigDecimal.ZERO) > 0)
                    .sorted(Comparator.comparing(AssetDto::volume24h, Comparator.nullsLast(Comparator.reverseOrder())))
                    .toList();
        } catch (Exception e) {
            log.warn("Binance USDT markets fetch failed: {}", e.getMessage());
            return List.of();
        }
    }

    public List<AssetDto> searchUsdtMarkets(String query) {
        String normalized = query == null ? "" : query.trim().toUpperCase(Locale.ROOT);
        if (normalized.isBlank()) return fetchUsdtMarkets();
        return fetchUsdtMarkets().stream()
                .filter(asset -> asset.symbol().contains(normalized)
                        || asset.name().toUpperCase(Locale.ROOT).contains(normalized))
                .toList();
    }

    private boolean isActiveUsdtSpot(Map<String, Object> symbol) {
        return "TRADING".equals(str(symbol.get("status")))
                && "USDT".equals(str(symbol.get("quoteAsset")))
                && Boolean.TRUE.equals(symbol.get("isSpotTradingAllowed"));
    }

    private AssetDto mapToAsset(Map<String, Object> symbol, Map<String, Object> ticker) {
        String baseAsset = str(symbol.get("baseAsset"));
        String name = COMMON_NAMES.getOrDefault(baseAsset, baseAsset);
        BigDecimal price = bd(ticker == null ? null : ticker.get("lastPrice"));
        BigDecimal change24h = bd(ticker == null ? null : ticker.get("priceChange"));
        BigDecimal changePercent24h = bd(ticker == null ? null : ticker.get("priceChangePercent"));
        BigDecimal volume24h = bd(ticker == null ? null : ticker.get("quoteVolume"));
        BigDecimal high24h = bd(ticker == null ? null : ticker.get("highPrice"));
        BigDecimal low24h = bd(ticker == null ? null : ticker.get("lowPrice"));
        return new AssetDto(
                baseAsset,
                name,
                "CRYPTO",
                price,
                change24h,
                changePercent24h,
                BigDecimal.ZERO,
                volume24h,
                high24h,
                low24h,
                null,
                List.<CandleDto>of()
        );
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> list(Object value) {
        return value instanceof List<?> raw ? (List<Map<String, Object>>) raw : List.of();
    }

    private String str(Object value) {
        return value == null ? "" : value.toString().toUpperCase(Locale.ROOT);
    }

    private BigDecimal bd(Object value) {
        if (value == null) return BigDecimal.ZERO;
        if (value instanceof Number n) return new BigDecimal(n.toString());
        try {
            return new BigDecimal(value.toString());
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }

    private static final Map<String, String> COMMON_NAMES = Map.ofEntries(
            Map.entry("BTC", "Bitcoin"),
            Map.entry("ETH", "Ethereum"),
            Map.entry("BNB", "BNB"),
            Map.entry("XRP", "XRP"),
            Map.entry("SOL", "Solana"),
            Map.entry("DOGE", "Dogecoin"),
            Map.entry("ADA", "Cardano"),
            Map.entry("TRX", "TRON"),
            Map.entry("AVAX", "Avalanche"),
            Map.entry("LINK", "Chainlink"),
            Map.entry("DOT", "Polkadot"),
            Map.entry("LTC", "Litecoin"),
            Map.entry("BCH", "Bitcoin Cash"),
            Map.entry("UNI", "Uniswap"),
            Map.entry("ATOM", "Cosmos"),
            Map.entry("NEAR", "NEAR Protocol"),
            Map.entry("APT", "Aptos"),
            Map.entry("SUI", "Sui"),
            Map.entry("OP", "Optimism"),
            Map.entry("ARB", "Arbitrum"),
            Map.entry("PEPE", "Pepe"),
            Map.entry("SHIB", "Shiba Inu")
    );
}
