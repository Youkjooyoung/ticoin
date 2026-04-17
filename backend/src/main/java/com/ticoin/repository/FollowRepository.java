package com.ticoin.repository;

import com.ticoin.entity.Follow;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FollowRepository extends JpaRepository<Follow, Long> {
    long countByFollowerId(Long followerId);
    long countByFollowingId(Long followingId);
    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);
    void deleteByFollowerIdAndFollowingId(Long followerId, Long followingId);
}
