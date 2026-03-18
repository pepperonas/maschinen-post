package io.celox.maschinenpost.service;

import io.celox.maschinenpost.model.Feed;
import io.celox.maschinenpost.repository.ArticleRepository;
import io.celox.maschinenpost.repository.FeedRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
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
    void initializeFeeds_emptyDb_seeds9Feeds() {
        when(feedRepository.count()).thenReturn(0L);
        when(feedRepository.save(any(Feed.class))).thenAnswer(i -> i.getArgument(0));

        feedService.initializeFeeds();

        ArgumentCaptor<Feed> captor = ArgumentCaptor.forClass(Feed.class);
        verify(feedRepository, times(9)).save(captor.capture());

        List<Feed> saved = captor.getAllValues();
        assertThat(saved).hasSize(9);

        long enCount = saved.stream().filter(f -> "en".equals(f.getLanguage())).count();
        long deCount = saved.stream().filter(f -> "de".equals(f.getLanguage())).count();
        assertThat(enCount).isEqualTo(7);
        assertThat(deCount).isEqualTo(2);
    }

    @Test
    void initializeFeeds_existingFeeds_migratesOldAndAddsNew() {
        when(feedRepository.count()).thenReturn(5L);
        // Migration: old heise feed exists, old t3n feed exists, Golem exists
        Feed oldHeise = Feed.builder().name("heise online").url("https://www.heise.de/rss/heise-atom.xml").language("de").active(true).build();
        Feed oldT3n = Feed.builder().name("t3n").url("https://t3n.de/rss.xml").language("de").active(true).build();
        Feed oldGolem = Feed.builder().name("Golem.de").url("https://rss.golem.de/rss.php?feed=RSS2.0").language("de").active(true).build();

        lenient().when(feedRepository.findByUrl(anyString())).thenReturn(Optional.empty());
        when(feedRepository.findByUrl("https://www.heise.de/rss/heise-atom.xml")).thenReturn(Optional.of(oldHeise));
        when(feedRepository.findByUrl("https://t3n.de/rss.xml")).thenReturn(Optional.of(oldT3n));
        when(feedRepository.findByUrl("https://rss.golem.de/rss.php?feed=RSS2.0")).thenReturn(Optional.of(oldGolem));
        lenient().when(feedRepository.existsByUrl(anyString())).thenReturn(true);
        lenient().when(feedRepository.existsByUrl("https://www.heise.de/thema/Kuenstliche-Intelligenz.xml")).thenReturn(false);
        lenient().when(feedRepository.existsByUrl("https://t3n.de/tag/kuenstliche-intelligenz/rss.xml")).thenReturn(false);
        when(feedRepository.save(any(Feed.class))).thenAnswer(i -> i.getArgument(0));

        feedService.initializeFeeds();

        // Verify heise was migrated
        assertThat(oldHeise.getName()).isEqualTo("heise KI");
        assertThat(oldHeise.getUrl()).isEqualTo("https://www.heise.de/thema/Kuenstliche-Intelligenz.xml");
        // Verify t3n was migrated
        assertThat(oldT3n.getName()).isEqualTo("t3n KI");
        assertThat(oldT3n.getUrl()).isEqualTo("https://t3n.de/tag/kuenstliche-intelligenz/rss.xml");
        // Verify Golem was disabled
        assertThat(oldGolem.isActive()).isFalse();
    }

    @Test
    void initializeFeeds_allFeedsExist_savesNothing() {
        when(feedRepository.count()).thenReturn(9L);
        when(feedRepository.findByUrl(anyString())).thenReturn(Optional.empty());
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
        var method = FeedService.class.getDeclaredMethod("computeSha256", String.class);
        method.setAccessible(true);

        String hash1 = (String) method.invoke(feedService, "https://example.com/article");
        String hash2 = (String) method.invoke(feedService, "https://example.com/article");

        assertThat(hash1).isEqualTo(hash2);
        assertThat(hash1).hasSize(64);
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

    @Test
    void isRelevant_rejectsOffTopicArticle() throws Exception {
        var method = FeedService.class.getDeclaredMethod("isRelevant", String.class, String.class);
        method.setAccessible(true);

        assertThat((boolean) method.invoke(feedService, "VW ID.Cross: Was kann der neue Elektro-SUV?", "")).isFalse();
        assertThat((boolean) method.invoke(feedService, "Portfolio-Aufbau: Warum mehr ETFs nicht gleich mehr Sicherheit bedeuten", "")).isFalse();
        assertThat((boolean) method.invoke(feedService, "WM-Spiele könnten bald auf Youtube laufen", "")).isFalse();
    }

    @Test
    void isRelevant_acceptsAiArticle() throws Exception {
        var method = FeedService.class.getDeclaredMethod("isRelevant", String.class, String.class);
        method.setAccessible(true);

        assertThat((boolean) method.invoke(feedService, "OpenAI stellt GPT-5 vor", "")).isTrue();
        assertThat((boolean) method.invoke(feedService, "Neue KI-Regulierung der EU beschlossen", "")).isTrue();
        assertThat((boolean) method.invoke(feedService, "Boston Dynamics zeigt neuen Roboter", "")).isTrue();
        assertThat((boolean) method.invoke(feedService, "Copilot bekommt neue Agent-Funktionen", "")).isTrue();
    }

    @Test
    void isRelevant_detectsRelevanceInContent() throws Exception {
        var method = FeedService.class.getDeclaredMethod("isRelevant", String.class, String.class);
        method.setAccessible(true);

        // Off-topic title but AI content
        assertThat((boolean) method.invoke(feedService, "Neue Studie veröffentlicht",
                "<p>Forscher nutzen Machine Learning um Proteine zu analysieren</p>")).isTrue();
    }

    @Test
    void adFilter_rejectsSponsored() throws Exception {
        var method = FeedService.class.getDeclaredMethod("isRelevant", String.class, String.class);
        method.setAccessible(true);

        // Ad pattern is checked separately in fetchFeed, but let's verify the pattern works
        var adField = FeedService.class.getDeclaredField("AD_PATTERN");
        adField.setAccessible(true);
        var adPattern = (java.util.regex.Pattern) adField.get(null);

        assertThat(adPattern.matcher("Anzeige: Soundbar mit Subwoofer zum Tiefpreis").find()).isTrue();
        assertThat(adPattern.matcher("Anzeige: Kompakte Powerbank günstig bei Amazon").find()).isTrue();
        assertThat(adPattern.matcher("OpenAI stellt GPT-5 vor").find()).isFalse();
    }
}
