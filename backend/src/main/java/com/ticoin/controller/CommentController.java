package com.ticoin.controller;

import com.ticoin.config.DeviceIdArgumentResolver.DeviceId;
import com.ticoin.dto.CommentCreateRequest;
import com.ticoin.entity.Comment;
import com.ticoin.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping
    public List<Comment> list(@RequestParam String symbol) {
        return commentService.findBySymbol(symbol);
    }

    @PostMapping
    public Comment create(@DeviceId String deviceId, @Valid @RequestBody CommentCreateRequest req) {
        return commentService.create(deviceId, req);
    }

    @DeleteMapping("/{id}")
    public void delete(@DeviceId String deviceId, @PathVariable Long id) {
        commentService.delete(deviceId, id);
    }
}
