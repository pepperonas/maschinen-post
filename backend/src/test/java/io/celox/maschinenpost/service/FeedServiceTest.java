package io.celox.maschinenpost.service;

import io.celox.maschinenpost.model.Feed;
import io.celox.maschinenpost.repository.ArticleRepository;
import io.celox.maschinenpost.repository.FeedRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FeedServiceTest {

    @Mock
    private FeedRepository feedRepository;

    @Mock
    private ArticleRepository articleRepository;

    @InjectMocks
    private FeedService feedService;

    @Test
    void initializeFeeds_emptyDb_seeds10Feeds() {
        when(feedRepository.count()).thenReturn(0L);
        when(feedRepository.save(any(Feed.class))).thenAnswer(i -> i.getArgument(0));

        feedService.initializeFeeds();

        ArgumentCaptor<Feed> captor = ArgumentCaptor.forClass(Feed.class);
        verify(feedRepository, times(10)).save(captor.capture());

        List<Feed> saved = captor.getAllValues();
        assertThat(saved).hasSize(10);

        long enCount = saved.stream().filter(f -> "en".equals(f.getLanguage())).count();
        long deCount = saved.stream().filter(f -> "de".equals(f.getLanguage())).count();
        assertThat(enCount).isEqualTo(7);
        assertThat(deCount).isEqualTo(3);
    }

    @Test
    void initializeFeeds_existingFeeds_addsMissingOnly() {
        when(feedRepository.count()).thenReturn(5L);
        // First 5 feeds already exist, next 5 don't
        when(feedRepository.existsByUrl(anyString()))
                .thenReturn(true, true, true, true, true, false, false, false, false, false);
        when(feedRepository.save(any(Feed.class))).thenAnswer(i -> i.getArgument(0));

        feedService.initializeFeeds();

        verify(feedRepository, times(5)).save(any(Feed.class));
    }

    @Test
    void initializeFeeds_allFeedsExist_savesNothing() {
        when(feedRepository.count()).thenReturn(10L);
        when(feedRepository.existsByUrl(anyString())).thenReturn(true);

        feedService.initializeFeeds();

        verify(feedRepository, never()).save(any(Feed.class));
    }

    @Test
    void fetchAllFeeds_noActiveFeeds_doesNothing() {
        when(feedRepository.findByActiveTrue()).thenReturn(List.of());

        feedService.fetchAllFeeds();

        verifyNoInteractions(articleRepository);
    }

    @Test
    void computeSha256_deterministicHash() throws Exception {
        // Access private method via reflection to test hash determinism
        var method = FeedService.class.getDeclaredMethod("computeSha256", String.class);
        method.setAccessible(true);

        String hash1 = (String) method.invoke(feedService, "https://example.com/article");
        String hash2 = (String) method.invoke(feedService, "https://example.com/article");

        assertThat(hash1).isEqualTo(hash2);
        assertThat(hash1).hasSize(64); // SHA-256 produces 64 hex chars
        assertThat(hash1).matches("[0-9a-f]{64}");
    }

    @Test
    void computeSha256_differentInputs_differentHashes() throws Exception {
        var method = FeedService.class.getDeclaredMethod("computeSha256", String.class);
        method.setAccessible(true);

        String hash1 = (String) method.invoke(feedService, "https://example.com/a");
        String hash2 = (String) method.invoke(feedService, "https://example.com/b");

        assertThat(hash1).isNotEqualTo(hash2);
    }
}
