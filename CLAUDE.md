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
```

### Deployment & CI
```bash
bash scripts/deploy.sh                   # build + deploy to VPS (celox)
```
The deploy script builds frontend + backend JAR, rsyncs to VPS, restarts systemd, and verifies. **Watch out:** `ls target/*.jar | head -1` picks the first JAR alphabetically — delete stale JARs from `target/` if builds change version.

GitHub Actions CI runs on push/PR to `main`: `mvn test` (Java 17) + `npm run build` (Node 18).

## Architecture

Monorepo: Spring Boot backend + React frontend. Aggregates 10 RSS feeds (7 EN + 3 DE), processes articles through Claude Haiku for German summarization/tagging/categorization, serves via REST API.

**Production:** `https://maschinenpost.celox.io` — VPS at 69.62.121.168 (SSH alias: `celox`), PostgreSQL 16, backend on port 3010, Nginx reverse proxy with SSL.

### Backend (`backend/` — Spring Boot 3.2.5, Java 17)

**Data flow:** `FeedScheduler` (every 12h + on startup) -> `FeedService.fetchAllFeeds()` -> `AiSummaryService.processUnprocessedArticles()`

- **Entities:** `Article` (SHA-256 `urlHash` dedup, tags as JSON string, `language` field), `Feed` (`language` field, default "en")
- **Services:**
  - `FeedService` — Rome 2.1.0 RSS parsing, URL dedup, seeds 10 default feeds via `@PostConstruct`, propagates `feed.language` to articles
  - `AiSummaryService` — Claude API via `RestClient` with prompt caching. Strips HTML, truncates to 1000 chars, returns German summary + tags + category + sentiment as JSON. No-ops when `CLAUDE_API_KEY` is unset.
  - `ArticleService` — paginated queries with category/search filtering, stats aggregation
- **DTOs:** Records in `model/dto/` — `ArticleResponse` includes `rawContent` (HTML-stripped, truncated to 300 chars) as fallback when no AI summary
- **Config:**
  - `application.yml` — SQLite for local dev (`maschinenpost.db`), 12h fetch rate, max 256 output tokens
  - `application-prod.yml` — PostgreSQL on `127.0.0.1:5432/maschinenpost`, port 3010, DB credentials via env vars
- **CORS:** Wide-open (`*`) in `WebConfig`

### Frontend (`frontend/` — React 18, TypeScript 5.5, Vite 5, Tailwind 3.4)

**State flows through `App.tsx`** — category/search state with hooks + props, no state library.

- **Routing:** Hash-based via `useHashRoute` hook. Legal pages at `#/impressum`, `#/datenschutz`, `#/agb`. Scrolls to top on hash change.
- **Hooks:** `useArticles` (paginated fetch, infinite scroll, page size 21 for 3-col grid), `useStats` (30s polling, new article detection), `useTheme` (dark/light in localStorage)
- **API client:** `api/client.ts` — plain `fetch` wrapper. Vite proxy handles `/api/*` -> `:8080` in dev.
- **Design system:** Industrial/brutalist dark theme. Colors under `machine.*` in `tailwind.config.js`. Custom CSS (`industrial-bg`, `glow-border`, `skeleton-shimmer`, `card-hover`) in `index.css`. Fonts: IBM Plex Mono (headlines) + DM Sans (body).
- **Categories:** Fixed list in `api/types.ts` — `KI-Modelle, Robotik, Regulierung, Startups, Forschung, Hardware, Tools`.
- **Infinite scroll:** `ArticleGrid` uses `IntersectionObserver` (200px rootMargin) to auto-load next page.
- **About modal:** `AboutModal` component opened via info icon in Header, shows app details and card anatomy.

### API Contract

All endpoints under `/api/`. Backend returns Spring `Page<T>` JSON for paginated endpoints.

| Endpoint | Notes |
|---|---|
| `GET /api/articles` | Query params: `page`, `size`, `category`, `search`, `sort` |
| `GET /api/articles/{id}` | |
| `GET /api/feeds` | |
| `POST /api/feeds` | Body: `{ name, url }` |
| `GET /api/stats` | Returns total counts + articlesPerCategory map |
| `POST /api/refresh` | Async background refresh (not exposed in UI) |

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
- Article content HTML-stripped and truncated to 1000 chars to minimize input tokens

**Why:** A race condition between unguarded threads caused ~$5 in duplicate Claude API charges.

## AI Token Optimization

The Claude API integration is cost-optimized:
- **Model:** Haiku 4.5 (`claude-haiku-4-5-20251001`) — do NOT switch to Sonnet/Opus without explicit approval (5-50x cost difference)
- **Input:** rawContent HTML-stripped, truncated to 1000 chars, compact system prompt (~80 tokens)
- **Output:** max 256 tokens (JSON response is typically ~150-200 tokens)
- **Prompt caching:** Enabled via `anthropic-beta: prompt-caching-2024-07-31` header + `cache_control: ephemeral` on system message. System prompt cached after first call (90% cheaper for subsequent calls in same batch).
- **Fetch rate:** 12h intervals to reduce total API calls

## Key Conventions

- **Language:** All UI text is in German. AI summaries, categories, sentiment values are German.
- **Feed languages:** 7 English feeds + 3 German feeds. Language stored on both `Feed` and `Article` entities.
- **Deduplication:** Articles deduplicated by SHA-256 hash of URL (`urlHash` column, UNIQUE constraint).
- **AI processing is optional:** Backend runs fine without `CLAUDE_API_KEY` — articles just lack summaries/tags/categories. Frontend shows `rawContent` excerpt as fallback.
- **Database:** SQLite in dev (`maschinenpost.db`), PostgreSQL in prod. Hibernate `ddl-auto: update` in both.
- **Sorting:** Default sort is by `publishedAt` DESC (not `createdAt`).
- **Lombok:** Backend uses `@Data`, `@Builder`, `@RequiredArgsConstructor`, `@Slf4j` throughout.
- **Environment:** API key via `.env` file (gitignored) or `CLAUDE_API_KEY` env var.
- **Light mode theming:** `text-machine-accent` (#FFE000 yellow) is unreadable on light backgrounds. Always use `dark:text-machine-accent text-yellow-700` (or `text-gray-900` for primary elements). Same pattern for `hover:`, `bg-`, and `border-` variants. Source badges use `-700`/`-100` pairs (e.g. `dark:text-blue-400 text-blue-700`).
- **Page size:** Frontend uses 21 (divisible by 3 columns) for clean grid layout.
