package com.ticoin.service;

import com.ticoin.client.CoinGeckoClient;
import com.ticoin.client.UpbitClient;
import com.ticoin.client.YahooFinanceClient;
import com.ticoin.dto.AssetDto;
import com.ticoin.dto.CandleDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class MarketService {

    private final UpbitClient upbit;
    private final CoinGeckoClient coinGecko;
    private final YahooFinanceClient yahoo;

    private static final List<String> DEFAULT_KRW_MARKETS = List.of(
            "KRW-BTC", "KRW-ETH", "KRW-XRP", "KRW-SOL", "KRW-ADA", "KRW-DOGE"
    );
    private static final List<String> DEFAULT_STOCKS = List.of(
            "AAPL", "TSLA", "NVDA", "MSFT", "GOOGL", "AMZN"
    );

    public List<AssetDto> getFeed() {
        List<AssetDto> coins = upbit.fetchTickers(DEFAULT_KRW_MARKETS);
        List<AssetDto> stocks = yahoo.fetchQuotes(DEFAULT_STOCKS);
        return Stream.concat(coins.stream(), stocks.stream()).toList();
    }

    public List<AssetDto> getCoins() {
        return upbit.fetchTickers(DEFAULT_KRW_MARKETS);
    }

    public List<AssetDto> getStocks() {
        return yahoo.fetchQuotes(DEFAULT_STOCKS);
    }

    public List<AssetDto> getTrending() {
        List<AssetDto> upbitTrending = upbit.fetchTopKrwTickers();
        if (!upbitTrending.isEmpty()) {
            return upbitTrending;
        }
        return coinGecko.fetchTrending();
    }

    public List<CandleDto> getCandles(String symbol, String type, String interval) {
        if ("STOCK".equalsIgnoreCase(type)) {
            String range = mapStockRange(interval);
            String yahooInterval = mapStockInterval(interval);
            return yahoo.fetchChart(symbol, range, yahooInterval);
        }
        return upbit.fetchCandles(symbol, interval);
    }

    public List<AssetDto> searchCoins(String query) {
        return upbit.searchKrwMarkets(query);
    }

    private String mapStockRange(String interval) {
        return switch (interval == null ? "1D" : interval.toUpperCase()) {
            case "15M" -> "1d";
            case "1H" -> "5d";
            case "4H" -> "1mo";
            case "1W" -> "1y";
            default -> "1mo";
        };
    }

    private String mapStockInterval(String interval) {
        return switch (interval == null ? "1D" : interval.toUpperCase()) {
            case "15M" -> "15m";
            case "1H" -> "60m";
            case "4H" -> "60m";
            case "1W" -> "1wk";
            default -> "1d";
        };
    }
}
