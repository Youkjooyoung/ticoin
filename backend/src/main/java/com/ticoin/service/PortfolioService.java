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
    public List<Portfolio> findAll() {
        return portfolioRepository.findAll();
    }

    public Portfolio create(PortfolioCreateRequest req) {
        Portfolio p = Portfolio.builder()
                .symbol(req.symbol().toUpperCase())
                .name(req.name())
                .type(req.type().toUpperCase())
                .quantity(req.quantity())
                .avgPrice(req.avgPrice())
                .build();
        return portfolioRepository.save(p);
    }

    public void delete(Long id) {
        if (!portfolioRepository.existsById(id)) {
            throw new EntityNotFoundException("포트폴리오 항목을 찾을 수 없습니다: " + id);
        }
        portfolioRepository.deleteById(id);
    }
}
