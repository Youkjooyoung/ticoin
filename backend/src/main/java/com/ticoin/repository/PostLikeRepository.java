package com.ticoin.repository;

import com.ticoin.entity.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    Optional<PostLike> findByPostIdAndDeviceId(Long postId, String deviceId);
    boolean existsByPostIdAndDeviceId(Long postId, String deviceId);
    List<PostLike> findByDeviceIdAndPostIdIn(String deviceId, List<Long> postIds);
}
