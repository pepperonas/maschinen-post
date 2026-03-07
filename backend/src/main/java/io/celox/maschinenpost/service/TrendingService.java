package io.celox.maschinenpost.service;

import io.celox.maschinenpost.model.Article;
import io.celox.maschinenpost.model.dto.ArticleResponse;
import io.celox.maschinenpost.repository.ArticleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrendingService {

    private final ArticleRepository articleRepository;

    public List<Map<String, Object>> getTrending(int hours) {
        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        List<Article> articles = articleRepository.findRecentProcessed(since);

        // Group by category, then cluster by tag overlap
        Map<String, List<Article>> byCategory = articles.stream()
                .filter(a -> a.getCategory() != null)
                .collect(Collectors.groupingBy(Article::getCategory));

        List<Map<String, Object>> topics = new ArrayList<>();

        for (Map.Entry<String, List<Article>> entry : byCategory.entrySet()) {
            List<Article> catArticles = entry.getValue();
            List<List<Article>> clusters = clusterByTags(catArticles);

            for (List<Article> cluster : clusters) {
                if (cluster.size() < 2) continue; // Only show multi-article topics

                Map<String, Object> topic = new LinkedHashMap<>();
                topic.put("topic", generateTopicTitle(cluster));
                topic.put("category", entry.getKey());
                topic.put("articleCount", cluster.size());
                topic.put("articles", cluster.stream()
                        .sorted(Comparator.comparing(Article::getPublishedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                        .limit(5)
                        .map(ArticleResponse::from)
                        .toList());
                topic.put("latestAt", cluster.stream()
                        .map(Article::getPublishedAt)
                        .filter(Objects::nonNull)
                        .max(Comparator.naturalOrder())
                        .orElse(null));

                topics.add(topic);
            }
        }

        // Also add single-source trending (many articles from one source on one topic)
        topics.sort((a, b) -> {
            int countA = (int) a.get("articleCount");
            int countB = (int) b.get("articleCount");
            return Integer.compare(countB, countA);
        });

        return topics.stream().limit(10).toList();
    }

    private List<List<Article>> clusterByTags(List<Article> articles) {
        List<List<Article>> clusters = new ArrayList<>();
        boolean[] assigned = new boolean[articles.size()];

        for (int i = 0; i < articles.size(); i++) {
            if (assigned[i]) continue;
            List<Article> cluster = new ArrayList<>();
            cluster.add(articles.get(i));
            assigned[i] = true;

            Set<String> clusterTags = new HashSet<>(articles.get(i).getTagList());

            for (int j = i + 1; j < articles.size(); j++) {
                if (assigned[j]) continue;
                Set<String> otherTags = new HashSet<>(articles.get(j).getTagList());
                double similarity = jaccardSimilarity(clusterTags, otherTags);
                if (similarity >= 0.25) {
                    cluster.add(articles.get(j));
                    assigned[j] = true;
                    clusterTags.addAll(otherTags);
                }
            }
            clusters.add(cluster);
        }
        return clusters;
    }

    private double jaccardSimilarity(Set<String> a, Set<String> b) {
        if (a.isEmpty() && b.isEmpty()) return 0;
        Set<String> intersection = new HashSet<>(a);
        intersection.retainAll(b);
        Set<String> union = new HashSet<>(a);
        union.addAll(b);
        return union.isEmpty() ? 0 : (double) intersection.size() / union.size();
    }

    private String generateTopicTitle(List<Article> cluster) {
        // Use the most common tags as topic title
        Map<String, Long> tagFreq = cluster.stream()
                .flatMap(a -> a.getTagList().stream())
                .collect(Collectors.groupingBy(t -> t, Collectors.counting()));

        return tagFreq.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(3)
                .map(Map.Entry::getKey)
                .collect(Collectors.joining(", "));
    }
}
