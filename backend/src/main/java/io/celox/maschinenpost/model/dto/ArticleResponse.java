package io.celox.maschinenpost.model.dto;

import io.celox.maschinenpost.model.Article;

import java.time.LocalDateTime;
import java.util.List;

public record ArticleResponse(
        Long id,
        String title,
        String url,
        String source,
        String language,
        LocalDateTime publishedAt,
        String rawContent,
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
                article.getLanguage(),
                article.getPublishedAt(),
                stripHtml(article.getRawContent()),
                article.getSummary(),
                article.getTagList(),
                article.getCategory(),
                article.getSentiment(),
                article.isProcessed(),
                article.getCreatedAt(),
                article.getUpdatedAt()
        );
    }

    private static String stripHtml(String html) {
        if (html == null || html.isBlank()) return null;
        String text = html.replaceAll("<[^>]*>", "").replaceAll("&[a-zA-Z]+;", " ").trim();
        if (text.length() > 300) {
            text = text.substring(0, 300) + "...";
        }
        return text.isBlank() ? null : text;
    }
}
