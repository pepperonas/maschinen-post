# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run Commands

### Backend (Spring Boot)
```bash
cd backend
mvn compile                              # compile only
mvn spring-boot:run                      # run locally (SQLite, no AI summaries)
CLAUDE_API_KEY=sk-ant-... mvn spring-boot:run  # run with AI summaries
mvn test                                 # run all unit tests
mvn test -Dtest=FeedServiceTest          # run single test class
mvn package -DskipTests                  # build JAR
```

### Frontend (React)
```bash
cd frontend
npm install                              # install dependencies
npm run dev                              # dev server on :5173 (proxies /api -> :8080)
npm run build                            # typecheck + production build
npx tsc --noEmit                         # typecheck only
npm test                                 # run Vitest tests (14 tests)
```

### Deployment & CI
```bash
bash scripts/deploy.sh                   # build + deploy to VPS (celox)
```
The deploy script builds frontend + backend JAR, rsyncs to VPS, restarts systemd, and verifies. JAR is resolved by Maven version (`mvn help:evaluate`).

GitHub Actions CI runs on push/PR to `main`: `mvn test` (Java 17) + `npm run build` (Node 18).

## Architecture

Monorepo: Spring Boot backend + React frontend. Aggregates 10 RSS feeds (7 EN + 3 DE), processes articles through Claude Haiku for German summarization/tagging/categorization, serves via REST API.

**Production:** `https://maschinenpost.celox.io` — VPS at 69.62.121.168 (SSH alias: `celox`), PostgreSQL 16, backend on port 3010, Nginx reverse proxy with SSL.

### Backend (`backend/` — Spring Boot 3.2.5, Java 17)

**Data flow:** `FeedScheduler` (every 12h + on startup) -> `FeedService.fetchAllFeeds()` -> `AiSummaryService.processUnprocessedArticles()`

- **Entities:** `Article` (SHA-256 `urlHash` dedup, tags as JSON string, `language` field, `duplicateOfId`), `Feed` (`language` field, default "en", `failCount`, `lastError`, `disabledAt` for health tracking)
- **Services:**
  - `FeedService` — Rome 2.1.0 RSS parsing, URL dedup, seeds 10 default feeds via `@PostConstruct`, propagates `feed.language` to articles. Tracks feed errors with auto-disable after 5 consecutive failures.
  - `AiSummaryService` — Claude API via `RestClient` with prompt caching. Strips HTML/URLs/boilerplate, truncates to 600 chars, returns German summary + tags + category + sentiment as JSON. Pre-API title dedup via trigram Jaccard (>=0.5) skips API calls for similar titles. No-ops when `CLAUDE_API_KEY` is unset. Runs `DuplicateDetectionService` after processing each article. Logs token usage per article at DEBUG level.
  - `ArticleService` — paginated queries with category/search filtering, stats aggregation, stats history (per-source/sentiment breakdown)
  - `TrendingService` — Clusters recent articles by category + tag Jaccard similarity (>=0.25), returns top 10 trending topics
  - `DigestService` — Daily/weekly digest: top 3 articles per category, sorted by sentiment
  - `DuplicateDetectionService` — Tag Jaccard (>=0.4) + trigram text similarity (>=0.3) to detect and mark duplicate articles within 48h
- **Schedulers:**
  - `FeedScheduler` — Every 12h + on startup, protected by AtomicBoolean guard
  - `CleanupScheduler` — Daily at 3 AM, deletes articles older than `maschinenpost.retention.days` (default 90)
- **Health:** `FeedHealthIndicator` — Actuator health check, DOWN if >50% feeds stale (>24h) or failing (>=3 errors)
- **DTOs:** Records in `model/dto/` — `ArticleResponse` includes `rawContent` (HTML-stripped, truncated to 300 chars) as fallback when no AI summary
- **Config:**
  - `application.yml` — SQLite for local dev (`maschinenpost.db`), 12h fetch rate, max 256 output tokens, Actuator health/info endpoints
  - `application-prod.yml` — PostgreSQL on `127.0.0.1:5432/maschinenpost`, port 3010, DB credentials via env vars, Actuator details hidden
