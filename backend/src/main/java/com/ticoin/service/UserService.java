package com.ticoin.service;

import com.ticoin.entity.User;
import com.ticoin.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;

    public User upsertFromOAuth(String provider, String providerId, String email, String name, String avatarUrl) {
        return userRepository.findByProviderAndProviderId(provider, providerId)
                .map(existing -> {
                    existing.setEmail(email);
                    if (name != null && !name.isBlank()) existing.setName(name);
                    if (avatarUrl != null && !avatarUrl.isBlank()) existing.setAvatarUrl(avatarUrl);
                    return existing;
                })
                .orElseGet(() -> userRepository.save(User.builder()
                        .provider(provider)
                        .providerId(providerId)
                        .email(email)
                        .name(name)
                        .avatarUrl(avatarUrl)
                        .role("USER")
                        .build()));
    }
}
