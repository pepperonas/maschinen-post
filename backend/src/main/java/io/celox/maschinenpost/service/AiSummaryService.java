package io.celox.maschinenpost.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.celox.maschinenpost.model.Article;
import io.celox.maschinenpost.model.dto.AiProcessingResult;
import io.celox.maschinenpost.repository.ArticleRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.net.http.HttpClient;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
@Slf4j
@RequiredArgsConstructor
public class AiSummaryService {

    private final ArticleRepository articleRepository;
    private final ObjectMapper objectMapper;
    private final DuplicateDetectionService duplicateDetectionService;
    private final AtomicBoolean processing = new AtomicBoolean(false);

    @Value("${maschinenpost.claude.api-key:}")
    private String apiKey;

    @Value("${maschinenpost.claude.model:claude-haiku-5-5}")
    private String model;

    @Value("${maschinenpost.claude.max-tokens:1024}")
    private int maxTokens;

    private RestClient restClient;

    private static final String CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";

    private static final String SYSTEM_PROMPT = """
            KI-Redakteur für MaschinenPost. Fasse Artikel auf Deutsch zusammen — MAXIMAL 2 kurze, kompakte Sätze. Komprimiere Infos stark, keine Füllwörter.\
            Antwort NUR als JSON: {"summary":"max 2 kurze Sätze","tags":["3-5 Tags"],"category":"EINE aus: KI-Modelle|Robotik|Regulierung|Startups|Forschung|Hardware|Tools","sentiment":"positiv|neutral|kritisch"}""";

    @PostConstruct
    public void init() {
        this.restClient = RestClient.builder()
                .baseUrl(CLAUDE_API_URL)
                .requestFactory(new JdkClientHttpRequestFactory(
                        HttpClient.newBuilder()
                                .connectTimeout(Duration.ofSeconds(10))
                                .build()))
                .build();
    }

    public AiProcessingResult processArticle(Article article) {
        if (apiKey == null || apiKey.isBlank()) {
            return null;
        }

        try {
            String rawContent = article.getRawContent() != null ? article.getRawContent() : "";
            rawContent = stripContent(rawContent);
            if (rawContent.length() > 600) {
                rawContent = rawContent.substring(0, 600);
            }

            String userMessage = article.getTitle() + "\n" + rawContent;

            String requestJson = objectMapper.writeValueAsString(buildRequestBody(model, maxTokens, userMessage));

            String responseBody = restClient.post()
                    .header("x-api-key", apiKey)
                    .header("anthropic-version", "2023-06-01")
                    .header("Content-Type", "application/json")
                    .body(requestJson)
                    .retrieve()
                    .body(String.class);

            Map<String, Object> response = objectMapper.readValue(responseBody, new TypeReference<>() {});

            @SuppressWarnings("unchecked")
            Map<String, Object> usage = (Map<String, Object>) response.get("usage");
            if (usage != null) {
                // input_tokens excludes cached tokens; cache reads/writes are reported separately.
                log.debug("Token usage for '{}': input={}, cache_read={}, cache_write={}, output={}",
                        article.getTitle(),
                        usage.get("input_tokens"),
                        usage.get("cache_read_input_tokens"),
                        usage.get("cache_creation_input_tokens"),
                        usage.get("output_tokens"));
            }

            String stopReason = (String) response.get("stop_reason");
            if ("refusal".equals(stopReason) || "max_tokens".equals(stopReason)) {
                log.warn("Claude stopped with '{}' for article: {}", stopReason, article.getTitle());
                return null;
            }

            String text = extractText(response);
            if (text == null || text.isBlank()) {
                log.warn("Empty response from Claude API for article: {}", article.getTitle());
                return null;
            }

            text = text.trim();
            if (text.startsWith("```json")) {
                text = text.substring(7);
            } else if (text.startsWith("```")) {
                text = text.substring(3);
            }
            if (text.endsWith("```")) {
                text = text.substring(0, text.length() - 3);
            }
            text = text.trim();

            Map<String, Object> resultMap = objectMapper.readValue(text, new TypeReference<>() {});

            String summary = (String) resultMap.get("summary");
            @SuppressWarnings("unchecked")
            List<String> tags = (List<String>) resultMap.get("tags");
            String category = (String) resultMap.get("category");
            String sentiment = (String) resultMap.get("sentiment");

            return new AiProcessingResult(summary, tags, category, sentiment);

        } catch (Exception e) {
            log.error("Error processing article '{}' with Claude API: {}", article.getTitle(), e.getMessage());
            return null;
        }
    }

