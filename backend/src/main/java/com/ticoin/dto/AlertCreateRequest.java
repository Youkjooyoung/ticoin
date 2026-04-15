package com.ticoin.dto;

import com.ticoin.entity.PriceAlert.Condition;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record AlertCreateRequest(
        @NotBlank @Size(max = 20) String symbol,
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Size(max = 10) String type,
        @NotNull Condition condition,
        @NotNull @DecimalMin(value = "0.00000001", message = "목표가는 0보다 커야 합니다") BigDecimal target
) {}
