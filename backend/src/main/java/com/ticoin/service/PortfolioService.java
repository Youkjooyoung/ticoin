package com.ticoin.service;

import com.ticoin.entity.Portfolio;
import com.ticoin.repository.PortfolioRepository;
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

    public Portfolio create(Portfolio p) {
        return portfolioRepository.save(p);
    }

    public void delete(Long id) {
        portfolioRepository.deleteById(id);
    }
}
