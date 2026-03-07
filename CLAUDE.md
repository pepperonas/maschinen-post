# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run Commands

### Backend (Spring Boot)
```bash
cd backend
mvn compile                              # compile only
mvn spring-boot:run                      # run locally (SQLite, no AI summaries)
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

### Deployment
```bash
bash scripts/deploy.sh                   # build + deploy to VPS
```
The deploy script builds frontend (`npm run build`) and backend JAR (`mvn package`), rsyncs frontend dist + JAR to VPS (`celox`), restarts the systemd service, and verifies.

No tests, linting, or CI/CD configured.

## Architecture

Monorepo with a Spring Boot backend and React frontend. The app aggregates RSS feeds (7 English + 3 German), processes articles through the Claude API for German-language summarization/tagging, and serves them through a REST API consumed by the React UI.

**Production:** `https://maschinenpost.celox.io` — VPS at 69.62.121.168 (SSH alias: `celox`), PostgreSQL 16, backend on port 3010, Nginx reverse proxy with SSL.

### Backend (`backend/` — Spring Boot 3.2.5, Java 17)

**Data flow:** `FeedScheduler` (every 3 hours + on startup) → `FeedService.fetchAllFeeds()` → `AiSummaryService.processUnprocessedArticles()`

- **Entities:** `Article` (SHA-256 `urlHash` for deduplication, tags as JSON string, `language` field), `Feed` (`language` field, default "en")
- **Services:**
  - `FeedService` — Rome 2.1.0 RSS parsing, URL deduplication, seeds 10 default feeds via `@PostConstruct`. Auto-adds new feeds on startup if some already exist. Propagates `feed.language` to new articles.
  - `AiSummaryService` — Claude API calls via `RestClient`, returns German summary + tags + category + sentiment as JSON. No-ops when `CLAUDE_API_KEY` is unset.
  - `ArticleService` — paginated queries with category/search filtering, stats aggregation
- **DTOs:** Records in `model/dto/` — `ArticleResponse` includes `language` field and converts entity tags from JSON string → `List<String>`
- **Config:**
  - `application.yml` — SQLite for local dev (`maschinenpost.db` in working dir), 3-hour fetch rate
  - `application-prod.yml` — PostgreSQL on `127.0.0.1:5432/maschinenpost`, port 3010, DB credentials via env vars
- **Key deps:** `sqlite-jdbc` + `hibernate-community-dialects` (dev), `postgresql` (prod), `rome` 2.1.0, `lombok`
- **CORS:** Wide-open (`*`) in `WebConfig`.

### Frontend (`frontend/` — React 18, TypeScript 5.5, Vite 5, Tailwind 3.4)

**State flows through `App.tsx`** which owns category/search state and passes data down. No state library — just hooks + props.

- **Routing:** Hash-based routing via `useHashRoute` hook in App.tsx. Legal pages at `#/impressum`, `#/datenschutz`, `#/agb`.
- **Hooks:** `useArticles` (paginated fetch with append-mode, sorts by `publishedAt` by default), `useStats` (30s polling, new article detection), `useTheme` (dark/light toggle in localStorage)
- **API client:** `api/client.ts` — plain `fetch` wrapper. Vite proxy handles `/api/*` → `:8080` in dev.
- **Design system:** Industrial/brutalist dark theme. Colors in `tailwind.config.js` under `machine.*`. Custom CSS (`industrial-bg`, `glow-border`, `skeleton-shimmer`, `card-hover`) in `index.css`. Fonts: IBM Plex Mono (headlines) + DM Sans (body).
- **Pages:** `pages/Impressum.tsx`, `pages/Datenschutz.tsx`, `pages/AGB.tsx` — legal pages with consistent styling.
- **Categories:** Fixed list in `api/types.ts` — `KI-Modelle, Robotik, Regulierung, Startups, Forschung, Hardware, Tools`. All tabs always visible; counts appear once articles are AI-categorized.

### API Contract

All endpoints under `/api/`. Backend returns Spring `Page<T>` JSON for paginated endpoints.

