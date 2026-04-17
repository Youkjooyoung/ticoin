package com.ticoin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PostCreateRequest(
        @NotBlank @Size(max = 1000) String content,
        @Size(max = 20) String symbol,
        @Size(max = 262144) String imageUrl
) {}
