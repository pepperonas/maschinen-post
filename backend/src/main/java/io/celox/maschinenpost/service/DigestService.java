package io.celox.maschinenpost.service;

import io.celox.maschinenpost.model.Article;
import io.celox.maschinenpost.model.dto.ArticleResponse;
import io.celox.maschinenpost.repository.ArticleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DigestService {

    private final ArticleRepository articleRepository;

    private static final List<String> CATEGORIES = List.of(
            "KI-Modelle", "Robotik", "Regulierung", "Startups", "Forschung", "Hardware", "Tools"
    );

    @Cacheable("digest")
    public Map<String, Object> getDigest(String period) {
        LocalDateTime since = "weekly".equals(period)
                ? LocalDateTime.now().minusDays(7)
                : LocalDateTime.now().minusDays(1);

        List<Article> allArticles = articleRepository.findRecentProcessed(since);

        Map<String, List<ArticleResponse>> sections = new LinkedHashMap<>();

        for (String category : CATEGORIES) {
            List<ArticleResponse> catArticles = allArticles.stream()
                    .filter(a -> category.equals(a.getCategory()))
                    .filter(a -> a.getDuplicateOfId() == null)
                    .sorted(sentimentComparator())
                    .limit(3)
                    .map(ArticleResponse::from)
                    .toList();

            if (!catArticles.isEmpty()) {
                sections.put(category, catArticles);
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("period", period);
        result.put("from", since.toString());
        result.put("to", LocalDateTime.now().toString());
        result.put("totalArticles", allArticles.size());
        result.put("sections", sections);

        return result;
    }

    private Comparator<Article> sentimentComparator() {
        Map<String, Integer> weight = Map.of("positiv", 0, "neutral", 1, "kritisch", 2);
        return Comparator.comparingInt(a -> weight.getOrDefault(a.getSentiment(), 1));
    }
}
