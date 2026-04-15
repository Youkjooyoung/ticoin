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
    public List<Watchlist> findAll() {
        return watchlistRepository.findAll();
    }

    public Watchlist create(WatchlistCreateRequest req) {
        Watchlist w = Watchlist.builder()
                .symbol(req.symbol().toUpperCase())
                .name(req.name())
                .type(req.type().toUpperCase())
                .targetPrice(req.targetPrice())
                .alertEnabled(Boolean.TRUE.equals(req.alertEnabled()))
                .build();
        return watchlistRepository.save(w);
    }

    public Watchlist toggleAlert(Long id) {
        Watchlist w = watchlistRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("관심목록 항목을 찾을 수 없습니다: " + id));
        w.setAlertEnabled(!w.isAlertEnabled());
        return w;
    }

    public void delete(Long id) {
        if (!watchlistRepository.existsById(id)) {
            throw new EntityNotFoundException("관심목록 항목을 찾을 수 없습니다: " + id);
        }
        watchlistRepository.deleteById(id);
    }
}
