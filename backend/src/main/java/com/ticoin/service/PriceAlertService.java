package com.ticoin.service;

import com.ticoin.dto.AlertCreateRequest;
import com.ticoin.dto.AssetDto;
import com.ticoin.entity.PriceAlert;
import com.ticoin.repository.PriceAlertRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PriceAlertService {

    private final PriceAlertRepository alertRepository;
    private final MarketService marketService;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional(readOnly = true)
    public List<PriceAlert> findAll(String deviceId) {
        return alertRepository.findByDeviceIdOrderByCreatedAtDesc(deviceId);
    }

    public PriceAlert create(String deviceId, AlertCreateRequest req) {
        PriceAlert alert = PriceAlert.builder()
                .deviceId(deviceId)
                .symbol(req.symbol().toUpperCase())
                .name(req.name())
                .type(req.type().toUpperCase())
                .condition(req.condition())
                .target(req.target())
                .triggered(false)
                .build();
        return alertRepository.save(alert);
    }

    public void delete(String deviceId, Long id) {
        long removed = alertRepository.deleteByIdAndDeviceId(id, deviceId);
        if (removed == 0) {
            throw new EntityNotFoundException("알림을 찾을 수 없습니다: " + id);
        }
    }

    @Scheduled(fixedDelayString = "${ticoin.alert.check-interval-ms:20000}", initialDelay = 10000)
    public void checkAlerts() {
        List<PriceAlert> active = alertRepository.findByTriggeredFalse();
        if (active.isEmpty()) return;

        Map<String, BigDecimal> priceMap = buildPriceMap();
        if (priceMap.isEmpty()) return;

        for (PriceAlert alert : active) {
            BigDecimal current = priceMap.get(alert.getSymbol());
            if (current == null) continue;

            boolean hit = switch (alert.getCondition()) {
                case ABOVE -> current.compareTo(alert.getTarget()) >= 0;
                case BELOW -> current.compareTo(alert.getTarget()) <= 0;
            };

            if (hit) {
                alert.setTriggered(true);
                alert.setTriggeredAt(Instant.now());
                messagingTemplate.convertAndSend("/topic/alerts/" + alert.getDeviceId(), Map.of(
                        "id", alert.getId(),
                        "symbol", alert.getSymbol(),
                        "name", alert.getName(),
                        "condition", alert.getCondition().name(),
                        "target", alert.getTarget(),
                        "current", current,
                        "triggeredAt", alert.getTriggeredAt().toString()
                ));
                log.info("Alert triggered id={} symbol={} target={} current={}",
                        alert.getId(), alert.getSymbol(), alert.getTarget(), current);
            }
        }
    }

    private Map<String, BigDecimal> buildPriceMap() {
        Map<String, BigDecimal> map = new HashMap<>();
        try {
            for (AssetDto a : marketService.getFeed()) {
                map.put(a.symbol(), a.price());
            }
        } catch (Exception e) {
            log.warn("buildPriceMap failed: {}", e.getMessage());
        }
        return map;
    }
}