- **CORS:** Restricted to `maschinenpost.celox.io` + `localhost:5173` in `WebConfig`
- **Caching:** `CompositeCacheManager` in `CacheConfig.java` — stats cache at 30s TTL (polled from frontend), rssFeed + digest caches at 15min TTL.
- **Rate limiting:** `POST /api/refresh` limited to 1 call per 10min per IP (in-memory `ConcurrentHashMap`)

### Frontend (`frontend/` — React 18, TypeScript 5.5, Vite 5, Tailwind 3.4)

**State flows through `App.tsx`** — category/search state with hooks + props, no state library.

- **Routing:** Hash-based via `useHashRoute` hook. Pages: `#/impressum`, `#/datenschutz`, `#/agb`, `#/digest`, `#/stats`, `#/sources`, `#/article/:id`. Scrolls to top on hash change.
- **Hooks:** `useArticles` (paginated fetch with language filter, infinite scroll, page size 21 for 3-col grid), `useStats` (30s polling, new article detection), `useTheme` (dark/light in localStorage), `useBookmarks` (localStorage bookmark set), `useReadHistory` (localStorage read tracking, max 500), `useKeyboardNav` (j/k/Enter/o/b/s/Escape/1-8), `useSwipe` (pointer events swipe detection)
- **API client:** `api/client.ts` — plain `fetch` wrapper. Functions: `fetchArticles`, `fetchStats`, `fetchStatsHistory`, `fetchTrending`, `fetchDigest`, `reactivateFeed`. Vite proxy handles `/api/*` -> `:8080` in dev.
- **Design system:** Industrial/brutalist dark theme. Colors under `machine.*` in `tailwind.config.js`. Custom CSS (`industrial-bg`, `glow-border`, `skeleton-shimmer`, `card-hover`, `keyboard-focus`) in `index.css`. Fonts: IBM Plex Mono (headlines) + DM Sans (body).
- **Categories:** Fixed list in `api/types.ts` — `KI-Modelle, Robotik, Regulierung, Startups, Forschung, Hardware, Tools`. Plus special tabs: `Trending`, `Gespeichert` (bookmarks). Language toggle (Alle/DE/EN) in `CategoryFilter`, persisted in localStorage.
- **Infinite scroll:** `ArticleGrid` uses `IntersectionObserver` (200px rootMargin) to auto-load next page.
- **Pages:** `Digest` (daily/weekly magazine layout), `Stats` (bar charts, sentiment, source breakdown), `Sources` (feed health with green/yellow/red indicators + reactivate)
- **Components:** `ArticleDetailModal` (full article view with nav + bookmark + related), `ErrorBoundary` (React class component with retry), `TrendingView` (trending topic clusters), `AboutModal` (app details + keyboard shortcuts)
- **PWA:** `vite-plugin-pwa` with Workbox `generateSW`. Precaches all static assets (22 files). Runtime caching: Google Fonts (CacheFirst, 1yr), API (NetworkFirst, 5min fallback). `registerType: 'autoUpdate'`. Manifest generated as `manifest.webmanifest`. PNG icons at 192/512px + SVG. Nginx serves `sw.js`/`manifest.webmanifest` with `no-cache` headers.
- **Embed:** `public/embed.js` — embeddable widget using safe DOM methods (no innerHTML)
- **Testing:** Vitest + Testing Library (14 tests for useBookmarks, useReadHistory, useTheme)

### API Contract

All endpoints under `/api/`. Backend returns Spring `Page<T>` JSON for paginated endpoints.

| Endpoint | Notes |
|---|---|
| `GET /api/articles` | Query params: `page`, `size`, `category`, `search`, `sort`, `language` (`de`/`en`) |
| `GET /api/articles/{id}` | |
| `GET /api/articles/trending` | Query param: `hours` (default 48). Returns trending topic clusters |
| `GET /api/articles/digest` | Query param: `period` (`daily`/`weekly`). Returns digest sections |
| `GET /api/feeds` | |
| `POST /api/feeds` | Body: `{ name, url }` |
| `POST /api/feeds/{id}/reactivate` | Resets failCount and re-enables disabled feed |
| `GET /api/stats` | Returns total counts + articlesPerCategory map |
| `GET /api/stats/history` | Query param: `days` (default 30). Source/sentiment breakdown |
| `POST /api/refresh` | Rate-limited (10min/IP). Async background refresh |
| `GET /api/feed.xml` | RSS 2.0 output feed of last 50 articles (cached 15min) |
| `GET /actuator/health` | Spring Boot Actuator health endpoint (feed staleness check) |

