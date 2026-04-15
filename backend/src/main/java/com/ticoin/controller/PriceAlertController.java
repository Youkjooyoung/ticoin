package com.ticoin.controller;

import com.ticoin.config.DeviceIdArgumentResolver.DeviceId;
import com.ticoin.dto.AlertCreateRequest;
import com.ticoin.entity.PriceAlert;
import com.ticoin.service.PriceAlertService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class PriceAlertController {

    private final PriceAlertService priceAlertService;

    @GetMapping
    public List<PriceAlert> list(@DeviceId String deviceId) {
        return priceAlertService.findAll(deviceId);
    }

    @PostMapping
    public PriceAlert create(@DeviceId String deviceId, @Valid @RequestBody AlertCreateRequest req) {
        return priceAlertService.create(deviceId, req);
    }

    @DeleteMapping("/{id}")
    public void delete(@DeviceId String deviceId, @PathVariable Long id) {
        priceAlertService.delete(deviceId, id);
    }
}
