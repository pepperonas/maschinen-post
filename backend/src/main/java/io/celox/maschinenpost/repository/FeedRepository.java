package io.celox.maschinenpost.repository;

import io.celox.maschinenpost.model.Feed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedRepository extends JpaRepository<Feed, Long> {

    List<Feed> findByActiveTrue();

    boolean existsByUrl(String url);
}
