package io.celox.maschinenpost.scheduler;

import io.celox.maschinenpost.service.AiSummaryService;
import io.celox.maschinenpost.service.FeedService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class FeedScheduler {

    private final FeedService feedService;
    private final AiSummaryService aiSummaryService;

    @Scheduled(fixedRateString = "${maschinenpost.scheduler.feed-fetch-rate}")
    public void fetchFeeds() {
        log.info("Starting scheduled feed fetch...");
        feedService.fetchAllFeeds();
        aiSummaryService.processUnprocessedArticles();
        log.info("Feed fetch complete.");
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        log.info("Application ready. Triggering initial feed fetch...");
        feedService.fetchAllFeeds();
        aiSummaryService.processUnprocessedArticles();
        log.info("Initial feed fetch complete.");
    }
}
