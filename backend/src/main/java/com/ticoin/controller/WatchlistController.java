package com.ticoin.controller;

import com.ticoin.dto.WatchlistCreateRequest;
import com.ticoin.entity.Watchlist;
import com.ticoin.service.WatchlistService;
import jakarta.validation.Valid;
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
    public Watchlist create(@Valid @RequestBody WatchlistCreateRequest req) {
        return watchlistService.create(req);
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
