package com.ticoin.controller;

import com.ticoin.config.DeviceIdArgumentResolver.DeviceId;
import com.ticoin.dto.PostCreateRequest;
import com.ticoin.dto.PostDto;
import com.ticoin.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @GetMapping
    public List<PostDto> list(@DeviceId String deviceId,
                              @RequestParam(required = false) String symbol,
                              @RequestParam(defaultValue = "0") int page,
                              @RequestParam(defaultValue = "20") int size) {
        if (symbol != null && !symbol.isBlank()) {
            return postService.listBySymbol(deviceId, symbol, page, size);
        }
        return postService.listFeed(deviceId, page, size);
    }

    @PostMapping
    public PostDto create(@DeviceId String deviceId, @Valid @RequestBody PostCreateRequest req) {
        return postService.create(deviceId, req);
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> delete(@DeviceId String deviceId, @PathVariable Long id) {
        postService.delete(deviceId, id);
        return Map.of("deleted", true);
    }

    @PostMapping("/{id}/like")
    public Map<String, Object> toggleLike(@DeviceId String deviceId, @PathVariable Long id) {
        boolean liked = postService.toggleLike(deviceId, id);
        return Map.of("liked", liked);
    }
}
