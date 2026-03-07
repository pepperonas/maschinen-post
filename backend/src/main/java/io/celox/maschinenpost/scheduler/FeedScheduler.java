package io.celox.maschinenpost.scheduler;

import io.celox.maschinenpost.service.AiSummaryService;
import io.celox.maschinenpost.service.FeedService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.concurrent.atomic.AtomicBoolean;

@Component
@Slf4j
@RequiredArgsConstructor
public class FeedScheduler {

    private final FeedService feedService;
    private final AiSummaryService aiSummaryService;
    private final AtomicBoolean running = new AtomicBoolean(false);

    @Scheduled(fixedRateString = "${maschinenpost.scheduler.feed-fetch-rate}", initialDelay = 60000)
    public void fetchFeeds() {
        runFetchCycle("Scheduled");
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        runFetchCycle("Initial");
    }

    private void runFetchCycle(String trigger) {
        if (!running.compareAndSet(false, true)) {
            log.info("{} fetch skipped — another fetch is already running.", trigger);
            return;
        }
        try {
            log.info("{} feed fetch started...", trigger);
            feedService.fetchAllFeeds();
            aiSummaryService.processUnprocessedArticles();
            log.info("{} feed fetch complete.", trigger);
        } finally {
            running.set(false);
        }
    }
}
