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
import java.util.List;
import java.util.Map;
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

    @Value("${maschinenpost.claude.model:claude-haiku-4-5-20251001}")
    private String model;

    @Value("${maschinenpost.claude.max-tokens:512}")
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
            // Strip HTML tags and entities to save tokens
            rawContent = rawContent.replaceAll("<[^>]*>", " ").replaceAll("&[a-zA-Z]+;", " ").replaceAll("\\s+", " ").trim();
            if (rawContent.length() > 1000) {
                rawContent = rawContent.substring(0, 1000);
            }

            String userMessage = article.getTitle() + "\n" + rawContent;

            Map<String, Object> requestBody = Map.of(
                    "model", model,
                    "max_tokens", maxTokens,
                    "system", List.of(
                            Map.of("type", "text", "text", SYSTEM_PROMPT,
                                    "cache_control", Map.of("type", "ephemeral"))
                    ),
                    "messages", List.of(
                            Map.of("role", "user", "content", userMessage)
                    )
            );

            String requestJson = objectMapper.writeValueAsString(requestBody);

            String responseBody = restClient.post()
                    .header("x-api-key", apiKey)
                    .header("anthropic-version", "2023-06-01")
                    .header("anthropic-beta", "prompt-caching-2024-07-31")
                    .header("Content-Type", "application/json")
                    .body(requestJson)
                    .retrieve()
                    .body(String.class);

            Map<String, Object> response = objectMapper.readValue(responseBody, new TypeReference<>() {});

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> content = (List<Map<String, Object>>) response.get("content");
            if (content == null || content.isEmpty()) {
                log.warn("Empty response from Claude API for article: {}", article.getTitle());
                return null;
            }

            String text = (String) content.get(0).get("text");

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

            for (Article article : unprocessed) {
                // Re-fetch from DB to check if another thread already processed it
                Article fresh = articleRepository.findById(article.getId()).orElse(null);
                if (fresh == null || fresh.isProcessed()) continue;

                try {
                    AiProcessingResult result = processArticle(fresh);
                    if (result != null) {
                        fresh.setSummary(result.summary());
                        fresh.setTagList(result.tags());
                        fresh.setCategory(result.category());
                        fresh.setSentiment(result.sentiment());
                        fresh.setProcessed(true);
                        articleRepository.save(fresh);
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

            log.info("AI processing complete.");
        } finally {
            processing.set(false);
        }
    }
}
