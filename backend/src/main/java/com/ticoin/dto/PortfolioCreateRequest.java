package com.ticoin.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record PortfolioCreateRequest(
        @NotBlank(message = "심볼은 필수입니다")
        @Size(max = 20, message = "심볼은 20자 이하여야 합니다")
        String symbol,

        @NotBlank(message = "종목명은 필수입니다")
        @Size(max = 100)
        String name,

        @NotBlank(message = "타입은 필수입니다 (CRYPTO 또는 STOCK)")
        @Size(max = 10)
        String type,

        @NotNull(message = "수량은 필수입니다")
        @DecimalMin(value = "0.00000001", message = "수량은 0보다 커야 합니다")
        BigDecimal quantity,

        @NotNull(message = "평균 매수가는 필수입니다")
        @DecimalMin(value = "0.00000001", message = "평균 매수가는 0보다 커야 합니다")
        BigDecimal avgPrice
) {}
