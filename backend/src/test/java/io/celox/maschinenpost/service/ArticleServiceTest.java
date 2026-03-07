package io.celox.maschinenpost.service;

import io.celox.maschinenpost.model.Article;
import io.celox.maschinenpost.model.dto.ArticleResponse;
import io.celox.maschinenpost.model.dto.StatsResponse;
import io.celox.maschinenpost.repository.ArticleRepository;
import io.celox.maschinenpost.repository.FeedRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ArticleServiceTest {

    @Mock
    private ArticleRepository articleRepository;

    @Mock
    private FeedRepository feedRepository;

    @InjectMocks
    private ArticleService articleService;

    private Article buildArticle(Long id, String title) {
        Article a = Article.builder()
                .id(id)
                .title(title)
                .url("https://example.com/" + id)
                .urlHash("hash" + id)
                .source("Test Feed")
                .build();
        a.setCreatedAt(LocalDateTime.of(2026, 3, 7, 12, 0));
        return a;
    }

    @Test
    void getArticles_defaultSort_sortsByPublishedAtDesc() {
        Page<Article> page = new PageImpl<>(List.of(buildArticle(1L, "Test")));
        when(articleRepository.findAll(any(PageRequest.class))).thenReturn(page);

        articleService.getArticles(0, 10, null, null, null, null);

        ArgumentCaptor<PageRequest> captor = ArgumentCaptor.forClass(PageRequest.class);
        verify(articleRepository).findAll(captor.capture());
        Sort sort = captor.getValue().getSort();
        assertThat(sort.getOrderFor("publishedAt")).isNotNull();
        assertThat(sort.getOrderFor("publishedAt").getDirection()).isEqualTo(Sort.Direction.DESC);
    }

    @Test
    void getArticles_latestSort_sortsByCreatedAtDesc() {
        Page<Article> page = new PageImpl<>(List.of(buildArticle(1L, "Test")));
        when(articleRepository.findAll(any(PageRequest.class))).thenReturn(page);

        articleService.getArticles(0, 10, null, null, "latest", null);

        ArgumentCaptor<PageRequest> captor = ArgumentCaptor.forClass(PageRequest.class);
        verify(articleRepository).findAll(captor.capture());
        Sort sort = captor.getValue().getSort();
        assertThat(sort.getOrderFor("createdAt")).isNotNull();
        assertThat(sort.getOrderFor("createdAt").getDirection()).isEqualTo(Sort.Direction.DESC);
    }

    @Test
    void getArticles_withCategory_callsFindByCategory() {
        Page<Article> page = new PageImpl<>(List.of());
        when(articleRepository.findByCategory(eq("Robotik"), any(PageRequest.class))).thenReturn(page);

        articleService.getArticles(0, 10, "Robotik", null, null, null);

        verify(articleRepository).findByCategory(eq("Robotik"), any(PageRequest.class));
        verify(articleRepository, never()).findAll(any(PageRequest.class));
    }

    @Test
    void getArticles_withSearch_callsSearch() {
        Page<Article> page = new PageImpl<>(List.of());
        when(articleRepository.search(eq("GPT"), any(PageRequest.class))).thenReturn(page);

        articleService.getArticles(0, 10, null, "GPT", null, null);

        verify(articleRepository).search(eq("GPT"), any(PageRequest.class));
    }

    @Test
    void getArticles_withCategoryAndSearch_callsSearchByCategory() {
        Page<Article> page = new PageImpl<>(List.of());
        when(articleRepository.searchByCategory(eq("GPT"), eq("KI-Modelle"), any(PageRequest.class))).thenReturn(page);

        articleService.getArticles(0, 10, "KI-Modelle", "GPT", null, null);

        verify(articleRepository).searchByCategory(eq("GPT"), eq("KI-Modelle"), any(PageRequest.class));
    }

    @Test
    void getArticles_blankCategoryAndSearch_treatedAsNoFilter() {
        Page<Article> page = new PageImpl<>(List.of());
        when(articleRepository.findAll(any(PageRequest.class))).thenReturn(page);

        articleService.getArticles(0, 10, "  ", "  ", null, null);

        verify(articleRepository).findAll(any(PageRequest.class));
    }

    @Test
    void getArticles_mapsToArticleResponse() {
        Article article = buildArticle(1L, "Test Title");
        article.setTags("[\"KI\"]");
        Page<Article> page = new PageImpl<>(List.of(article));
        when(articleRepository.findAll(any(PageRequest.class))).thenReturn(page);

        Page<ArticleResponse> result = articleService.getArticles(0, 10, null, null, null, null);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).title()).isEqualTo("Test Title");
        assertThat(result.getContent().get(0).tags()).containsExactly("KI");
    }

    @Test
    void getArticle_found_returnsResponse() {
        Article article = buildArticle(1L, "Found");
        when(articleRepository.findById(1L)).thenReturn(Optional.of(article));

        ArticleResponse response = articleService.getArticle(1L);

        assertThat(response.title()).isEqualTo("Found");
    }

    @Test
    void getArticle_notFound_throws404() {
        when(articleRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> articleService.getArticle(99L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("404");
    }

    @Test
    void getStats_aggregatesCorrectly() {
        when(articleRepository.count()).thenReturn(100L);
        when(articleRepository.countByProcessedTrue()).thenReturn(80L);
        when(feedRepository.count()).thenReturn(10L);

        Article latest = buildArticle(1L, "Latest");
        when(articleRepository.findTopByOrderByCreatedAtDesc()).thenReturn(Optional.of(latest));

        when(articleRepository.countByCategory()).thenReturn(List.of(
                new Object[]{"KI-Modelle", 30L},
                new Object[]{"Robotik", 20L}
        ));

        StatsResponse stats = articleService.getStats();

        assertThat(stats.totalArticles()).isEqualTo(100L);
        assertThat(stats.processedArticles()).isEqualTo(80L);
        assertThat(stats.totalFeeds()).isEqualTo(10L);
        assertThat(stats.lastUpdate()).isNotEqualTo("N/A");
        assertThat(stats.articlesPerCategory()).containsEntry("KI-Modelle", 30L);
        assertThat(stats.articlesPerCategory()).containsEntry("Robotik", 20L);
    }

    @Test
    void getStats_noArticles_returnsNA() {
        when(articleRepository.count()).thenReturn(0L);
        when(articleRepository.countByProcessedTrue()).thenReturn(0L);
        when(feedRepository.count()).thenReturn(0L);
        when(articleRepository.findTopByOrderByCreatedAtDesc()).thenReturn(Optional.empty());
        when(articleRepository.countByCategory()).thenReturn(List.of());

        StatsResponse stats = articleService.getStats();

        assertThat(stats.lastUpdate()).isEqualTo("N/A");
        assertThat(stats.articlesPerCategory()).isEmpty();
    }
}
