package io.celox.maschinenpost.repository;

import io.celox.maschinenpost.model.Article;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {

    boolean existsByUrlHash(String urlHash);

    Page<Article> findByCategory(String category, Pageable pageable);

    Page<Article> findByLanguage(String language, Pageable pageable);

    Page<Article> findByCategoryAndLanguage(String category, String language, Pageable pageable);

    @Query("SELECT a FROM Article a WHERE LOWER(a.title) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(a.summary) LIKE LOWER(CONCAT('%',:q,'%'))")
    Page<Article> search(@Param("q") String query, Pageable pageable);

    @Query("SELECT a FROM Article a WHERE a.language = :lang AND (LOWER(a.title) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(a.summary) LIKE LOWER(CONCAT('%',:q,'%')))")
    Page<Article> searchByLanguage(@Param("q") String query, @Param("lang") String language, Pageable pageable);

    @Query("SELECT a FROM Article a WHERE a.category = :category AND (LOWER(a.title) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(a.summary) LIKE LOWER(CONCAT('%',:q,'%')))")
    Page<Article> searchByCategory(@Param("q") String query, @Param("category") String category, Pageable pageable);

    @Query("SELECT a FROM Article a WHERE a.category = :category AND a.language = :lang AND (LOWER(a.title) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(a.summary) LIKE LOWER(CONCAT('%',:q,'%')))")
    Page<Article> searchByCategoryAndLanguage(@Param("q") String query, @Param("category") String category, @Param("lang") String language, Pageable pageable);

    List<Article> findByProcessedFalse();

    @Query("SELECT a.category, COUNT(a) FROM Article a WHERE a.category IS NOT NULL GROUP BY a.category")
    List<Object[]> countByCategory();

    Optional<Article> findTopByOrderByCreatedAtDesc();

    long countByProcessedTrue();

    @Modifying
    @Transactional
    @Query("DELETE FROM Article a WHERE a.createdAt < :cutoff")
    int deleteByCreatedAtBefore(@Param("cutoff") LocalDateTime cutoff);

    @Query("SELECT a FROM Article a WHERE a.processed = true AND a.publishedAt > :since ORDER BY a.publishedAt DESC")
    List<Article> findRecentProcessed(@Param("since") LocalDateTime since);

    @Query("SELECT a.category, COUNT(a), CAST(a.publishedAt AS date) as day FROM Article a WHERE a.publishedAt > :since AND a.category IS NOT NULL GROUP BY a.category, CAST(a.publishedAt AS date) ORDER BY day DESC")
    List<Object[]> countByCategoryAndDay(@Param("since") LocalDateTime since);

    @Query("SELECT a.source, COUNT(a) FROM Article a WHERE a.publishedAt > :since GROUP BY a.source ORDER BY COUNT(a) DESC")
    List<Object[]> countBySource(@Param("since") LocalDateTime since);

    @Query("SELECT a.sentiment, COUNT(a) FROM Article a WHERE a.sentiment IS NOT NULL AND a.publishedAt > :since GROUP BY a.sentiment")
    List<Object[]> countBySentiment(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(a) FROM Article a WHERE a.publishedAt > :since")
    long countSince(@Param("since") LocalDateTime since);

    List<Article> findByDuplicateOfIdIsNull();

    @Query("SELECT a FROM Article a WHERE a.category = :category AND a.publishedAt > :since AND a.processed = true AND a.duplicateOfId IS NULL ORDER BY a.publishedAt DESC")
    List<Article> findByCategoryAndRecent(@Param("category") String category, @Param("since") LocalDateTime since);
}
