package io.celox.maschinenpost.model.dto;

import io.celox.maschinenpost.model.Article;

import java.time.LocalDateTime;
import java.util.List;

public record ArticleResponse(
        Long id,
        String title,
        String url,
        String source,
        LocalDateTime publishedAt,
        String summary,
        List<String> tags,
        String category,
        String sentiment,
        boolean processed,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static ArticleResponse from(Article article) {
        return new ArticleResponse(
                article.getId(),
                article.getTitle(),
                article.getUrl(),
                article.getSource(),
                article.getPublishedAt(),
                article.getSummary(),
                article.getTagList(),
                article.getCategory(),
                article.getSentiment(),
                article.isProcessed(),
                article.getCreatedAt(),
                article.getUpdatedAt()
        );
    }
}
