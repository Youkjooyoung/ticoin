package com.ticoin.service;

import com.ticoin.dto.ProfileUpdateRequest;
import com.ticoin.entity.Profile;
import com.ticoin.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ProfileService {

    private final ProfileRepository profileRepository;

    public Profile getOrCreate(String deviceId) {
        return profileRepository.findByDeviceId(deviceId).orElseGet(() -> {
            Profile p = Profile.builder()
                    .deviceId(deviceId)
                    .nickname("guest_" + deviceId.substring(0, Math.min(6, deviceId.length())))
                    .bio("주식 & 코인 투자자")
                    .build();
            return profileRepository.save(p);
        });
    }

    public Profile update(String deviceId, ProfileUpdateRequest req) {
        Profile p = getOrCreate(deviceId);
        p.setNickname(req.nickname());
        p.setBio(req.bio());
        p.setAvatarUrl(req.avatarUrl());
        return p;
    }
}
