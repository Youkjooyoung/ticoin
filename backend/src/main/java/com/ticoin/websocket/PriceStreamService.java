package com.ticoin.websocket;

import com.ticoin.dto.AssetDto;
import com.ticoin.service.MarketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PriceStreamService {

    private final MarketService marketService;
    private final SimpMessagingTemplate messagingTemplate;

    @Scheduled(fixedDelayString = "${ticoin.websocket.broadcast-interval-ms:15000}", initialDelay = 5000)
    public void broadcastPrices() {
        try {
            List<AssetDto> feed = marketService.getFeed();
            if (feed.isEmpty()) {
                log.debug("No feed data to broadcast");
                return;
            }
            messagingTemplate.convertAndSend("/topic/prices", feed);
            log.debug("Broadcasted {} assets to /topic/prices", feed.size());
        } catch (Exception e) {
            log.warn("Price broadcast failed: {}", e.getMessage());
        }
    }
}
