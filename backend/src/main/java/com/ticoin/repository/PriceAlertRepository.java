package com.ticoin.repository;

import com.ticoin.entity.PriceAlert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PriceAlertRepository extends JpaRepository<PriceAlert, Long> {
    List<PriceAlert> findByDeviceIdOrderByCreatedAtDesc(String deviceId);
    List<PriceAlert> findByTriggeredFalse();
    long deleteByIdAndDeviceId(Long id, String deviceId);
}
