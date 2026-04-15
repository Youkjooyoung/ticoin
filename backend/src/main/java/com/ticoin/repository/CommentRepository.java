package com.ticoin.repository;

import com.ticoin.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findBySymbolOrderByCreatedAtDesc(String symbol);
    long deleteByIdAndDeviceId(Long id, String deviceId);
}
