package io.celox.maschinenpost.model.dto;

import java.util.Map;

public record StatsResponse(
        long totalArticles,
        long processedArticles,
        long totalFeeds,
        String lastUpdate,
        Map<String, Long> articlesPerCategory
) {
}
