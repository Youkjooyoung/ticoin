package com.ticoin.dto;

import java.math.BigDecimal;

public record CandleDto(
        long time,
        BigDecimal open,
        BigDecimal high,
        BigDecimal low,
        BigDecimal close,
        BigDecimal volume
) {}
