package com.ticoin.dto;

import java.time.Instant;

public record NewsDto(
        String id,
        String title,
        String description,
        String url,
        String source,
        String imageUrl,
        Instant publishedAt,
        String category
) {}
