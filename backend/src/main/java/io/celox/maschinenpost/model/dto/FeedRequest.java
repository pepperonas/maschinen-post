package io.celox.maschinenpost.model.dto;

import jakarta.validation.constraints.NotBlank;

public record FeedRequest(
        @NotBlank String name,
        @NotBlank String url
) {
}
