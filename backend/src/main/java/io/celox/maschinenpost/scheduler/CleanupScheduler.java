package io.celox.maschinenpost.scheduler;

import io.celox.maschinenpost.repository.ArticleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@Slf4j
@RequiredArgsConstructor
public class CleanupScheduler {

    private final ArticleRepository articleRepository;

    @Value("${maschinenpost.retention.days:90}")
    private int retentionDays;

    @Scheduled(cron = "0 0 3 * * *")
    public void cleanupOldArticles() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(retentionDays);
        int deleted = articleRepository.deleteByCreatedAtBefore(cutoff);
        if (deleted > 0) {
            log.info("Deleted {} articles older than {} days", deleted, retentionDays);
        }
    }
}
