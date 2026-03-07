package io.celox.maschinenpost.controller;

import io.celox.maschinenpost.model.dto.ArticleResponse;
import io.celox.maschinenpost.service.ArticleService;
import io.celox.maschinenpost.service.DigestService;
import io.celox.maschinenpost.service.TrendingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
public class ArticleController {

    private final ArticleService articleService;
    private final TrendingService trendingService;
    private final DigestService digestService;

    @GetMapping
    public Page<ArticleResponse> getArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "latest") String sort,
            @RequestParam(required = false) String language) {
        int safeSize = Math.min(Math.max(size, 1), 100);
        return articleService.getArticles(page, safeSize, category, search, sort, language);
    }

    @GetMapping("/{id}")
    public ArticleResponse getArticle(@PathVariable Long id) {
        return articleService.getArticle(id);
    }

    @GetMapping("/trending")
    public List<Map<String, Object>> getTrending(@RequestParam(defaultValue = "48") int hours) {
        int safeHours = Math.min(Math.max(hours, 1), 168);
        return trendingService.getTrending(safeHours);
    }

    @GetMapping("/digest")
    public Map<String, Object> getDigest(@RequestParam(defaultValue = "daily") String period) {
        return digestService.getDigest(period);
    }
}
