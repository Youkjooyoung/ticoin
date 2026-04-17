package com.ticoin.dto;

import com.ticoin.entity.Post;

import java.time.Instant;

public record PostDto(
        Long id,
        Long userId,
        String authorName,
        String symbol,
        String content,
        String imageUrl,
        int likeCount,
        int commentCount,
        boolean likedByMe,
        Instant createdAt
) {
    public static PostDto of(Post p, boolean likedByMe) {
        return new PostDto(
                p.getId(),
                p.getUserId(),
                p.getAuthorName(),
                p.getSymbol(),
                p.getContent(),
                p.getImageUrl(),
                p.getLikeCount() != null ? p.getLikeCount() : 0,
                p.getCommentCount() != null ? p.getCommentCount() : 0,
                likedByMe,
                p.getCreatedAt()
        );
    }
}
