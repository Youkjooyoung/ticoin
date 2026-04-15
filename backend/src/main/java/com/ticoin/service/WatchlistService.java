package com.ticoin.service;

import com.ticoin.dto.WatchlistCreateRequest;
import com.ticoin.entity.Watchlist;
import com.ticoin.repository.WatchlistRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class WatchlistService {

    private final WatchlistRepository watchlistRepository;

    @Transactional(readOnly = true)
    public List<Watchlist> findAll(String deviceId) {
        return watchlistRepository.findByDeviceIdOrderByCreatedAtDesc(deviceId);
    }

    public Watchlist create(String deviceId, WatchlistCreateRequest req) {
        String symbol = req.symbol().toUpperCase();
        if (watchlistRepository.existsByDeviceIdAndSymbol(deviceId, symbol)) {
            throw new IllegalArgumentException("이미 관심목록에 있는 심볼입니다: " + symbol);
        }
        Watchlist w = Watchlist.builder()
                .deviceId(deviceId)
                .symbol(symbol)
                .name(req.name())
                .type(req.type().toUpperCase())
                .targetPrice(req.targetPrice())
                .alertEnabled(Boolean.TRUE.equals(req.alertEnabled()))
                .build();
        return watchlistRepository.save(w);
    }

    public Watchlist toggleAlert(String deviceId, Long id) {
        Watchlist w = watchlistRepository.findByIdAndDeviceId(id, deviceId)
                .orElseThrow(() -> new EntityNotFoundException("관심목록 항목을 찾을 수 없습니다: " + id));
        w.setAlertEnabled(!w.isAlertEnabled());
        return w;
    }

    public void delete(String deviceId, Long id) {
        long removed = watchlistRepository.deleteByIdAndDeviceId(id, deviceId);
        if (removed == 0) {
            throw new EntityNotFoundException("관심목록 항목을 찾을 수 없습니다: " + id);
        }
    }
}
