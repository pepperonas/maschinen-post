package io.celox.maschinenpost.service;

import io.celox.maschinenpost.model.Article;
import io.celox.maschinenpost.model.dto.ArticleResponse;
import io.celox.maschinenpost.model.dto.StatsResponse;
import io.celox.maschinenpost.repository.ArticleRepository;
import io.celox.maschinenpost.repository.FeedRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;;

@Service
@RequiredArgsConstructor
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final FeedRepository feedRepository;

    public Page<ArticleResponse> getArticles(int page, int size, String category, String search, String sort, String language) {
        Sort sorting;
        if ("latest".equalsIgnoreCase(sort)) {
            sorting = Sort.by(Sort.Direction.DESC, "createdAt");
        } else {
            sorting = Sort.by(Sort.Direction.DESC, "publishedAt");
        }

        PageRequest pageRequest = PageRequest.of(page, size, sorting);

        Page<Article> articles;
        boolean hasCategory = category != null && !category.isBlank();
        boolean hasSearch = search != null && !search.isBlank();
        boolean hasLanguage = language != null && !language.isBlank();

        if (hasCategory && hasSearch && hasLanguage) {
            articles = articleRepository.searchByCategoryAndLanguage(search, category, language, pageRequest);
        } else if (hasCategory && hasSearch) {
            articles = articleRepository.searchByCategory(search, category, pageRequest);
        } else if (hasCategory && hasLanguage) {
            articles = articleRepository.findByCategoryAndLanguage(category, language, pageRequest);
        } else if (hasSearch && hasLanguage) {
            articles = articleRepository.searchByLanguage(search, language, pageRequest);
        } else if (hasCategory) {
            articles = articleRepository.findByCategory(category, pageRequest);
        } else if (hasSearch) {
            articles = articleRepository.search(search, pageRequest);
        } else if (hasLanguage) {
            articles = articleRepository.findByLanguage(language, pageRequest);
        } else {
            articles = articleRepository.findAll(pageRequest);
        }

        return articles.map(ArticleResponse::from);
    }

    public ArticleResponse getArticle(Long id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Article not found with id: " + id));
        return ArticleResponse.from(article);
    }

    @Cacheable("stats")
    public StatsResponse getStats() {
        long totalArticles = articleRepository.count();
        long processedArticles = articleRepository.countByProcessedTrue();
        long totalFeeds = feedRepository.count();

        Optional<Article> latestArticle = articleRepository.findTopByOrderByCreatedAtDesc();
        String lastUpdate = latestArticle
                .map(a -> a.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                .orElse("N/A");

        Map<String, Long> articlesPerCategory = new LinkedHashMap<>();
        List<Object[]> categoryCounts = articleRepository.countByCategory();
        for (Object[] row : categoryCounts) {
            String cat = (String) row[0];
            Long count = (Long) row[1];
            articlesPerCategory.put(cat, count);
        }

        return new StatsResponse(
                totalArticles,
                processedArticles,
                totalFeeds,
                lastUpdate,
                articlesPerCategory
        );
    }

    public Map<String, Object> getStatsHistory(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        Map<String, Object> result = new LinkedHashMap<>();

        // Articles per source
        Map<String, Long> perSource = new LinkedHashMap<>();
        for (Object[] row : articleRepository.countBySource(since)) {
            perSource.put((String) row[0], (Long) row[1]);
        }
        result.put("articlesPerSource", perSource);

        // Sentiment distribution
        Map<String, Long> sentiments = new LinkedHashMap<>();
        for (Object[] row : articleRepository.countBySentiment(since)) {
            sentiments.put((String) row[0], (Long) row[1]);
        }
        result.put("sentimentDistribution", sentiments);

        // Total in period
        result.put("totalInPeriod", articleRepository.countSince(since));
        result.put("days", days);

        return result;
    }
}
