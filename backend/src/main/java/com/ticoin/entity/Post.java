package com.ticoin.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "post")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "device_id", nullable = false, length = 64)
    private String deviceId;

    @Column(name = "author_name", nullable = false, length = 50)
    private String authorName;

    @Column(length = 20)
    private String symbol;

    @Column(nullable = false, length = 1000)
    private String content;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "like_count", nullable = false)
    @Builder.Default
    private Integer likeCount = 0;

    @Column(name = "comment_count", nullable = false)
    @Builder.Default
    private Integer commentCount = 0;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
        if (likeCount == null) likeCount = 0;
        if (commentCount == null) commentCount = 0;
    }
}
