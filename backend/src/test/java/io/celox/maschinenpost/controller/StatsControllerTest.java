package io.celox.maschinenpost.controller;

import io.celox.maschinenpost.scheduler.FeedScheduler;
import io.celox.maschinenpost.service.ArticleService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.lang.reflect.Field;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class StatsControllerTest {

    @Mock
    private ArticleService articleService;

    @Mock
    private FeedScheduler feedScheduler;

    @InjectMocks
    private StatsController statsController;

    @SuppressWarnings("unchecked")
    private ConcurrentHashMap<String, Instant> getRateLimitMap() throws Exception {
        Field field = StatsController.class.getDeclaredField("refreshRateLimit");
        field.setAccessible(true);
        return (ConcurrentHashMap<String, Instant>) field.get(statsController);
    }

    @Test
    void refresh_rateLimitBlocksSecondCall() {
        statsController.refresh("1.2.3.4");

        assertThrows(ResponseStatusException.class, () -> statsController.refresh("1.2.3.4"));
    }

    @Test
    void refresh_allowsDifferentIPs() {
        statsController.refresh("1.2.3.4");

        assertDoesNotThrow(() -> statsController.refresh("5.6.7.8"));
    }

    @Test
    void refresh_cleansExpiredEntries() throws Exception {
        ConcurrentHashMap<String, Instant> map = getRateLimitMap();

        // Insert an expired entry (11 minutes ago)
        map.put("expired-ip", Instant.now().minusSeconds(660));
        // Insert a fresh entry
        map.put("fresh-ip", Instant.now());

        assertEquals(2, map.size());

        // Trigger refresh from a new IP — should clean expired entries
        statsController.refresh("new-ip");

        assertFalse(map.containsKey("expired-ip"), "Expired entry should be removed");
        assertTrue(map.containsKey("fresh-ip"), "Fresh entry should remain");
        assertTrue(map.containsKey("new-ip"), "New entry should be added");
    }

    @Test
    void refresh_extractsFirstIpFromForwardedHeader() {
        statsController.refresh("1.1.1.1, 2.2.2.2, 3.3.3.3");

        // Second call with same first IP should be rate-limited
        assertThrows(ResponseStatusException.class, () -> statsController.refresh("1.1.1.1"));
    }
}
