package io.celox.maschinenpost.model;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "articles", indexes = {
    @Index(name = "idx_article_category", columnList = "category"),
    @Index(name = "idx_article_published_at", columnList = "publishedAt"),
    @Index(name = "idx_article_processed", columnList = "processed"),
    @Index(name = "idx_article_created_at", columnList = "createdAt")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Article {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, unique = true)
    private String url;

    @Column(nullable = false, unique = true)
    private String urlHash;

    private String source;

    @Builder.Default
    private String language = "en";

    private LocalDateTime publishedAt;

    @Column(columnDefinition = "TEXT")
    private String rawContent;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(columnDefinition = "TEXT")
    private String tags;

    private String category;

    private String sentiment;

    private Long duplicateOfId;

    @Builder.Default
    private boolean processed = false;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public List<String> getTagList() {
        if (tags == null || tags.isBlank()) {
            return new ArrayList<>();
        }
        try {
            return MAPPER.readValue(tags, new TypeReference<List<String>>() {});
        } catch (JsonProcessingException e) {
            return new ArrayList<>();
        }
    }

    public void setTagList(List<String> tagList) {
        if (tagList == null || tagList.isEmpty()) {
            this.tags = "[]";
            return;
        }
        try {
            this.tags = MAPPER.writeValueAsString(tagList);
        } catch (JsonProcessingException e) {
            this.tags = "[]";
        }
    }
}
