package io.celox.maschinenpost.repository;

import io.celox.maschinenpost.model.Article;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {

    boolean existsByUrlHash(String urlHash);

    Page<Article> findByCategory(String category, Pageable pageable);

    @Query("SELECT a FROM Article a WHERE LOWER(a.title) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(a.summary) LIKE LOWER(CONCAT('%',:q,'%'))")
    Page<Article> search(@Param("q") String query, Pageable pageable);

    @Query("SELECT a FROM Article a WHERE a.category = :category AND (LOWER(a.title) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(a.summary) LIKE LOWER(CONCAT('%',:q,'%')))")
    Page<Article> searchByCategory(@Param("q") String query, @Param("category") String category, Pageable pageable);

    List<Article> findByProcessedFalse();

    @Query("SELECT a.category, COUNT(a) FROM Article a WHERE a.category IS NOT NULL GROUP BY a.category")
    List<Object[]> countByCategory();

    Optional<Article> findTopByOrderByCreatedAtDesc();

    long countByProcessedTrue();
}
