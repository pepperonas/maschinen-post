package io.celox.maschinenpost.controller;

import io.celox.maschinenpost.model.Feed;
import io.celox.maschinenpost.model.dto.FeedRequest;
import io.celox.maschinenpost.repository.FeedRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/feeds")
@RequiredArgsConstructor
public class FeedController {

    private final FeedRepository feedRepository;

    @GetMapping
    public List<Feed> getFeeds() {
        return feedRepository.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Feed createFeed(@RequestBody @Valid FeedRequest request) {
        if (feedRepository.existsByUrl(request.url())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Feed with this URL already exists");
        }

        Feed feed = Feed.builder()
                .name(request.name())
                .url(request.url())
                .active(true)
                .build();

        return feedRepository.save(feed);
    }
}
