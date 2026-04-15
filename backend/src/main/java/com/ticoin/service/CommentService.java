package com.ticoin.service;

import com.ticoin.dto.CommentCreateRequest;
import com.ticoin.entity.Comment;
import com.ticoin.repository.CommentRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CommentService {

    private final CommentRepository commentRepository;

    @Transactional(readOnly = true)
    public List<Comment> findBySymbol(String symbol) {
        return commentRepository.findBySymbolOrderByCreatedAtDesc(symbol.toUpperCase());
    }

    public Comment create(String deviceId, CommentCreateRequest req) {
        Comment c = Comment.builder()
                .deviceId(deviceId)
                .symbol(req.symbol().toUpperCase())
                .author(req.author())
                .content(req.content())
                .build();
        return commentRepository.save(c);
    }

    public void delete(String deviceId, Long id) {
        long removed = commentRepository.deleteByIdAndDeviceId(id, deviceId);
        if (removed == 0) {
            throw new EntityNotFoundException("댓글을 찾을 수 없습니다: " + id);
        }
    }
}
