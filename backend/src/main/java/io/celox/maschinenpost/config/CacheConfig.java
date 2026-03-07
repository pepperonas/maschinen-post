package io.celox.maschinenpost.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.cache.support.CompositeCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        // Stats cache: 30s TTL (polled every 30s from frontend)
        CaffeineCacheManager statsCacheManager = new CaffeineCacheManager("stats");
        statsCacheManager.setCaffeine(Caffeine.newBuilder()
                .expireAfterWrite(30, TimeUnit.SECONDS)
                .maximumSize(5));

        // Content caches: 15min TTL (RSS feed, digest)
        CaffeineCacheManager contentCacheManager = new CaffeineCacheManager("rssFeed", "digest");
        contentCacheManager.setCaffeine(Caffeine.newBuilder()
                .expireAfterWrite(15, TimeUnit.MINUTES)
                .maximumSize(10));

        CompositeCacheManager composite = new CompositeCacheManager(statsCacheManager, contentCacheManager);
        composite.setFallbackToNoOpCache(false);
        return composite;
    }
}
