package io.celox.maschinenpost.model.dto;

import jakarta.validation.constraints.NotBlank;

public record FeedRequest(
        String name,
        @NotBlank String url
) {
}
