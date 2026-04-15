package com.ticoin.controller;

import com.ticoin.dto.AssetDto;
import com.ticoin.dto.CandleDto;
import com.ticoin.service.MarketService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/market")
@RequiredArgsConstructor
public class MarketController {

    private final MarketService marketService;

    @GetMapping("/feed")
    public List<AssetDto> feed() {
        return marketService.getFeed();
    }

    @GetMapping("/coins")
    public List<AssetDto> coins() {
        return marketService.getCoins();
    }

    @GetMapping("/stocks")
    public List<AssetDto> stocks() {
        return marketService.getStocks();
    }

    @GetMapping("/trending")
    public List<AssetDto> trending() {
        return marketService.getTrending();
    }

    @GetMapping("/candles")
    public List<CandleDto> candles(
            @RequestParam String symbol,
            @RequestParam(defaultValue = "CRYPTO") String type,
            @RequestParam(defaultValue = "1D") String interval) {
        return marketService.getCandles(symbol, type, interval);
    }

    @GetMapping("/search")
    public List<AssetDto> search(@RequestParam String q) {
        return marketService.searchCoins(q);
    }
}
