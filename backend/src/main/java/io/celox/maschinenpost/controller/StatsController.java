package io.celox.maschinenpost.controller;

import io.celox.maschinenpost.model.dto.StatsResponse;
import io.celox.maschinenpost.scheduler.FeedScheduler;
import io.celox.maschinenpost.service.ArticleService;
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
    private final FeedScheduler feedScheduler;

    @GetMapping("/stats")
    public StatsResponse getStats() {
        return articleService.getStats();
    }

    @PostMapping("/refresh")
    public Map<String, String> refresh() {
        log.info("Manual refresh triggered via API.");

        new Thread(() -> feedScheduler.runFetchCycle("Manual")).start();

        return Map.of("message", "Feed refresh triggered. Articles will be updated in the background.");
    }
}
