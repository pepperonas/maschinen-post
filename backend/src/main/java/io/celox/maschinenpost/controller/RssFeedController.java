package io.celox.maschinenpost.controller;

import com.rometools.rome.feed.synd.*;
import com.rometools.rome.io.SyndFeedOutput;
import io.celox.maschinenpost.model.Article;
import io.celox.maschinenpost.repository.ArticleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class RssFeedController {

    private final ArticleRepository articleRepository;

    @GetMapping(value = "/api/feed.xml", produces = MediaType.APPLICATION_XML_VALUE)
    @Cacheable("rssFeed")
    public String generateFeed() throws Exception {
        SyndFeed feed = new SyndFeedImpl();
        feed.setFeedType("rss_2.0");
        feed.setTitle("MaschinenPost — KI & Robotik Nachrichten");
        feed.setLink("https://maschinenpost.celox.io");
        feed.setDescription("Deutschsprachiger Echtzeit-Nachrichtenaggregator für Künstliche Intelligenz und Robotik");
        feed.setLanguage("de");

        PageRequest pageRequest = PageRequest.of(0, 50, Sort.by(Sort.Direction.DESC, "publishedAt"));
        List<Article> articles = articleRepository.findAll(pageRequest).getContent();

        List<SyndEntry> entries = new ArrayList<>();
        for (Article article : articles) {
            SyndEntry entry = new SyndEntryImpl();
            entry.setTitle(article.getTitle());
            entry.setLink(article.getUrl());
            entry.setAuthor(article.getSource());

            if (article.getPublishedAt() != null) {
                entry.setPublishedDate(Date.from(article.getPublishedAt()
                        .atZone(ZoneId.systemDefault()).toInstant()));
            }

            SyndContent description = new SyndContentImpl();
            description.setType("text/plain");
            description.setValue(article.getSummary() != null ? article.getSummary() : "");
            entry.setDescription(description);

            if (article.getCategory() != null) {
                SyndCategory cat = new SyndCategoryImpl();
                cat.setName(article.getCategory());
                entry.setCategories(List.of(cat));
            }

            entries.add(entry);
        }

        feed.setEntries(entries);
        return new SyndFeedOutput().outputString(feed);
    }
}
