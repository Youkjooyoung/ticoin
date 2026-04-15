package com.ticoin.controller;

import com.ticoin.entity.Portfolio;
import com.ticoin.service.PortfolioService;
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
    public Portfolio create(@RequestBody Portfolio p) {
        return portfolioService.create(p);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        portfolioService.delete(id);
    }
}
