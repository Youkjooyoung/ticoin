package com.ticoin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProfileUpdateRequest(
        @NotBlank @Size(max = 50) String nickname,
        @Size(max = 200) String bio,
        @Size(max = 262144) String avatarUrl
) {}
