package com.ticoin.service;

import com.ticoin.entity.User;
import com.ticoin.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

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

    public User registerLocal(String email, String password, String name) {
        String normalizedEmail = normalizeEmail(email);
        if (normalizedEmail.isBlank()) throw new IllegalArgumentException("이메일을 입력해 주세요.");
        if (password == null || password.length() < 8) throw new IllegalArgumentException("비밀번호는 8자 이상이어야 합니다.");
        userRepository.findByEmailIgnoreCaseAndProvider(normalizedEmail, "local")
                .ifPresent(user -> {
                    throw new IllegalArgumentException("이미 가입된 이메일입니다.");
                });
        String displayName = name == null || name.isBlank() ? normalizedEmail.substring(0, normalizedEmail.indexOf('@')) : name.trim();
        return userRepository.save(User.builder()
                .provider("local")
                .providerId(normalizedEmail)
                .email(normalizedEmail)
                .name(displayName)
                .passwordHash(passwordEncoder.encode(password))
                .role("USER")
                .build());
    }

    public User loginLocal(String email, String password) {
        String normalizedEmail = normalizeEmail(email);
        User user = userRepository.findByEmailIgnoreCaseAndProvider(normalizedEmail, "local")
                .orElseThrow(() -> new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다."));
        if (!passwordEncoder.matches(password == null ? "" : password, user.getPasswordHash())) {
            throw new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }
        return user;
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }
}