| Endpoint | Notes |
|---|---|
| `GET /api/articles` | Query params: `page`, `size`, `category`, `search`, `sort` |
| `GET /api/articles/{id}` | |
| `GET /api/feeds` | |
| `POST /api/feeds` | Body: `{ name, url }` |
| `GET /api/stats` | Returns total counts + articlesPerCategory map |
| `POST /api/refresh` | Async background refresh (exists but not exposed in UI) |

### Production Infrastructure

| Component | Detail |
|---|---|
| VPS | 69.62.121.168, SSH alias `celox` |
| App directory | `/root/apps/maschinenpost/{backend,frontend}` |
| Environment | `/root/apps/maschinenpost/.env` (DB creds, CLAUDE_API_KEY, SPRING_PROFILES_ACTIVE=prod) |
| systemd | `maschinenpost.service` — Java -Xmx512m, Restart=always |
| Nginx | `/etc/nginx/sites-available/maschinenpost.celox.io` — `/` static SPA, `/api/` → :3010 |
| SSL | Let's Encrypt via certbot |
| Logrotate | `/etc/logrotate.d/maschinenpost` — daily, 7 days |

## Concurrency Safety (CRITICAL)

All feed-fetching and AI-processing paths MUST go through `FeedScheduler.runFetchCycle()`. This method is protected by an `AtomicBoolean` guard that ensures only one fetch cycle runs at a time. **Never call `FeedService.fetchAllFeeds()` or `AiSummaryService.processUnprocessedArticles()` directly from new code paths** — always route through `FeedScheduler`.

Current call paths (all protected):
- `@Scheduled` (every 3 hours with 60s initial delay) → `FeedScheduler.runFetchCycle("Scheduled")`
- `@EventListener(ApplicationReadyEvent)` → `FeedScheduler.runFetchCycle("Initial")`
- `POST /api/refresh` → `StatsController` → `FeedScheduler.runFetchCycle("Manual")`

Additional safeguards:
- `AiSummaryService.processUnprocessedArticles()` has its own `AtomicBoolean` lock as a second barrier
- Each article is re-fetched from DB (`findById`) before Claude API call to verify it hasn't been processed by another thread
- 1000ms delay between API calls to prevent burst billing
- Article content truncated to 2000 chars to minimize input tokens

**Why:** A race condition between unguarded threads caused ~$5 in duplicate Claude API charges.

## Key Conventions

- **Language:** All UI text is in German. AI summaries, categories, sentiment values are German.
- **Feed languages:** 7 English feeds (Google AI, OpenAI, The Verge, TechCrunch, MIT, IEEE Spectrum, Robot Report) + 3 German feeds (heise online, Golem.de, t3n). Language stored on both `Feed` and `Article` entities.
- **Deduplication:** Articles deduplicated by SHA-256 hash of URL (`urlHash` column, UNIQUE constraint).
- **AI processing is optional:** Backend runs fine without `CLAUDE_API_KEY` — articles just lack summaries/tags/categories. Frontend shows nothing where summary would be (no placeholder text).
- **Database:** SQLite in dev (`maschinenpost.db`), PostgreSQL in prod. Hibernate `ddl-auto: update` in both.
- **Sorting:** Default sort is by `publishedAt` DESC (not `createdAt`), ensuring chronological article order regardless of when they were fetched.
- **Lombok:** Backend uses `@Data`, `@Builder`, `@RequiredArgsConstructor`, `@Slf4j` throughout.
- **AI model:** Claude Haiku 4.5 (`claude-haiku-4-5-20251001`) with max 512 tokens. Do NOT switch to Sonnet/Opus without explicit approval — cost difference is 5-50x.
- **Environment:** API key via `.env` file (gitignored) or `CLAUDE_API_KEY` env var.
- **Light mode theming:** `text-machine-accent` (#FFE000 yellow) is unreadable on light backgrounds. Always use `dark:text-machine-accent text-yellow-700` (or `text-gray-900` for primary elements). Same pattern for `hover:`, `bg-`, and `border-` variants. Source badges use `-700`/`-100` pairs (e.g. `dark:text-blue-400 text-blue-700`).
