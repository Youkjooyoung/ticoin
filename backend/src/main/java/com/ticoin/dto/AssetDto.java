package com.ticoin.dto;

import java.math.BigDecimal;
import java.util.List;

public record AssetDto(
        String symbol,
        String name,
        String type,
        BigDecimal price,
        BigDecimal change24h,
        BigDecimal changePercent24h,
        BigDecimal marketCap,
        BigDecimal volume24h,
        BigDecimal high24h,
        BigDecimal low24h,
        String iconUrl,
        List<CandleDto> sparkline
) {}
