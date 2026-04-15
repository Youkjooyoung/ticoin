package com.ticoin.controller;

import com.ticoin.config.DeviceIdArgumentResolver.DeviceId;
import com.ticoin.dto.ProfileUpdateRequest;
import com.ticoin.entity.Profile;
import com.ticoin.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public Profile get(@DeviceId String deviceId) {
        return profileService.getOrCreate(deviceId);
    }

    @PutMapping
    public Profile update(@DeviceId String deviceId, @Valid @RequestBody ProfileUpdateRequest req) {
        return profileService.update(deviceId, req);
    }
}
