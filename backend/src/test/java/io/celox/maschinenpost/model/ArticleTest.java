package io.celox.maschinenpost.model;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ArticleTest {

    @Test
    void getTagList_validJson_returnsList() {
        Article article = new Article();
        article.setTags("[\"KI\",\"Robotik\",\"Forschung\"]");

        List<String> tags = article.getTagList();

        assertThat(tags).containsExactly("KI", "Robotik", "Forschung");
    }

    @Test
    void getTagList_nullTags_returnsEmptyList() {
        Article article = new Article();
        article.setTags(null);

        assertThat(article.getTagList()).isEmpty();
    }

    @Test
    void getTagList_blankTags_returnsEmptyList() {
        Article article = new Article();
        article.setTags("   ");

        assertThat(article.getTagList()).isEmpty();
    }

    @Test
    void getTagList_invalidJson_returnsEmptyList() {
        Article article = new Article();
        article.setTags("not valid json");

        assertThat(article.getTagList()).isEmpty();
    }

    @Test
    void setTagList_validList_serializesToJson() {
        Article article = new Article();
        article.setTagList(List.of("AI", "ML"));

        assertThat(article.getTags()).isEqualTo("[\"AI\",\"ML\"]");
        assertThat(article.getTagList()).containsExactly("AI", "ML");
    }

    @Test
    void setTagList_emptyList_serializesToEmptyArray() {
        Article article = new Article();
        article.setTagList(List.of());

        assertThat(article.getTags()).isEqualTo("[]");
    }

    @Test
    void setTagList_null_serializesToEmptyArray() {
        Article article = new Article();
        article.setTagList(null);

        assertThat(article.getTags()).isEqualTo("[]");
    }

    @Test
    void builder_defaultValues() {
        Article article = Article.builder()
                .title("Test")
                .url("https://example.com")
                .urlHash("abc123")
                .build();

        assertThat(article.getLanguage()).isEqualTo("en");
        assertThat(article.isProcessed()).isFalse();
    }
}
