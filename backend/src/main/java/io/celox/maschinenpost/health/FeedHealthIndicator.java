package io.celox.maschinenpost.health;

import io.celox.maschinenpost.model.Feed;
import io.celox.maschinenpost.repository.FeedRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class FeedHealthIndicator implements HealthIndicator {

    private final FeedRepository feedRepository;

    @Override
    public Health health() {
        List<Feed> activeFeeds = feedRepository.findByActiveTrue();
        long totalFeeds = feedRepository.count();
        long staleFeeds = activeFeeds.stream()
                .filter(f -> f.getLastFetchedAt() != null && f.getLastFetchedAt().isBefore(LocalDateTime.now().minusHours(24)))
                .count();
        long failingFeeds = activeFeeds.stream()
                .filter(f -> f.getFailCount() >= 3)
                .count();

        Health.Builder builder = (staleFeeds > activeFeeds.size() / 2 || failingFeeds > activeFeeds.size() / 2)
                ? Health.down()
                : Health.up();

        return builder
                .withDetail("totalFeeds", totalFeeds)
                .withDetail("activeFeeds", activeFeeds.size())
                .withDetail("staleFeeds", staleFeeds)
                .withDetail("failingFeeds", failingFeeds)
                .build();
    }
}
