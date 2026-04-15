package com.ticoin.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record WatchlistCreateRequest(
        @NotBlank(message = "심볼은 필수입니다")
        @Size(max = 20)
        String symbol,

        @NotBlank(message = "종목명은 필수입니다")
        @Size(max = 100)
        String name,

        @NotBlank(message = "타입은 필수입니다 (CRYPTO 또는 STOCK)")
        @Size(max = 10)
        String type,

        @DecimalMin(value = "0.00000001", message = "목표가는 0보다 커야 합니다")
        BigDecimal targetPrice,

        Boolean alertEnabled
) {}
