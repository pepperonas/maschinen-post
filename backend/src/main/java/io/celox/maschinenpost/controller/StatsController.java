package io.celox.maschinenpost.controller;

import io.celox.maschinenpost.model.dto.StatsResponse;
import io.celox.maschinenpost.scheduler.FeedScheduler;
import io.celox.maschinenpost.service.ArticleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class StatsController {

    private final ArticleService articleService;
    private final FeedScheduler feedScheduler;
    private final ConcurrentHashMap<String, Instant> refreshRateLimit = new ConcurrentHashMap<>();

    @GetMapping("/stats")
    public StatsResponse getStats() {
        return articleService.getStats();
    }

    @GetMapping("/stats/history")
    public Map<String, Object> getStatsHistory(@RequestParam(defaultValue = "30") int days) {
        int safeDays = Math.min(Math.max(days, 1), 365);
        return articleService.getStatsHistory(safeDays);
    }

    @PostMapping("/refresh")
    public Map<String, String> refresh(@RequestHeader(value = "X-Forwarded-For", defaultValue = "unknown") String ip) {
        String clientIp = ip.contains(",") ? ip.split(",")[0].trim() : ip;
        Instant lastRefresh = refreshRateLimit.get(clientIp);
        if (lastRefresh != null && lastRefresh.plusSeconds(600).isAfter(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Rate limit: max 1 refresh per 10 minutes");
        }
        refreshRateLimit.put(clientIp, Instant.now());

        log.info("Manual refresh triggered via API from {}", clientIp);
        new Thread(() -> feedScheduler.runFetchCycle("Manual")).start();

        return Map.of("message", "Feed refresh triggered. Articles will be updated in the background.");
    }
}
