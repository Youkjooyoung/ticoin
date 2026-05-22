package com.ticoin.service;

import com.ticoin.client.CoinGeckoClient;
import com.ticoin.client.BinanceClient;
import com.ticoin.client.YahooFinanceClient;
import com.ticoin.dto.AssetDto;
import com.ticoin.dto.CandleDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class MarketService {

    private final CoinGeckoClient coinGecko;
    private final BinanceClient binance;
    private final YahooFinanceClient yahoo;

    private static final List<String> DEFAULT_COINS = List.of(
            "bitcoin", "ethereum", "ripple", "solana", "cardano", "dogecoin"
    );
    private static final List<String> DEFAULT_STOCKS = List.of(
            "AAPL", "TSLA", "NVDA", "MSFT", "GOOGL", "AMZN"
    );
    private static final Map<String, String> COIN_IDS = Map.ofEntries(
            Map.entry("BTC", "bitcoin"),
            Map.entry("BITCOIN", "bitcoin"),
            Map.entry("ETH", "ethereum"),
            Map.entry("ETHEREUM", "ethereum"),
            Map.entry("XRP", "ripple"),
            Map.entry("RIPPLE", "ripple"),
            Map.entry("SOL", "solana"),
            Map.entry("SOLANA", "solana"),
            Map.entry("ADA", "cardano"),
            Map.entry("CARDANO", "cardano"),
            Map.entry("DOGE", "dogecoin"),
            Map.entry("DOGECOIN", "dogecoin")
    );

    public List<AssetDto> getFeed() {
        List<AssetDto> coins = binance.fetchUsdtMarkets().stream().limit(80).toList();
        if (coins.isEmpty()) coins = coinGecko.fetchMarkets(DEFAULT_COINS);
        List<AssetDto> stocks = yahoo.fetchQuotes(DEFAULT_STOCKS);
        return Stream.concat(coins.stream(), stocks.stream()).toList();
    }

    public List<AssetDto> getCoins() {
        List<AssetDto> coins = binance.fetchUsdtMarkets();
        return coins.isEmpty() ? coinGecko.fetchMarkets(DEFAULT_COINS) : coins;
    }

    public List<AssetDto> getStocks() {
        return yahoo.fetchQuotes(DEFAULT_STOCKS);
    }

    public List<AssetDto> getTrending() {
        return coinGecko.fetchTrending();
    }

    public List<CandleDto> getCandles(String symbol, String type, String interval) {
        if ("STOCK".equalsIgnoreCase(type)) {
            String range = mapStockRange(interval);
            String yahooInterval = mapStockInterval(interval);
            return yahoo.fetchChart(symbol, range, yahooInterval);
        }
        int days = mapCoinDays(interval);
        return coinGecko.fetchOhlc(toCoinId(symbol), days);
    }

    public List<AssetDto> searchCoins(String query) {
        List<AssetDto> results = binance.searchUsdtMarkets(query);
        if (!results.isEmpty()) return results;
        String id = toCoinId(query);
        return coinGecko.fetchMarkets(List.of(id));
    }

    private String toCoinId(String symbol) {
        String normalized = symbol == null ? "bitcoin" : symbol.trim().toUpperCase(Locale.ROOT);
        if (normalized.contains("-")) {
            normalized = normalized.substring(normalized.indexOf('-') + 1);
        }
        if (normalized.contains("/")) {
            normalized = normalized.substring(0, normalized.indexOf('/'));
        }
        return COIN_IDS.getOrDefault(normalized, normalized.toLowerCase(Locale.ROOT));
    }

    private int mapCoinDays(String interval) {
        return switch (interval == null ? "1D" : interval.toUpperCase(Locale.ROOT)) {
            case "15M", "1H" -> 1;
            case "4H" -> 7;
            case "1W" -> 30;
            default -> 7;
        };
    }

    private String mapStockRange(String interval) {
        return switch (interval == null ? "1D" : interval.toUpperCase(Locale.ROOT)) {
            case "15M" -> "1d";
            case "1H" -> "5d";
            case "4H" -> "1mo";
            case "1W" -> "1y";
            default -> "1mo";
        };
    }

    private String mapStockInterval(String interval) {
        return switch (interval == null ? "1D" : interval.toUpperCase(Locale.ROOT)) {
            case "15M" -> "15m";
            case "1H" -> "60m";
            case "4H" -> "60m";
            case "1W" -> "1wk";
            default -> "1d";
        };
    }
}
