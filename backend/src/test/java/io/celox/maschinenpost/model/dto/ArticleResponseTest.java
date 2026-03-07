package io.celox.maschinenpost.model.dto;

import io.celox.maschinenpost.model.Article;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ArticleResponseTest {

    @Test
    void from_mapsAllFields() {
        LocalDateTime now = LocalDateTime.of(2026, 3, 7, 12, 0);
        Article article = Article.builder()
                .id(42L)
                .title("Test Article")
                .url("https://example.com/article")
                .urlHash("abc123")
                .source("Test Feed")
                .language("de")
                .publishedAt(now)
                .summary("Eine Zusammenfassung")
                .category("KI-Modelle")
                .sentiment("positiv")
                .processed(true)
                .build();
        article.setTags("[\"KI\",\"Test\"]");
        article.setCreatedAt(now);
        article.setUpdatedAt(now);

        ArticleResponse response = ArticleResponse.from(article);

        assertThat(response.id()).isEqualTo(42L);
        assertThat(response.title()).isEqualTo("Test Article");
        assertThat(response.url()).isEqualTo("https://example.com/article");
        assertThat(response.source()).isEqualTo("Test Feed");
        assertThat(response.language()).isEqualTo("de");
        assertThat(response.publishedAt()).isEqualTo(now);
        assertThat(response.summary()).isEqualTo("Eine Zusammenfassung");
        assertThat(response.tags()).containsExactly("KI", "Test");
        assertThat(response.category()).isEqualTo("KI-Modelle");
        assertThat(response.sentiment()).isEqualTo("positiv");
        assertThat(response.processed()).isTrue();
        assertThat(response.createdAt()).isEqualTo(now);
        assertThat(response.updatedAt()).isEqualTo(now);
    }

    @Test
    void from_rawContent_stripsHtml() {
        Article article = Article.builder()
                .title("Test")
                .url("https://example.com")
                .urlHash("hash")
                .rawContent("<p>Ein <b>wichtiger</b> Artikel &uuml;ber KI.</p>")
                .build();

        ArticleResponse response = ArticleResponse.from(article);

        assertThat(response.rawContent()).doesNotContain("<", ">");
        assertThat(response.rawContent()).contains("Ein");
        assertThat(response.rawContent()).contains("wichtiger");
    }

    @Test
    void from_rawContent_truncatesLongText() {
        String longContent = "A".repeat(500);
        Article article = Article.builder()
                .title("Test")
                .url("https://example.com")
                .urlHash("hash")
                .rawContent(longContent)
                .build();

        ArticleResponse response = ArticleResponse.from(article);

        assertThat(response.rawContent()).hasSizeLessThanOrEqualTo(303); // 300 + "..."
        assertThat(response.rawContent()).endsWith("...");
    }

    @Test
    void from_nullRawContent_returnsNull() {
        Article article = Article.builder()
                .title("Test")
                .url("https://example.com")
                .urlHash("hash")
                .build();

        ArticleResponse response = ArticleResponse.from(article);

        assertThat(response.rawContent()).isNull();
    }

    @Test
    void from_nullTags_returnsEmptyList() {
        Article article = Article.builder()
                .title("Test")
                .url("https://example.com")
                .urlHash("hash")
                .build();

        ArticleResponse response = ArticleResponse.from(article);

        assertThat(response.tags()).isEmpty();
    }

    @Test
    void from_nullSummary_mapsAsNull() {
        Article article = Article.builder()
                .title("Test")
                .url("https://example.com")
                .urlHash("hash")
                .build();

        ArticleResponse response = ArticleResponse.from(article);

        assertThat(response.summary()).isNull();
        assertThat(response.processed()).isFalse();
    }
}
