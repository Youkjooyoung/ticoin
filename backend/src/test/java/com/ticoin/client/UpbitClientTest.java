package com.ticoin.client;

import com.sun.net.httpserver.HttpServer;
import com.ticoin.dto.AssetDto;
import com.ticoin.dto.CandleDto;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class UpbitClientTest {

    private HttpServer server;
    private UpbitClient client;

    @BeforeEach
    void setUp() throws IOException {
        server = HttpServer.create(new InetSocketAddress(0), 0);
        server.createContext("/v1/market/all", exchange -> respond(exchange, """
                [
                  {"market":"KRW-BTC","korean_name":"비트코인","english_name":"Bitcoin"},
                  {"market":"BTC-ETH","korean_name":"이더리움","english_name":"Ethereum"}
                ]
                """));
        server.createContext("/v1/ticker", exchange -> respond(exchange, """
                [
                  {
                    "market":"KRW-BTC",
                    "trade_price":92000000,
                    "signed_change_price":1200000,
                    "signed_change_rate":0.0132,
                    "acc_trade_price_24h":210000000000,
                    "high_price":93000000,
                    "low_price":90000000
                  }
                ]
                """));
        server.createContext("/v1/candles/days", exchange -> respond(exchange, """
                [
                  {
                    "timestamp":1713168000000,
                    "opening_price":91000000,
                    "high_price":93000000,
                    "low_price":90000000,
                    "trade_price":92000000,
                    "candle_acc_trade_volume":2400.5
                  }
                ]
                """));
        server.start();
        client = new UpbitClient(WebClient.builder(), "http://localhost:" + server.getAddress().getPort());
    }

    @AfterEach
    void tearDown() {
        server.stop(0);
    }

    @Test
    void fetchTickers_maps_upbit_response_to_asset() {
        List<AssetDto> assets = client.fetchTickers(List.of("KRW-BTC"));

        assertThat(assets).hasSize(1);
        AssetDto asset = assets.get(0);
        assertThat(asset.symbol()).isEqualTo("KRW-BTC");
        assertThat(asset.name()).isEqualTo("비트코인");
        assertThat(asset.price()).isEqualByComparingTo("92000000");
        assertThat(asset.changePercent24h()).isEqualByComparingTo("1.3200");
    }

    @Test
    void fetchCandles_maps_oldest_first_candles() {
        List<CandleDto> candles = client.fetchCandles("KRW-BTC", "1D");

        assertThat(candles).hasSize(1);
        assertThat(candles.get(0).close()).isEqualByComparingTo("92000000");
        assertThat(candles.get(0).volume()).isEqualByComparingTo("2400.5");
    }

    private void respond(com.sun.net.httpserver.HttpExchange exchange, String body) throws IOException {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "application/json; charset=utf-8");
        exchange.sendResponseHeaders(200, bytes.length);
        exchange.getResponseBody().write(bytes);
        exchange.close();
    }
}
