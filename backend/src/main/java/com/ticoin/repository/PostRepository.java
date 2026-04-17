package com.ticoin.repository;

import com.ticoin.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<Post, Long> {

    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<Post> findBySymbolOrderByCreatedAtDesc(String symbol, Pageable pageable);

    long countByDeviceId(String deviceId);

    @Modifying
    @Query("update Post p set p.likeCount = p.likeCount + :delta where p.id = :id")
    void adjustLikeCount(@Param("id") Long id, @Param("delta") int delta);
}