    public void processUnprocessedArticles() {
        if (apiKey == null || apiKey.isBlank()) {
            log.info("Claude API key not configured. Skipping AI processing.");
            return;
        }

        if (!processing.compareAndSet(false, true)) {
            log.info("AI processing already running. Skipping.");
            return;
        }

        try {
            List<Article> unprocessed = articleRepository.findByProcessedFalse();
            if (unprocessed.isEmpty()) {
                log.info("No unprocessed articles to process.");
                return;
            }

            log.info("Processing {} unprocessed articles with AI...", unprocessed.size());

            // Load recent processed articles for title dedup
            List<Article> recentProcessed = articleRepository.findRecentProcessed(
                    LocalDateTime.now().minusHours(72));
            int skipped = 0;

            for (Article article : unprocessed) {
                // Re-fetch from DB to check if another thread already processed it
                Article fresh = articleRepository.findById(article.getId()).orElse(null);
                if (fresh == null || fresh.isProcessed()) continue;

                // Pre-API title dedup: skip API call if a very similar title was already processed
                Article titleMatch = findTitleMatch(fresh.getTitle(), recentProcessed);
                if (titleMatch != null) {
                    fresh.setCategory(titleMatch.getCategory());
                    fresh.setSentiment(titleMatch.getSentiment());
                    fresh.setDuplicateOfId(titleMatch.getId());
                    fresh.setProcessed(true);
                    articleRepository.save(fresh);
                    skipped++;
                    log.info("Skipped API call — title similar to '{}': {}", titleMatch.getTitle(), fresh.getTitle());
                    continue;
                }

                try {
                    AiProcessingResult result = processArticle(fresh);
                    if (result != null) {
                        fresh.setSummary(result.summary());
                        fresh.setTagList(result.tags());
                        fresh.setCategory(result.category());
                        fresh.setSentiment(result.sentiment());
                        fresh.setProcessed(true);
                        articleRepository.save(fresh);
                        recentProcessed.add(fresh);
                        duplicateDetectionService.detectDuplicates(fresh);
                        log.info("Processed article: {}", fresh.getTitle());
                    }

                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    log.warn("AI processing interrupted.");
                    break;
                } catch (Exception e) {
                    log.error("Error processing article '{}': {}", article.getTitle(), e.getMessage());
                }
            }

            log.info("AI processing complete. {} articles skipped via title dedup.", skipped);
        } finally {
            processing.set(false);
        }
    }

    /**
     * Request body for the Messages API. Haiku 5.5 thinks adaptively by default (effort
     * default medium) - this task is simple, so effort is pinned to low. No sampling
     * parameters and no prefill: both return 400 on Haiku 5.5. The system prompt keeps a
     * cache_control breakpoint; it only takes effect once the prefix reaches the model's
     * minimum (512 tokens on Haiku 5.5) - below that the API silently skips caching.
     */
    static Map<String, Object> buildRequestBody(String model, int maxTokens, String userMessage) {
        return Map.of(
                "model", model,
                "max_tokens", maxTokens,
                "output_config", Map.of("effort", "low"),
                "system", List.of(
                        Map.of("type", "text", "text", SYSTEM_PROMPT,
                                "cache_control", Map.of("type", "ephemeral"))
                ),
                "messages", List.of(
                        Map.of("role", "user", "content", userMessage)
                )
        );
    }

    /**
     * Concatenate all "text" blocks. With thinking on, the response can start with
     * "thinking" blocks (empty text by default), so the first block is not the answer.
     */
    @SuppressWarnings("unchecked")
    static String extractText(Map<String, Object> response) {
        List<Map<String, Object>> content = (List<Map<String, Object>>) response.get("content");
        if (content == null) return null;
        StringBuilder sb = new StringBuilder();
        for (Map<String, Object> block : content) {
            if ("text".equals(block.get("type")) && block.get("text") instanceof String t) {
                sb.append(t);
            }
        }
        return sb.isEmpty() ? null : sb.toString();
    }

    /**
     * Strip HTML, URLs, boilerplate and normalize whitespace from raw content.
     */
    static String stripContent(String raw) {
        return raw
                .replaceAll("<[^>]*>", " ")                           // HTML tags
                .replaceAll("&[a-zA-Z#0-9]+;", " ")                  // HTML entities
                .replaceAll("https?://\\S+", "")                      // URLs
                .replaceAll("(?i)(read more|continue reading|weiterlesen|mehr erfahren)\\W*$", "")
                .replaceAll("\\s+", " ")
                .trim();
    }

    /**
     * Find a recently processed article with a very similar title (trigram Jaccard >= 0.5).
     */
    private Article findTitleMatch(String title, List<Article> candidates) {
        Set<String> trigrams = trigrams(normalizeTitle(title));
        if (trigrams.size() < 3) return null;

        for (Article candidate : candidates) {
            if (candidate.getSummary() == null) continue;
            Set<String> candidateTrigrams = trigrams(normalizeTitle(candidate.getTitle()));
            if (jaccardSimilarity(trigrams, candidateTrigrams) >= 0.5) {
                return candidate;
            }
        }
        return null;
    }

    private static String normalizeTitle(String title) {
        return title.toLowerCase().replaceAll("[^a-z0-9äöüß ]", "").trim();
    }

    private static Set<String> trigrams(String text) {
        Set<String> result = new HashSet<>();
        for (int i = 0; i <= text.length() - 3; i++) {
            result.add(text.substring(i, i + 3));
        }
        return result;
    }

    private static double jaccardSimilarity(Set<String> a, Set<String> b) {
        if (a.isEmpty() && b.isEmpty()) return 0;
        Set<String> intersection = new HashSet<>(a);
        intersection.retainAll(b);
        Set<String> union = new HashSet<>(a);
        union.addAll(b);
        return union.isEmpty() ? 0 : (double) intersection.size() / union.size();
    }
}
