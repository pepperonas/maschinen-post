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
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
@Slf4j
@RequiredArgsConstructor
public class AiSummaryService {

    private final ArticleRepository articleRepository;
    private final ObjectMapper objectMapper;
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
            Du bist ein KI-Redakteur für MaschinenPost, ein deutschsprachiges Tech-Nachrichtenportal. \
            Fasse den Artikel in 2-3 prägnanten deutschen Sätzen zusammen. \
            Extrahiere 3-5 relevante Tags. \
            Klassifiziere in GENAU EINE Kategorie: [KI-Modelle, Robotik, Regulierung, Startups, Forschung, Hardware, Tools]. \
            Hinweise zur Kategorisierung: \
            - Robotik: Roboter, Drohnen, Automatisierung, autonome Fahrzeuge, physische KI-Systeme, Sensoren, Aktuatoren, Boston Dynamics, humanoide Roboter \
            - Hardware: Chips, GPUs, TPUs, Rechenzentren, Quantencomputer, Geräte \
            - Regulierung: Gesetze, Vorschriften, Ethik, Datenschutz, Sicherheitspolitik, EU AI Act \
            - Startups: Finanzierung, Fundraising, Gründungen, Series A/B/C, Übernahmen \
            - Forschung: Wissenschaftliche Paper, Durchbrüche, Benchmarks, akademische Arbeiten \
            - Tools: Software-Tools, APIs, Frameworks, Entwicklerprodukte, Plattformen \
            - KI-Modelle: LLMs, Foundation Models, GPT, Claude, Gemini, Training, Fine-Tuning (nur wenn keine andere Kategorie besser passt) \
            Gib Sentiment zurück: [positiv, neutral, kritisch]. \
            Antwort als JSON: {"summary": "...", "tags": ["..."], "category": "...", "sentiment": "..."}""";

    @PostConstruct
    public void init() {
        this.restClient = RestClient.builder()
                .baseUrl(CLAUDE_API_URL)
                .build();
    }

    public AiProcessingResult processArticle(Article article) {
        if (apiKey == null || apiKey.isBlank()) {
            return null;
        }

        try {
            String rawContent = article.getRawContent() != null ? article.getRawContent() : "";
            // Truncate content aggressively to save tokens
            if (rawContent.length() > 2000) {
                rawContent = rawContent.substring(0, 2000) + "...";
            }

            String userMessage = "Titel: " + article.getTitle() + "\n\n" + rawContent;

            Map<String, Object> requestBody = Map.of(
                    "model", model,
                    "max_tokens", maxTokens,
                    "system", SYSTEM_PROMPT,
                    "messages", List.of(
                            Map.of("role", "user", "content", userMessage)
                    )
            );

            String requestJson = objectMapper.writeValueAsString(requestBody);

            String responseBody = restClient.post()
                    .header("x-api-key", apiKey)
                    .header("anthropic-version", "2023-06-01")
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
