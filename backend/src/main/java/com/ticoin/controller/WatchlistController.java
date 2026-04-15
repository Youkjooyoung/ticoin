package com.ticoin.controller;

import com.ticoin.config.DeviceIdArgumentResolver.DeviceId;
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
    public List<Watchlist> list(@DeviceId String deviceId) {
        return watchlistService.findAll(deviceId);
    }

    @PostMapping
    public Watchlist create(@DeviceId String deviceId, @Valid @RequestBody WatchlistCreateRequest req) {
        return watchlistService.create(deviceId, req);
    }

    @PatchMapping("/{id}/alert")
    public Watchlist toggleAlert(@DeviceId String deviceId, @PathVariable Long id) {
        return watchlistService.toggleAlert(deviceId, id);
    }

    @DeleteMapping("/{id}")
    public void delete(@DeviceId String deviceId, @PathVariable Long id) {
        watchlistService.delete(deviceId, id);
    }
}
