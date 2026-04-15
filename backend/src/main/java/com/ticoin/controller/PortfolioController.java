package com.ticoin.controller;

import com.ticoin.config.DeviceIdArgumentResolver.DeviceId;
import com.ticoin.dto.PortfolioCreateRequest;
import com.ticoin.entity.Portfolio;
import com.ticoin.service.PortfolioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/portfolio")
@RequiredArgsConstructor
public class PortfolioController {

    private final PortfolioService portfolioService;

    @GetMapping
    public List<Portfolio> list(@DeviceId String deviceId) {
        return portfolioService.findAll(deviceId);
    }

    @PostMapping
    public Portfolio create(@DeviceId String deviceId, @Valid @RequestBody PortfolioCreateRequest req) {
        return portfolioService.create(deviceId, req);
    }

    @DeleteMapping("/{id}")
    public void delete(@DeviceId String deviceId, @PathVariable Long id) {
        portfolioService.delete(deviceId, id);
    }
}
