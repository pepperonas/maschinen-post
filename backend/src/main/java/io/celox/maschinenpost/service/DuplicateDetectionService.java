package io.celox.maschinenpost.service;

import io.celox.maschinenpost.model.Article;
import io.celox.maschinenpost.repository.ArticleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class DuplicateDetectionService {

    private final ArticleRepository articleRepository;

    public void detectDuplicates(Article newArticle) {
        if (newArticle.getSummary() == null || newArticle.getCategory() == null) return;

        LocalDateTime since = LocalDateTime.now().minusHours(48);
        List<Article> candidates = articleRepository.findByCategoryAndRecent(
                newArticle.getCategory(), since);

        String newSummary = normalize(newArticle.getSummary());
        Set<String> newTags = new HashSet<>(newArticle.getTagList());

        for (Article candidate : candidates) {
            if (candidate.getId().equals(newArticle.getId())) continue;
            if (candidate.getDuplicateOfId() != null) continue;

            double tagSimilarity = jaccardSimilarity(newTags, new HashSet<>(candidate.getTagList()));
            double textSimilarity = trigramSimilarity(newSummary, normalize(candidate.getSummary()));

            if (tagSimilarity >= 0.4 && textSimilarity >= 0.3) {
                newArticle.setDuplicateOfId(candidate.getId());
                articleRepository.save(newArticle);
                log.info("Article '{}' marked as duplicate of '{}'", newArticle.getTitle(), candidate.getTitle());
                return;
            }
        }
    }

    private String normalize(String text) {
        if (text == null) return "";
        return text.toLowerCase().replaceAll("[^a-z0-9äöüß ]", "").trim();
    }

    private double jaccardSimilarity(Set<String> a, Set<String> b) {
        if (a.isEmpty() && b.isEmpty()) return 0;
        Set<String> intersection = new HashSet<>(a);
        intersection.retainAll(b);
        Set<String> union = new HashSet<>(a);
        union.addAll(b);
        return union.isEmpty() ? 0 : (double) intersection.size() / union.size();
    }

    private double trigramSimilarity(String a, String b) {
        Set<String> trigramsA = trigrams(a);
        Set<String> trigramsB = trigrams(b);
        return jaccardSimilarity(trigramsA, trigramsB);
    }

    private Set<String> trigrams(String text) {
        Set<String> result = new HashSet<>();
        for (int i = 0; i <= text.length() - 3; i++) {
            result.add(text.substring(i, i + 3));
        }
        return result;
    }
}
