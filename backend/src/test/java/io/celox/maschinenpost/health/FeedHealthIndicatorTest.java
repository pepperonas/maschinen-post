package io.celox.maschinenpost.health;

import io.celox.maschinenpost.model.Feed;
import io.celox.maschinenpost.repository.FeedRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.Status;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FeedHealthIndicatorTest {

    @Mock
    private FeedRepository feedRepository;

    @InjectMocks
    private FeedHealthIndicator feedHealthIndicator;

    @Test
    void health_noActiveFeeds_returnsDown() {
        when(feedRepository.findByActiveTrue()).thenReturn(List.of());
        when(feedRepository.count()).thenReturn(5L);

        Health health = feedHealthIndicator.health();

        assertEquals(Status.DOWN, health.getStatus());
        assertEquals(0, health.getDetails().get("activeFeeds"));
        assertEquals("No active feeds", health.getDetails().get("reason"));
    }

    @Test
    void health_allFeedsHealthy_returnsUp() {
        Feed healthy = Feed.builder().name("Test").url("http://test.com")
                .lastFetchedAt(LocalDateTime.now().minusHours(1)).failCount(0).build();
        when(feedRepository.findByActiveTrue()).thenReturn(List.of(healthy));
        when(feedRepository.count()).thenReturn(1L);

        Health health = feedHealthIndicator.health();

        assertEquals(Status.UP, health.getStatus());
    }

    @Test
    void health_majorityStale_returnsDown() {
        Feed stale = Feed.builder().name("Stale").url("http://stale.com")
                .lastFetchedAt(LocalDateTime.now().minusHours(25)).failCount(0).build();
        when(feedRepository.findByActiveTrue()).thenReturn(List.of(stale));
        when(feedRepository.count()).thenReturn(1L);

        Health health = feedHealthIndicator.health();

        assertEquals(Status.DOWN, health.getStatus());
        assertEquals(1L, health.getDetails().get("staleFeeds"));
    }

    @Test
    void health_majorityFailing_returnsDown() {
        Feed failing = Feed.builder().name("Failing").url("http://fail.com")
                .lastFetchedAt(LocalDateTime.now()).failCount(3).build();
        when(feedRepository.findByActiveTrue()).thenReturn(List.of(failing));
        when(feedRepository.count()).thenReturn(1L);

        Health health = feedHealthIndicator.health();

        assertEquals(Status.DOWN, health.getStatus());
        assertEquals(1L, health.getDetails().get("failingFeeds"));
    }
}
