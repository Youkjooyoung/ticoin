package com.ticoin.controller;

import com.ticoin.entity.Watchlist;
import com.ticoin.service.WatchlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/watchlist")
@RequiredArgsConstructor
public class WatchlistController {

    private final WatchlistService watchlistService;

    @GetMapping
    public List<Watchlist> list() {
        return watchlistService.findAll();
    }

    @PostMapping
    public Watchlist create(@RequestBody Watchlist w) {
        return watchlistService.create(w);
    }

    @PatchMapping("/{id}/alert")
    public Watchlist toggleAlert(@PathVariable Long id) {
        return watchlistService.toggleAlert(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        watchlistService.delete(id);
    }
}
