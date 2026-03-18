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
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

@Service
@Slf4j
@RequiredArgsConstructor
public class FeedService {

    private final FeedRepository feedRepository;
    private final ArticleRepository articleRepository;

    private record FeedDef(String name, String url, String language) {}

    /** Old broad German feeds to migrate to AI-specific alternatives. */
    private static final Map<String, FeedDef> FEED_MIGRATIONS = Map.of(
            "https://www.heise.de/rss/heise-atom.xml",
            new FeedDef("heise KI", "https://www.heise.de/thema/Kuenstliche-Intelligenz.xml", "de"),
            "https://t3n.de/rss.xml",
            new FeedDef("t3n KI", "https://t3n.de/tag/kuenstliche-intelligenz/rss.xml", "de")
    );

    /** Feeds to disable (no AI-specific alternative available). */
    private static final Set<String> FEEDS_TO_DISABLE = Set.of(
            "https://rss.golem.de/rss.php?feed=RSS2.0"
    );

    /** Reject articles whose title starts with "Anzeige" (sponsored ads). */
    private static final Pattern AD_PATTERN = Pattern.compile(
            "^\\s*(Anzeige|Sponsored|\\(Anzeige\\)|\\[Anzeige\\]|Werbung)\\s*[:：]?",
            Pattern.CASE_INSENSITIVE);

    /** Relevance keywords — at least one must appear in title or content for general feeds. */
    private static final Pattern RELEVANCE_PATTERN = Pattern.compile(
            "(?i)(\\bKI\\b|\\bAI\\b|künstliche.?intelligenz|artificial.?intelligence|machine.?learn|" +
            "deep.?learn|neural|\\bLLM\\b|\\bGPT\\b|\\bClaude\\b|\\bGemini\\b|\\bLlama\\b|" +
            "robot|autonom|autonomous|automation|\\bNLP\\b|computer.?vision|" +
            "sprachmodell|language.?model|chat.?bot|\\bMLOps\\b|transformer|diffusion|" +
            "\\bOpenAI\\b|\\bDeepMind\\b|\\bAnthrop|\\bMistral\\b|hugging.?face|" +
            "\\bCopilot\\b|\\bAgent\\b|prompt|\\bRAG\\b|neural.?net|reinforcement.?learn|" +
            "maschinell|\\bGAN\\b|\\bCNN\\b|\\bRNN\\b|generativ|\\bSora\\b|\\bMidjourney\\b|" +
            "\\bStable.?Diffusion|\\bDALL.?E|Foundation.?Model|Frontier.?Model)");

    private static final List<FeedDef> DEFAULT_FEEDS = List.of(
            // English
            new FeedDef("Google AI Blog", "https://feeds.feedburner.com/blogspot/gJZg", "en"),
            new FeedDef("OpenAI Blog", "https://openai.com/blog/rss.xml", "en"),
            new FeedDef("The Verge AI", "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", "en"),
            new FeedDef("TechCrunch AI", "https://techcrunch.com/category/artificial-intelligence/feed/", "en"),
            new FeedDef("MIT AI News", "https://news.mit.edu/topic/mitartificial-intelligence2-rss.xml", "en"),
            new FeedDef("IEEE Spectrum Robotics", "https://spectrum.ieee.org/feeds/topic/robotics.rss", "en"),
            new FeedDef("The Robot Report", "https://www.therobotreport.com/feed/", "en"),
            // Deutsch (KI-spezifisch)
            new FeedDef("heise KI", "https://www.heise.de/thema/Kuenstliche-Intelligenz.xml", "de"),
            new FeedDef("t3n KI", "https://t3n.de/tag/kuenstliche-intelligenz/rss.xml", "de")
    );

