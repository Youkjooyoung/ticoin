package com.ticoin.service;

import com.ticoin.dto.PostCreateRequest;
import com.ticoin.dto.PostDto;
import com.ticoin.entity.Post;
import com.ticoin.entity.PostLike;
import com.ticoin.entity.Profile;
import com.ticoin.repository.PostLikeRepository;
import com.ticoin.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PostService {

    private final PostRepository postRepository;
    private final PostLikeRepository likeRepository;
    private final ProfileService profileService;

    public PostDto create(String deviceId, PostCreateRequest req) {
        Profile profile = profileService.getOrCreate(deviceId);
        Post post = Post.builder()
                .deviceId(deviceId)
                .userId(profile.getUserId())
                .authorName(profile.getNickname())
                .symbol(req.symbol() != null && !req.symbol().isBlank() ? req.symbol().toUpperCase() : null)
                .content(req.content().trim())
                .imageUrl(req.imageUrl())
                .likeCount(0)
                .commentCount(0)
                .build();
        post = postRepository.save(post);
        return PostDto.of(post, false);
    }

    @Transactional(readOnly = true)
    public List<PostDto> listFeed(String deviceId, int page, int size) {
        Page<Post> posts = postRepository.findAllByOrderByCreatedAtDesc(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        );
        return toDtos(deviceId, posts.getContent());
    }

    @Transactional(readOnly = true)
    public List<PostDto> listBySymbol(String deviceId, String symbol, int page, int size) {
        Page<Post> posts = postRepository.findBySymbolOrderByCreatedAtDesc(
                symbol.toUpperCase(), PageRequest.of(page, size)
        );
        return toDtos(deviceId, posts.getContent());
    }

    public void delete(String deviceId, Long postId) {
        postRepository.findById(postId).ifPresent(post -> {
            if (post.getDeviceId().equals(deviceId)) {
                postRepository.delete(post);
            }
        });
    }

    public boolean toggleLike(String deviceId, Long postId) {
        var existing = likeRepository.findByPostIdAndDeviceId(postId, deviceId);
        if (existing.isPresent()) {
            likeRepository.delete(existing.get());
            postRepository.adjustLikeCount(postId, -1);
            return false;
        }
        likeRepository.save(PostLike.builder().postId(postId).deviceId(deviceId).build());
        postRepository.adjustLikeCount(postId, 1);
        return true;
    }

    @Transactional(readOnly = true)
    public long countByDevice(String deviceId) {
        return postRepository.countByDeviceId(deviceId);
    }

    private List<PostDto> toDtos(String deviceId, List<Post> posts) {
        if (posts.isEmpty()) return List.of();
        List<Long> ids = posts.stream().map(Post::getId).toList();
        Set<Long> liked = likeRepository.findByDeviceIdAndPostIdIn(deviceId, ids).stream()
                .map(PostLike::getPostId)
                .collect(Collectors.toSet());
        return posts.stream()
                .map(p -> PostDto.of(p, liked.contains(p.getId())))
                .toList();
    }
}
