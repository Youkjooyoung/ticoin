package com.ticoin.controller;

import com.ticoin.service.AiAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiAnalysisService aiService;

    @GetMapping("/status")
    public Map<String, Object> status() {
        return aiService.status();
    }

    @GetMapping("/analyze")
    public Map<String, Object> analyze(
            @RequestParam String symbol,
            @RequestParam(defaultValue = "0") double price,
            @RequestParam(defaultValue = "0") double changePct
    ) {
        return aiService.analyze(symbol, price, changePct);
    }
}
