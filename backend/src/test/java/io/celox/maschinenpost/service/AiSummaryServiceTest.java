package io.celox.maschinenpost.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.celox.maschinenpost.model.Article;
import io.celox.maschinenpost.repository.ArticleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AiSummaryServiceTest {

    @Mock
    private ArticleRepository articleRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private AiSummaryService aiSummaryService;

    @BeforeEach
    void setUp() throws Exception {
        aiSummaryService = new AiSummaryService(articleRepository, objectMapper);
        // Set apiKey field via reflection (normally injected by Spring @Value)
        setField("apiKey", "");
    }

    private void setField(String name, Object value) throws Exception {
        Field field = AiSummaryService.class.getDeclaredField(name);
        field.setAccessible(true);
        field.set(aiSummaryService, value);
    }

    @Test
    void processArticle_noApiKey_returnsNull() {
        Article article = Article.builder().title("Test").build();

        assertThat(aiSummaryService.processArticle(article)).isNull();
    }

    @Test
    void processArticle_blankApiKey_returnsNull() throws Exception {
        setField("apiKey", "   ");
        Article article = Article.builder().title("Test").build();

        assertThat(aiSummaryService.processArticle(article)).isNull();
    }

    @Test
    void processUnprocessedArticles_noApiKey_skipsProcessing() {
        aiSummaryService.processUnprocessedArticles();

        verifyNoInteractions(articleRepository);
    }

    @Test
    void processUnprocessedArticles_blankApiKey_skipsProcessing() throws Exception {
        setField("apiKey", "  ");

        aiSummaryService.processUnprocessedArticles();

        verifyNoInteractions(articleRepository);
    }

    @Test
    void processUnprocessedArticles_concurrentGuard_preventsParallel() throws Exception {
        setField("apiKey", "sk-test-key");

        // Manually set the processing flag to true to simulate a running process
        Field processingField = AiSummaryService.class.getDeclaredField("processing");
        processingField.setAccessible(true);
        AtomicBoolean processing = (AtomicBoolean) processingField.get(aiSummaryService);
        processing.set(true);

        // This call should be skipped due to the guard
        aiSummaryService.processUnprocessedArticles();

        // articleRepository.findByProcessedFalse() should NOT be called
        verify(articleRepository, never()).findByProcessedFalse();
    }

    @Test
    void processUnprocessedArticles_noUnprocessed_returnsEarly() throws Exception {
        setField("apiKey", "sk-test-key");
        when(articleRepository.findByProcessedFalse()).thenReturn(List.of());

        aiSummaryService.processUnprocessedArticles();

        verify(articleRepository).findByProcessedFalse();
        verify(articleRepository, never()).findById(any());
    }

    @Test
    void processUnprocessedArticles_releasesLockAfterCompletion() throws Exception {
        setField("apiKey", "sk-test-key");
        when(articleRepository.findByProcessedFalse()).thenReturn(List.of());

        aiSummaryService.processUnprocessedArticles();

        // Lock should be released — a second call should succeed
        aiSummaryService.processUnprocessedArticles();

        verify(articleRepository, times(2)).findByProcessedFalse();
    }
}
