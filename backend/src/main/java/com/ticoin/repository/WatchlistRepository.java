package com.ticoin.repository;

import com.ticoin.entity.Watchlist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WatchlistRepository extends JpaRepository<Watchlist, Long> {
    Optional<Watchlist> findBySymbol(String symbol);
    boolean existsBySymbol(String symbol);
}
