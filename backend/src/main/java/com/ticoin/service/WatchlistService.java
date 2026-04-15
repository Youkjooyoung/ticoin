package com.ticoin.service;

import com.ticoin.entity.Watchlist;
import com.ticoin.repository.WatchlistRepository;
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

    public Watchlist create(Watchlist w) {
        return watchlistRepository.save(w);
    }

    public Watchlist toggleAlert(Long id) {
        Watchlist w = watchlistRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Not found: " + id));
        w.setAlertEnabled(!w.isAlertEnabled());
        return w;
    }

    public void delete(Long id) {
        watchlistRepository.deleteById(id);
    }
}
