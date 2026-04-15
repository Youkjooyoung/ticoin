package com.ticoin.repository;

import com.ticoin.entity.Watchlist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WatchlistRepository extends JpaRepository<Watchlist, Long> {
    List<Watchlist> findByDeviceIdOrderByCreatedAtDesc(String deviceId);
    Optional<Watchlist> findByIdAndDeviceId(Long id, String deviceId);
    boolean existsByDeviceIdAndSymbol(String deviceId, String symbol);
    long deleteByIdAndDeviceId(Long id, String deviceId);
}