    @PostConstruct
    public void initializeFeeds() {
        if (feedRepository.count() == 0) {
            log.info("Initializing default RSS feeds...");
            for (FeedDef def : DEFAULT_FEEDS) {
                Feed feed = Feed.builder()
                        .name(def.name())
                        .url(def.url())
                        .language(def.language())
                        .active(true)
                        .build();
                feedRepository.save(feed);
                log.info("Added feed: {} ({}) [{}]", def.name(), def.url(), def.language());
            }
            log.info("Default feeds initialized.");
        } else {
            // Migrate old broad feeds to AI-specific alternatives
            for (var entry : FEED_MIGRATIONS.entrySet()) {
                feedRepository.findByUrl(entry.getKey()).ifPresent(oldFeed -> {
                    FeedDef replacement = entry.getValue();
                    if (!feedRepository.existsByUrl(replacement.url())) {
                        oldFeed.setName(replacement.name());
                        oldFeed.setUrl(replacement.url());
                        oldFeed.setFailCount(0);
                        oldFeed.setLastError(null);
                        oldFeed.setActive(true);
                        feedRepository.save(oldFeed);
                        log.info("Migrated feed '{}' -> '{}' ({})", entry.getKey(), replacement.name(), replacement.url());
                    }
                });
            }

            // Disable broad feeds with no AI-specific alternative
            for (String url : FEEDS_TO_DISABLE) {
                feedRepository.findByUrl(url).ifPresent(feed -> {
                    if (feed.isActive()) {
                        feed.setActive(false);
                        feed.setDisabledAt(LocalDateTime.now());
                        feedRepository.save(feed);
                        log.info("Disabled broad feed: {} ({})", feed.getName(), url);
                    }
                });
            }

            // Add new feeds that don't exist yet
            for (FeedDef def : DEFAULT_FEEDS) {
                if (!feedRepository.existsByUrl(def.url())) {
                    Feed feed = Feed.builder()
                            .name(def.name())
                            .url(def.url())
                            .language(def.language())
                            .active(true)
                            .build();
                    feedRepository.save(feed);
                    log.info("Added new feed: {} ({}) [{}]", def.name(), def.url(), def.language());
                }
            }
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
                if (feed.getFailCount() > 0) {
                    feed.setFailCount(0);
                    feed.setLastError(null);
                    feedRepository.save(feed);
                }
            } catch (Exception e) {
                log.error("Error fetching feed '{}' ({}): {}", feed.getName(), feed.getUrl(), e.getMessage());
                feed.setFailCount(feed.getFailCount() + 1);
                feed.setLastError(e.getMessage());
                if (feed.getFailCount() >= 5) {
                    feed.setActive(false);
                    feed.setDisabledAt(LocalDateTime.now());
                    log.warn("Feed '{}' disabled after {} consecutive failures", feed.getName(), feed.getFailCount());
                }
                feedRepository.save(feed);
            }
        }
        log.info("Feed fetch complete. {} new articles added.", totalNew);
    }

    public int fetchFeed(Feed feed) {
        log.info("Fetching feed: {} ({})", feed.getName(), feed.getUrl());

        try {
            SyndFeedInput input = new SyndFeedInput();
            URLConnection connection = URI.create(feed.getUrl()).toURL().openConnection();
            connection.setConnectTimeout(10000);
            connection.setReadTimeout(10000);
            connection.setRequestProperty("User-Agent", "MaschinenPost/1.0");

            List<Article> newArticles = new ArrayList<>();

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

                        String title = entry.getTitle() != null ? entry.getTitle() : "Untitled";

                        // Filter out sponsored ads
                        if (AD_PATTERN.matcher(title).find()) {
                            log.debug("Rejected ad article: {}", title);
                            continue;
                        }

                        // Relevance filter: title or content must mention AI/ML/robotics topics
                        if (!isRelevant(title, rawContent)) {
                            log.debug("Rejected off-topic article: {}", title);
                            continue;
                        }

                        Article article = Article.builder()
                                .title(title)
                                .url(entryUrl)
                                .urlHash(urlHash)
                                .source(feed.getName())
                                .language(feed.getLanguage() != null ? feed.getLanguage() : "en")
                                .publishedAt(publishedAt)
                                .rawContent(rawContent)
                                .processed(false)
                                .build();

                        newArticles.add(article);
                    } catch (Exception e) {
                        log.warn("Error processing entry from feed '{}': {}", feed.getName(), e.getMessage());
                    }
                }
            }

            if (!newArticles.isEmpty()) {
                articleRepository.saveAll(newArticles);
            }

            feed.setLastFetchedAt(LocalDateTime.now());
            feedRepository.save(feed);
            log.info("Feed '{}': {} new articles", feed.getName(), newArticles.size());

            return newArticles.size();
        } catch (Exception e) {
            log.error("Failed to fetch feed '{}': {}", feed.getName(), e.getMessage());
            return 0;
        }
    }

    /**
     * Check if an article is relevant to AI/ML/robotics topics.
     */
    private boolean isRelevant(String title, String rawContent) {
        if (RELEVANCE_PATTERN.matcher(title).find()) {
            return true;
        }
        String stripped = rawContent.replaceAll("<[^>]*>", " ")
                .replaceAll("&[a-zA-Z#0-9]+;", " ");
        // Check first 500 chars of content for relevance
        String contentSample = stripped.length() > 500 ? stripped.substring(0, 500) : stripped;
        return RELEVANCE_PATTERN.matcher(contentSample).find();
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