### Production Infrastructure

| Component | Detail |
|---|---|
| VPS | 69.62.121.168, SSH alias `celox` |
| App directory | `/root/apps/maschinenpost/{backend,frontend}` |
| Environment | `/root/apps/maschinenpost/.env` (DB creds, CLAUDE_API_KEY, SPRING_PROFILES_ACTIVE=prod) |
| systemd | `maschinenpost.service` — Java -Xmx512m, Restart=always |
| Nginx | `/etc/nginx/sites-available/maschinenpost.celox.io` — `/` static SPA, `/api/` -> :3010 |
| SSL | Let's Encrypt via certbot |
| Logrotate | `/etc/logrotate.d/maschinenpost` — daily, 7 days |

## Tests

### Backend (43 tests, JUnit 5 + Mockito)

| Class | Tests | Covers |
|---|---|---|
| `ArticleTest` | 8 | Tag JSON serialization, Builder defaults |
| `ArticleResponseTest` | 6 | DTO mapping, HTML stripping, truncation |
| `FeedServiceTest` | 6 | Feed seeding (10 feeds), SHA-256 hashes |
| `ArticleServiceTest` | 11 | Sorting, category/search routing, stats, 404 |
| `AiSummaryServiceTest` | 7 | API-key check, AtomicBoolean guard, lock release, DuplicateDetection mock |
| `FeedSchedulerTest` | 5 | Concurrency guard, partial-failure recovery, lock release |

All tests use mocks — no Spring context or DB needed. Run in <1s.

### Frontend (14 tests, Vitest + Testing Library)

| File | Tests | Covers |
|---|---|---|
| `useBookmarks.test.ts` | 5 | Toggle on/off, localStorage persistence/restore |
| `useReadHistory.test.ts` | 5 | Mark read, no duplicates, localStorage persistence/restore |
| `useTheme.test.ts` | 4 | Default dark, toggle, localStorage persistence/restore |

Config: `vitest.config.ts` (separate from vite.config.ts for Vitest 4.x). Run with `npm test`.

## Concurrency Safety (CRITICAL)

All feed-fetching and AI-processing paths MUST go through `FeedScheduler.runFetchCycle()`. This method is protected by an `AtomicBoolean` guard that ensures only one fetch cycle runs at a time. **Never call `FeedService.fetchAllFeeds()` or `AiSummaryService.processUnprocessedArticles()` directly from new code paths** — always route through `FeedScheduler`.

Current call paths (all protected):
- `@Scheduled` (every 12h with 60s initial delay) -> `FeedScheduler.runFetchCycle("Scheduled")`
- `@EventListener(ApplicationReadyEvent)` -> `FeedScheduler.runFetchCycle("Initial")`
- `POST /api/refresh` -> `StatsController` -> `FeedScheduler.runFetchCycle("Manual")`

Additional safeguards:
- `AiSummaryService.processUnprocessedArticles()` has its own `AtomicBoolean` lock as a second barrier
- Each article is re-fetched from DB (`findById`) before Claude API call to verify it hasn't been processed by another thread
- 1000ms delay between API calls to prevent burst billing
- Article content HTML-stripped (tags, entities, URLs, boilerplate) and truncated to 600 chars to minimize input tokens
- Pre-API title dedup: trigram Jaccard (>=0.5) against recently processed articles skips API calls entirely

**Why:** A race condition between unguarded threads caused ~$5 in duplicate Claude API charges.

## AI Token Optimization

