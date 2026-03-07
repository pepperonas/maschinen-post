package io.celox.maschinenpost.model.dto;

import java.util.List;

public record AiProcessingResult(
        String summary,
        List<String> tags,
        String category,
        String sentiment
) {
}
