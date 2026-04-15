package com.ticoin.service;

import com.ticoin.dto.PortfolioCreateRequest;
import com.ticoin.entity.Portfolio;
import com.ticoin.repository.PortfolioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PortfolioService {

    private final PortfolioRepository portfolioRepository;

    @Transactional(readOnly = true)
    public List<Portfolio> findAll(String deviceId) {
        return portfolioRepository.findByDeviceIdOrderByCreatedAtDesc(deviceId);
    }

    public Portfolio create(String deviceId, PortfolioCreateRequest req) {
        Portfolio p = Portfolio.builder()
                .deviceId(deviceId)
                .symbol(req.symbol().toUpperCase())
                .name(req.name())
                .type(req.type().toUpperCase())
                .quantity(req.quantity())
                .avgPrice(req.avgPrice())
                .build();
        return portfolioRepository.save(p);
    }

    public void delete(String deviceId, Long id) {
        long removed = portfolioRepository.deleteByIdAndDeviceId(id, deviceId);
        if (removed == 0) {
            throw new EntityNotFoundException("포트폴리오 항목을 찾을 수 없습니다: " + id);
        }
    }
}
