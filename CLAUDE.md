# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run Commands

### Backend (Spring Boot)
```bash
cd backend
mvn compile                              # compile only
mvn spring-boot:run                      # run without AI summaries
CLAUDE_API_KEY=sk-ant-... mvn spring-boot:run  # run with AI summaries
mvn package -DskipTests                  # build JAR
```

### Frontend (React)
```bash
cd frontend
npm install                              # install dependencies
npm run dev                              # dev server on :5173 (proxies /api → :8080)
npm run build                            # typecheck + production build
npm run preview                          # preview production build
npx tsc --noEmit                         # typecheck only
```

No tests, linting, or CI/CD configured. No `.eslintrc`, `.prettierrc`, or GitHub Actions.

## Architecture

Monorepo with a Spring Boot backend and React frontend. The app aggregates RSS feeds, processes articles through the Claude API for German-language summarization/tagging, and serves them through a REST API consumed by the React UI.

### Backend (`backend/` — Spring Boot 3.2.5, Java 17)

**Data flow:** `FeedScheduler` (every 30 min + on startup) → `FeedService.fetchAllFeeds()` → `AiSummaryService.processUnprocessedArticles()`

- **Entities:** `Article` (SHA-256 `urlHash` for deduplication, tags stored as JSON string with `getTagList()`/`setTagList()` helpers), `Feed`
- **Services:**
  - `FeedService` — Rome 2.1.0 RSS parsing, URL deduplication, seeds 7 default feeds via `@PostConstruct`
  - `AiSummaryService` — Claude API calls via `RestClient`, returns German summary + tags + category + sentiment as JSON. No-ops when `CLAUDE_API_KEY` is unset.
  - `ArticleService` — paginated queries with category/search filtering, stats aggregation
- **DTOs:** Records in `model/dto/` — `ArticleResponse` converts entity tags from JSON string → `List<String>`
- **Config:** `application.yml` — SQLite (`maschinenpost.db` in working dir), scheduler rate, Claude model settings. Custom config under `maschinenpost.*` prefix.
- **Key deps:** `sqlite-jdbc` 3.45.1.0, `hibernate-community-dialects` (SQLiteDialect), `rome` 2.1.0, `lombok`
- **CORS:** Wide-open (`*`) in `WebConfig` for dev; lock down for production.

### Frontend (`frontend/` — React 18, TypeScript 5.5, Vite 5, Tailwind 3.4)

**State flows through `App.tsx`** which owns category/search state and passes data down. No state library — just hooks + props.

- **Hooks:** `useArticles` (paginated fetch with append-mode, AbortController), `useStats` (30s polling, new article detection), `useTheme` (dark/light toggle in localStorage)
- **API client:** `api/client.ts` — plain `fetch` wrapper. Vite proxy handles `/api/*` → `:8080` in dev.
- **Design system:** Industrial/brutalist dark theme. Colors in `tailwind.config.js` under `machine.*`. Custom CSS (`industrial-bg`, `glow-border`, `skeleton-shimmer`, `card-hover`) in `index.css`. Fonts: IBM Plex Mono (headlines) + DM Sans (body).
- **Categories:** Fixed list in `api/types.ts` — `KI-Modelle, Robotik, Regulierung, Startups, Forschung, Hardware, Tools`

### API Contract

All endpoints under `/api/`. Backend returns Spring `Page<T>` JSON for paginated endpoints.

| Endpoint | Notes |
|---|---|
| `GET /api/articles` | Query params: `page`, `size`, `category`, `search`, `sort` |
| `GET /api/articles/{id}` | |
| `GET /api/feeds` | |
| `POST /api/feeds` | Body: `{ name, url }` |
| `GET /api/stats` | Returns total counts + articlesPerCategory map |
| `POST /api/refresh` | Async background refresh (concurrency-guarded) |

## Concurrency Safety (CRITICAL)

All feed-fetching and AI-processing paths MUST go through `FeedScheduler.runFetchCycle()`. This method is protected by an `AtomicBoolean` guard that ensures only one fetch cycle runs at a time. **Never call `FeedService.fetchAllFeeds()` or `AiSummaryService.processUnprocessedArticles()` directly from new code paths** — always route through `FeedScheduler`.

Current call paths (all protected):
- `@Scheduled` (every 30 min with 60s initial delay) → `FeedScheduler.runFetchCycle("Scheduled")`
- `@EventListener(ApplicationReadyEvent)` → `FeedScheduler.runFetchCycle("Initial")`
- `POST /api/refresh` → `StatsController` → `FeedScheduler.runFetchCycle("Manual")`

Additional safeguards:
- `AiSummaryService.processUnprocessedArticles()` has its own `AtomicBoolean` lock as a second barrier
- Each article is re-fetched from DB (`findById`) before Claude API call to verify it hasn't been processed by another thread
- 1000ms delay between API calls to prevent burst billing
- Article content truncated to 2000 chars to minimize input tokens

**Why:** A race condition between unguarded threads caused ~$5 in duplicate Claude API charges. Three threads processed the same articles simultaneously.

## Key Conventions

- **Language:** All UI text is in German. AI summaries, categories, sentiment values are German.
- **Deduplication:** Articles deduplicated by SHA-256 hash of URL (`urlHash` column, UNIQUE constraint).
- **AI processing is optional:** Backend runs fine without `CLAUDE_API_KEY` — articles just lack summaries/tags/categories.
- **SQLite in dev:** Database file `maschinenpost.db` created in the backend working directory (relative path). Hibernate `ddl-auto: update`.
- **Lombok:** Backend uses `@Data`, `@Builder`, `@RequiredArgsConstructor`, `@Slf4j` throughout.
- **AI model:** Claude Haiku 4.5 (`claude-haiku-4-5-20251001`) with max 512 tokens. Do NOT switch to Sonnet/Opus without explicit approval — cost difference is 5-50x.
- **Environment:** API key via `.env` file (gitignored) or `CLAUDE_API_KEY` env var. No `.env.example` exists yet.
