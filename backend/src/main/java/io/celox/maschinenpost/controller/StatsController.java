package io.celox.maschinenpost.controller;

import io.celox.maschinenpost.model.dto.StatsResponse;
import io.celox.maschinenpost.service.AiSummaryService;
import io.celox.maschinenpost.service.ArticleService;
import io.celox.maschinenpost.service.FeedService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class StatsController {

    private final ArticleService articleService;
    private final FeedService feedService;
    private final AiSummaryService aiSummaryService;

    @GetMapping("/stats")
    public StatsResponse getStats() {
        return articleService.getStats();
    }

    @PostMapping("/refresh")
    public Map<String, String> refresh() {
        log.info("Manual refresh triggered via API.");

        new Thread(() -> {
            try {
                feedService.fetchAllFeeds();
                aiSummaryService.processUnprocessedArticles();
            } catch (Exception e) {
                log.error("Error during manual refresh: {}", e.getMessage());
            }
        }).start();

        return Map.of("message", "Feed refresh triggered. Articles will be updated in the background.");
    }
}