The Claude API integration is cost-optimized:
- **Model:** Haiku 4.5 (`claude-haiku-4-5-20251001`) — do NOT switch to Sonnet/Opus without explicit approval (5-50x cost difference)
- **Input:** rawContent HTML-stripped (tags, entities, URLs, boilerplate), truncated to 600 chars, compact system prompt (~80 tokens)
- **Output:** max 256 tokens (JSON response is typically ~150-200 tokens)
- **Prompt caching:** Enabled via `anthropic-beta: prompt-caching-2024-07-31` header + `cache_control: ephemeral` on system message. System prompt cached after first call (90% cheaper for subsequent calls in same batch).
- **Title dedup:** Before API call, trigram Jaccard similarity (>=0.5) against recently processed articles. Skips API entirely for similar titles, marks as duplicate.
- **Fetch rate:** 12h intervals to reduce total API calls

## Key Conventions

- **Language:** All UI text is in German. AI summaries, categories, sentiment values are German.
- **Feed languages:** 7 English feeds + 3 German feeds. Language stored on both `Feed` and `Article` entities.
- **Deduplication:** URL-level via SHA-256 hash (`urlHash` column, UNIQUE). Content-level via `DuplicateDetectionService` (tag Jaccard + trigram similarity), marks `duplicateOfId`.
- **AI processing is optional:** Backend runs fine without `CLAUDE_API_KEY` — articles just lack summaries/tags/categories. Frontend shows `rawContent` excerpt as fallback.
- **Database:** SQLite in dev (`maschinenpost.db`), PostgreSQL in prod. Hibernate `ddl-auto: update` in both.
- **Sorting:** Default sort is by `publishedAt` DESC (not `createdAt`).
- **Lombok:** Backend uses `@Data`, `@Builder`, `@RequiredArgsConstructor`, `@Slf4j` throughout.
- **Environment:** API key via `.env` file (gitignored) or `CLAUDE_API_KEY` env var.
- **Light mode theming:** `text-machine-accent` (#FFE000 yellow) is unreadable on light backgrounds. Always use `dark:text-machine-accent text-yellow-700` (or `text-gray-900` for primary elements). Same pattern for `hover:`, `bg-`, and `border-` variants. Source badges use `-700`/`-100` pairs (e.g. `dark:text-blue-400 text-blue-700`).
- **Page size:** Frontend uses 21 (divisible by 3 columns) for clean grid layout. Backend clamps size to [1, 100].
- **DB indexes:** `Article` has indexes on `category`, `publishedAt`, `processed`, `createdAt`. Hibernate `ddl-auto: update` creates them automatically.
- **Response compression:** Gzip enabled for JSON responses > 1KB (both dev and prod).
- **Batch inserts:** Hibernate `batch_size: 50` + `order_inserts: true`. `FeedService.fetchFeed()` uses `saveAll()`.
- **Mobile:** Bottom-sheet modals (`items-end sm:items-center`, `rounded-t-xl sm:rounded-sm`). Safe-area insets via `viewport-fit=cover` + `env(safe-area-inset-*)`. Touch targets use `p-2.5 sm:p-1.5` pattern (44px+ on mobile, compact on desktop). Hover effects wrapped in `@media (hover: hover)` to prevent sticky states on touch. Header responsive tracking/font-size (`text-xl sm:text-2xl`). Cards `overflow-hidden` + `p-4 sm:p-5`. Global `overflow-x: hidden` + `-webkit-text-size-adjust: 100%`. Swipe via `useSwipe` hook. Legal/Digest/Stats/Sources lazy-loaded via `React.lazy()`.
- **Keyboard shortcuts:** `j`/`k` (nav), `Enter`/`o` (open), `b` (bookmark), `s`/`/` (search), `Escape` (close/blur), `1-8` (category tabs). Visual focus ring via `.keyboard-focus` CSS class.
- **Feed health:** Auto-disable after 5 consecutive failures. Reactivate via `POST /api/feeds/{id}/reactivate` or Sources page UI. `failCount`, `lastError`, `disabledAt` tracked on `Feed` entity.
- **Article retention:** Configurable via `maschinenpost.retention.days` (default 90). `CleanupScheduler` runs daily at 3 AM.
