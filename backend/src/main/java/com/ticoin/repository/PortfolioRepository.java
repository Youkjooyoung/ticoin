package com.ticoin.repository;

import com.ticoin.entity.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {
    List<Portfolio> findByDeviceIdOrderByCreatedAtDesc(String deviceId);
    boolean existsByIdAndDeviceId(Long id, String deviceId);
    long deleteByIdAndDeviceId(Long id, String deviceId);
}
