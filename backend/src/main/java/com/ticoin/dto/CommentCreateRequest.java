package com.ticoin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CommentCreateRequest(
        @NotBlank @Size(max = 20) String symbol,
        @NotBlank @Size(max = 50) String author,
        @NotBlank @Size(max = 500) String content
) {}
