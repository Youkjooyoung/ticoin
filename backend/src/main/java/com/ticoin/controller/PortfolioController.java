package com.ticoin.controller;

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
    public List<Portfolio> list() {
        return portfolioService.findAll();
    }

    @PostMapping
    public Portfolio create(@Valid @RequestBody PortfolioCreateRequest req) {
        return portfolioService.create(req);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        portfolioService.delete(id);
    }
}
