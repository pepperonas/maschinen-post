package io.celox.maschinenpost.service;

import com.rometools.rome.feed.synd.SyndEntry;
import com.rometools.rome.feed.synd.SyndFeed;
import com.rometools.rome.io.SyndFeedInput;
import com.rometools.rome.io.XmlReader;
import io.celox.maschinenpost.model.Article;
import io.celox.maschinenpost.model.Feed;
import io.celox.maschinenpost.repository.ArticleRepository;
import io.celox.maschinenpost.repository.FeedRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLConnection;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class FeedService {

    private final FeedRepository feedRepository;
    private final ArticleRepository articleRepository;

    private static final Map<String, String> DEFAULT_FEEDS = Map.of(
            "Google AI Blog", "https://feeds.feedburner.com/blogspot/gJZg",
            "OpenAI Blog", "https://openai.com/blog/rss.xml",
            "The Verge AI", "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
            "TechCrunch AI", "https://techcrunch.com/category/artificial-intelligence/feed/",
            "MIT AI News", "https://news.mit.edu/topic/mitartificial-intelligence2-rss.xml",
            "IEEE Spectrum Robotics", "https://spectrum.ieee.org/feeds/topic/robotics.rss",
            "The Robot Report", "https://www.therobotreport.com/feed/"
    );

    @PostConstruct
    public void initializeFeeds() {
        if (feedRepository.count() == 0) {
            log.info("Initializing default RSS feeds...");
            DEFAULT_FEEDS.forEach((name, url) -> {
                Feed feed = Feed.builder()
                        .name(name)
                        .url(url)
                        .active(true)
                        .build();
                feedRepository.save(feed);
                log.info("Added feed: {} ({})", name, url);
            });
            log.info("Default feeds initialized.");
        }
    }

    public void fetchAllFeeds() {
        List<Feed> activeFeeds = feedRepository.findByActiveTrue();
        log.info("Fetching {} active feeds...", activeFeeds.size());

        int totalNew = 0;
        for (Feed feed : activeFeeds) {
            try {
                int newArticles = fetchFeed(feed);
                totalNew += newArticles;
            } catch (Exception e) {
                log.error("Error fetching feed '{}' ({}): {}", feed.getName(), feed.getUrl(), e.getMessage());
            }
        }
        log.info("Feed fetch complete. {} new articles added.", totalNew);
    }

    public int fetchFeed(Feed feed) {
        log.info("Fetching feed: {} ({})", feed.getName(), feed.getUrl());
        int newCount = 0;

        try {
            SyndFeedInput input = new SyndFeedInput();
            URLConnection connection = URI.create(feed.getUrl()).toURL().openConnection();
            connection.setConnectTimeout(10000);
            connection.setReadTimeout(10000);
            connection.setRequestProperty("User-Agent", "MaschinenPost/1.0");

            try (XmlReader reader = new XmlReader(connection)) {
                SyndFeed syndFeed = input.build(reader);

                for (SyndEntry entry : syndFeed.getEntries()) {
                    try {
                        String entryUrl = entry.getLink();
                        if (entryUrl == null || entryUrl.isBlank()) {
                            continue;
                        }

                        String urlHash = computeSha256(entryUrl);

                        if (articleRepository.existsByUrlHash(urlHash)) {
                            continue;
                        }

                        String rawContent = "";
                        if (entry.getDescription() != null) {
                            rawContent = entry.getDescription().getValue();
                        } else if (entry.getContents() != null && !entry.getContents().isEmpty()) {
                            rawContent = entry.getContents().get(0).getValue();
                        }

                        LocalDateTime publishedAt = null;
                        Date publishedDate = entry.getPublishedDate();
                        if (publishedDate != null) {
                            publishedAt = publishedDate.toInstant()
                                    .atZone(ZoneId.systemDefault())
                                    .toLocalDateTime();
                        }

                        Article article = Article.builder()
                                .title(entry.getTitle() != null ? entry.getTitle() : "Untitled")
                                .url(entryUrl)
                                .urlHash(urlHash)
                                .source(feed.getName())
                                .publishedAt(publishedAt)
                                .rawContent(rawContent)
                                .processed(false)
                                .build();

                        articleRepository.save(article);
                        newCount++;
                    } catch (Exception e) {
                        log.warn("Error processing entry from feed '{}': {}", feed.getName(), e.getMessage());
                    }
                }
            }

            feed.setLastFetchedAt(LocalDateTime.now());
            feedRepository.save(feed);
            log.info("Feed '{}': {} new articles", feed.getName(), newCount);

        } catch (Exception e) {
            log.error("Failed to fetch feed '{}': {}", feed.getName(), e.getMessage());
        }

        return newCount;
    }

    private String computeSha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}
