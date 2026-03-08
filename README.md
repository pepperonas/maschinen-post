# MaschinenPost

![MaschinenPost](frontend/public/og-image.png)

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/pepperonas/maschinen-post/releases)
[![CI](https://github.com/pepperonas/maschinen-post/actions/workflows/ci.yml/badge.svg)](https://github.com/pepperonas/maschinen-post/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff.svg)](https://vitejs.dev/)
[![Claude API](https://img.shields.io/badge/Claude%20API-Haiku%204.5-cc785c.svg)](https://docs.anthropic.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)
[![GitHub](https://img.shields.io/github/stars/pepperonas/maschinen-post?style=social)](https://github.com/pepperonas/maschinen-post)
[![GitHub last commit](https://img.shields.io/github/last-commit/pepperonas/maschinen-post)](https://github.com/pepperonas/maschinen-post/commits/main)
[![GitHub repo size](https://img.shields.io/github/repo-size/pepperonas/maschinen-post)](https://github.com/pepperonas/maschinen-post)

Deutschsprachiger Echtzeit-Nachrichtenaggregator fuer Kuenstliche Intelligenz und Robotik mit automatischer RSS-Aggregation, Claude-gestuetzter Zusammenfassung, Trending-Analyse und Duplikaterkennung.

**Live:** [maschinenpost.celox.io](https://maschinenpost.celox.io)

## Screenshots

### Desktop — Dark Industrial UI
![MaschinenPost Dark Theme](docs/screenshot-dark.png)

### KI-Zusammenfassungen mit Kategorie-Filter
![MaschinenPost AI Summaries](docs/screenshot-ai.png)

## Features

### Kern-Features
- **10 RSS-Quellen** — 7 englische + 3 deutsche Feeds, automatisch alle 12 Stunden aktualisiert
- **KI-Zusammenfassungen** — Claude Haiku 4.5 generiert deutsche Zusammenfassungen, Tags, Kategorien und Sentiment
- **7 Kategorien** — KI-Modelle, Robotik, Regulierung, Startups, Forschung, Hardware, Tools
- **Sentimentanalyse** — Visuelle Indikatoren pro Artikel (&#9650; positiv, &#9679; neutral, &#9660; kritisch)
- **Volltextsuche** — Debounced-Suche ueber Titel und KI-Zusammenfassungen
- **Sprachfilter** — Toggle zwischen deutschen, englischen oder allen Artikeln (DE/EN/Alle)
- **Infinite Scroll** — Automatisches Nachladen via IntersectionObserver
- **Live-Updates** — 30s-Polling mit "Neue Artikel"-Banner
- **Dark/Light Mode** — Theme-Wechsel in localStorage persistiert

### Content Intelligence
- **Trending-Erkennung** — Tag-basiertes Jaccard-Clustering erkennt aktuelle Trendthemen automatisch
- **Tages-/Wochen-Digest** — Kuratierte Top-Artikel pro Kategorie als Magazin-Layout
- **Duplikaterkennung** — Trigram- und Tag-Similarity (Jaccard) markiert inhaltlich doppelte Artikel
- **RSS-Ausgabe** — Eigener RSS 2.0 Feed (`/api/feed.xml`) zum Abonnieren in externen Readern

### User Experience
- **Lesezeichen** — Artikel lokal speichern, eigener "Gespeichert"-Tab
- **Lesehistorie** — Gelesene Artikel werden abgedimmt dargestellt (max. 500 Eintraege)
- **Artikel-Detail-Modal** — Vollansicht mit Navigation, verwandten Artikeln und Bookmark
- **Tastatur-Shortcuts** — `j`/`k` Navigation, `Enter` Detail, `o` Original, `b` Bookmark, `s`/`/` Suche, `Esc` Schliessen, `1-8` Kategorien
- **Swipe-Gesten** — Wischen zum Bookmarken (rechts) und als gelesen markieren (links)
- **Teilen-Buttons** — Web Share API mit Clipboard-Fallback
- **PWA** — Installierbar als App auf Smartphone und Desktop mit Service Worker, Offline-Caching (Workbox), Auto-Update
- **Embed-Widget** — Einbettbares JavaScript-Widget fuer externe Websites

### Zuverlaessigkeit & Monitoring
- **Feed-Health-Monitoring** — Automatische Deaktivierung nach 5 Fehlversuchen, Reaktivierung via UI
- **Quellen-Dashboard** — Feed-Status mit Ampel-Anzeige (gruen/gelb/rot) und Fehlerdetails
- **Statistik-Dashboard** — Quellen-Verteilung, Sentiment-Analyse, Verlauf ueber 7/30/90 Tage
- **Artikel-Retention** — Automatische Bereinigung alter Artikel (konfigurierbar, Standard 90 Tage)
- **Health-Endpoint** — Spring Boot Actuator mit Feed-Staleness-Check
- **Rate Limiting** — Refresh-Endpoint auf 1 Aufruf pro 10 Minuten pro IP begrenzt
- **Error Boundary** — React-Fehlergrenze mit Retry-Button

### Design & Performance
- **Industrial Dark UI** — Brutalist-Design mit IBM Plex Mono, Grid-Texturen, Electric Yellow (#FFE000)
- **Smartphone-optimiert** — Bottom-Sheet-Modals, Safe-Area-Insets fuer Notch-Phones, 44px+ Touch-Targets, Hover nur auf Pointer-Geraeten, 3-Spalten-Raster (Desktop) / 1-Spalte (Mobile)
- **Performance** — DB-Indexes, Caffeine-Cache (30s Stats / 15min Content), Batch-Inserts, Gzip, Lazy-Loading
- **Kostenoptimiert** — Haiku 4.5, HTML-Stripping, Content-Truncation, Prompt Caching, Concurrency-Guards
- **Rechtskonforme Seiten** — Impressum, Datenschutzerklaerung, Nutzungsbedingungen

## Architektur

```
maschinen-post/
├── backend/               Spring Boot 3.2 (Java 17)
│   ├── controller/        REST-Endpoints (Articles, Feeds, Stats, RssFeed)
│   ├── service/           FeedService, AiSummaryService, ArticleService,
│   │                      TrendingService, DigestService, DuplicateDetectionService
│   ├── scheduler/         FeedScheduler (12h), CleanupScheduler (taeglich 3 Uhr)
│   ├── health/            FeedHealthIndicator (Actuator)
│   ├── model/             JPA-Entities (Article, Feed) + DTOs
│   ├── config/            CacheConfig (Caffeine Composite), WebConfig (CORS)
│   └── repository/        Spring Data JPA (SQLite dev / PostgreSQL prod)
├── frontend/              React 18 + TypeScript + Vite 5 + Tailwind CSS 3
│   ├── components/        Header, ArticleCard, ArticleGrid, CategoryFilter,
│   │                      ArticleDetailModal, TrendingView, ErrorBoundary, AboutModal
│   ├── pages/             Digest, Stats, Sources, Impressum, Datenschutz, AGB
│   ├── hooks/             useArticles, useStats, useTheme, useBookmarks,
│   │                      useReadHistory, useKeyboardNav, useSwipe
│   └── api/               REST-Client + TypeScript-Types
├── .github/workflows/
│   └── ci.yml             GitHub Actions (mvn test + npm run build)
└── scripts/
    └── deploy.sh          rsync-basiertes Deployment auf VPS
```

### Datenfluss

```
FeedScheduler (AtomicBoolean Guard)
    ├── @EventListener(ApplicationReadyEvent) ─┐
    ├── @Scheduled(alle 12 Stunden) ───────────┤
    └── POST /api/refresh (Rate-Limited) ──────┘
            │
            ▼
    runFetchCycle() [single-threaded, guarded]
            │
            ├── FeedService.fetchAllFeeds()
            │       ├── Rome RSS Parser → Article-Entities (SHA-256 URL-Dedup)
            │       ├── feed.language → article.language
            │       └── Fehler-Tracking: failCount++, auto-disable nach 5 Fehlern
            │
            └── AiSummaryService.processUnprocessedArticles() [AtomicBoolean Guard]
                    ├── Pro Artikel: DB re-fetch → HTML strip → Claude API
                    │   → Summary/Tags/Kategorie/Sentiment speichern
                    └── DuplicateDetectionService.detectDuplicates()
                            └── Tag-Jaccard + Trigram-Similarity → duplicateOfId setzen
```

## Tech Stack

| Schicht    | Technologie                                    |
|------------|------------------------------------------------|
| Frontend   | React 18 + TypeScript 5.5 + Tailwind CSS 3.4  |
| Build      | Vite 5 (Frontend) + Maven (Backend)            |
| Backend    | Spring Boot 3.2.5 (Java 17)                    |
| KI         | Claude Haiku 4.5 (kostenoptimiert, Prompt Caching) |
| Datenbank  | SQLite 3.45 (dev) / PostgreSQL 16 (prod)       |
| RSS        | Rome 2.1.0 (Java RSS/Atom Parser)              |
| Caching    | Caffeine (30s Stats / 15min Content)           |
| Monitoring | Spring Boot Actuator + Custom Health Indicator  |
| Tests      | JUnit 5 + Mockito (Backend), Vitest + Testing Library (Frontend) |
| CI         | GitHub Actions (JUnit 5 + Vitest + Vite Build) |
| PWA        | Workbox (vite-plugin-pwa), Precaching + Runtime Caching |
| Deploy     | rsync + systemd + Nginx + Let's Encrypt        |

## RSS-Quellen

| Quelle               | Sprache | Feed URL                                                          |
|----------------------|---------|-------------------------------------------------------------------|
| Google AI Blog       | EN      | `feeds.feedburner.com/blogspot/gJZg`                              |
| OpenAI Blog          | EN      | `openai.com/blog/rss.xml`                                        |
| The Verge AI         | EN      | `theverge.com/rss/ai-artificial-intelligence/index.xml`           |
| TechCrunch AI        | EN      | `techcrunch.com/category/artificial-intelligence/feed/`           |
| MIT AI News          | EN      | `news.mit.edu/topic/mitartificial-intelligence2-rss.xml`          |
| IEEE Spectrum Robotics | EN    | `spectrum.ieee.org/feeds/topic/robotics.rss`                      |
| The Robot Report     | EN      | `therobotreport.com/feed/`                                       |
| heise online         | DE      | `heise.de/rss/heise-atom.xml`                                    |
| Golem.de             | DE      | `rss.golem.de/rss.php?feed=RSS2.0`                               |
| t3n                  | DE      | `t3n.de/rss.xml`                                                 |

Weitere Feeds koennen zur Laufzeit via `POST /api/feeds` hinzugefuegt werden.

## Voraussetzungen

- Java 17+
- Maven 3.9+
- Node.js 18+
- npm 9+
- Claude API Key (optional — App funktioniert ohne, Artikel haben dann keine KI-Zusammenfassungen)

## Setup

### Backend

```bash
cd backend

# Ohne KI-Zusammenfassungen
mvn spring-boot:run

# Mit Claude-KI-Zusammenfassungen
CLAUDE_API_KEY=sk-ant-your-key-here mvn spring-boot:run

# Tests ausfuehren (43 Tests)
mvn test

# Einzelne Testklasse
mvn test -Dtest=FeedSchedulerTest
```

Das Backend startet auf `http://localhost:8080`. Beim ersten Start:
1. 10 RSS-Feed-Quellen in SQLite angelegt
2. Alle Artikel aus den Feeds abgerufen
3. Artikel mit Claude Haiku 4.5 verarbeitet (falls API Key gesetzt)
4. Fetch+Process-Zyklus alle 12 Stunden wiederholt

### Frontend

```bash
cd frontend
npm install
npm run dev

# Tests ausfuehren (14 Tests)
npm test
```

Das Frontend startet auf `http://localhost:5173` mit automatischem API-Proxy zum Backend.

### Produktion

```bash
# Frontend + Backend bauen und auf VPS deployen
bash scripts/deploy.sh
```

Das Deploy-Script baut Frontend und Backend-JAR, kopiert beides via rsync/scp auf den VPS und startet den systemd-Service neu.

#### Manuelle Produktion (ohne Deploy-Script)

```bash
# Frontend bauen
cd frontend && npm run build

# Backend-JAR bauen
cd backend && mvn clean package -DskipTests

# Starten (mit prod-Profil fuer PostgreSQL)
java -jar -Dspring.profiles.active=prod target/maschinenpost-1.0.0.jar
```

## API Endpoints

| Methode | Pfad                         | Beschreibung                                                    |
|---------|------------------------------|-----------------------------------------------------------------|
| GET     | `/api/articles`              | Paginierte Artikel (`page`, `size`, `category`, `search`, `sort`, `language`) |
| GET     | `/api/articles/{id}`         | Einzelner Artikel nach ID                                       |
| GET     | `/api/articles/trending`     | Trending-Topics via Tag-Clustering (`hours`, Standard 48)       |
| GET     | `/api/articles/digest`       | Tages-/Wochen-Digest (`period`: `daily`/`weekly`)              |
| GET     | `/api/feeds`                 | Alle RSS-Quellen auflisten                                      |
| POST    | `/api/feeds`                 | Neue RSS-Quelle hinzufuegen (`{ name, url }`)                  |
| POST    | `/api/feeds/{id}/reactivate` | Deaktivierten Feed reaktivieren                                 |
| GET     | `/api/stats`                 | Dashboard-Statistiken + Kategoriezaehler                        |
| GET     | `/api/stats/history`         | Statistik-Verlauf (`days`, Standard 30)                         |
| POST    | `/api/refresh`               | Manuellen Feed-Refresh ausloesen (Rate-Limited: 10min/IP)      |
| GET     | `/api/feed.xml`              | RSS 2.0 Ausgabe-Feed (letzte 50 Artikel, 15min Cache)          |
| GET     | `/actuator/health`           | Health-Check mit Feed-Staleness-Pruefung                        |

## Konfiguration

Umgebungsvariablen:

| Variable         | Standard                  | Beschreibung                                |
|------------------|---------------------------|---------------------------------------------|
| `CLAUDE_API_KEY` | (keiner)                  | Anthropic API Key fuer KI-Zusammenfassungen |
| `SERVER_PORT`    | 8080 (dev) / 3010 (prod)  | Backend-Server-Port                         |
| `DB_USERNAME`    | —                         | PostgreSQL-Benutzername (nur prod)          |
| `DB_PASSWORD`    | —                         | PostgreSQL-Passwort (nur prod)              |

Anwendungskonfiguration in `backend/src/main/resources/application.yml`:

| Property                                  | Standard                    | Beschreibung                         |
|-------------------------------------------|-----------------------------|--------------------------------------|
| `maschinenpost.claude.model`              | `claude-haiku-4-5-20251001` | Claude-Modell-ID                     |
| `maschinenpost.claude.max-tokens`         | `256`                       | Max. Antwort-Tokens pro Artikel      |
| `maschinenpost.scheduler.feed-fetch-rate` | `43200000` (12 Std.)        | Feed-Abrufintervall in Millisekunden |
| `maschinenpost.retention.days`            | `90`                        | Artikel-Aufbewahrungsdauer in Tagen  |

## Kostenoptimierung

Die App minimiert Claude-API-Kosten durch mehrere Massnahmen:

- **Modell:** Haiku 4.5 — 5-50x guenstiger als Sonnet/Opus
- **HTML-Stripping:** Vor dem API-Call werden HTML-Tags und Entities entfernt, nur Reintext gesendet
- **Content-Truncation:** Artikelinhalt auf 1000 Zeichen begrenzt
- **Kompakter System Prompt:** ~80 Tokens, Kategorien werden nicht aufgezaehlt
- **Max Tokens:** Antwort auf 256 Tokens limitiert (JSON ist typischerweise ~150-200 Tokens)
- **Prompt Caching:** System Prompt via `cache_control: ephemeral` gecacht — 90% guenstiger ab dem 2. Artikel
- **12-Stunden-Intervall:** Feeds werden zweimal taeglich abgerufen
- **Concurrency Guards:** `AtomicBoolean`-Locks verhindern doppelte API-Calls
- **DB-Recheck:** Jeder Artikel wird vor dem Claude-Call erneut aus der DB geladen
- **Throttling:** 1000ms Pause zwischen API-Calls
- **Duplikaterkennung:** Inhaltlich gleiche Artikel werden nur einmal verarbeitet

## Tests

### Backend (43 Tests, JUnit 5 + Mockito)

```bash
cd backend
mvn test                          # alle Tests
mvn test -Dtest=FeedSchedulerTest # einzelne Testklasse
```

| Testklasse            | Prueft                                                       |
|-----------------------|--------------------------------------------------------------|
| `ArticleTest`         | Tag-JSON-Serialisierung, Builder-Defaults                    |
| `ArticleResponseTest` | DTO-Mapping, HTML-Stripping, Truncation                      |
| `FeedServiceTest`     | Feed-Seeding (10 Feeds, 7 EN / 3 DE), SHA-256 Hashes        |
| `ArticleServiceTest`  | Sorting, Category/Search/Language-Routing, Stats, 404        |
| `AiSummaryServiceTest`| API-Key-Check, AtomicBoolean-Guard, Lock-Release, Duplikate  |
| `FeedSchedulerTest`   | Concurrency-Guard, Service-Reihenfolge, Exception-Safety     |

### Frontend (14 Tests, Vitest + Testing Library)

```bash
cd frontend
npm test
```

| Testdatei               | Prueft                                             |
|-------------------------|----------------------------------------------------|
| `useBookmarks.test.ts`  | Toggle on/off, localStorage Persistenz/Restore     |
| `useReadHistory.test.ts`| Gelesen-Markierung, Deduplizierung, Persistenz     |
| `useTheme.test.ts`      | Default Dark, Toggle, localStorage Persistenz      |

## PWA Installation

Die App kann als native App auf dem Smartphone installiert werden:

**iPhone (Safari):**
1. [maschinenpost.celox.io](https://maschinenpost.celox.io) in Safari oeffnen
2. Teilen-Button (Quadrat mit Pfeil) tippen
3. "Zum Home-Bildschirm" waehlen

**Android (Chrome):**
1. [maschinenpost.celox.io](https://maschinenpost.celox.io) in Chrome oeffnen
2. "App installieren"-Banner antippen oder Menu → "App installieren"

Die PWA cached statische Assets (JS, CSS, Fonts) lokal und nutzt NetworkFirst-Strategie fuer API-Daten mit 5-Minuten-Fallback-Cache.

## Tastatur-Shortcuts

| Taste       | Aktion                      |
|-------------|----------------------------|
| `j` / `k`   | Naechster / Voriger Artikel |
| `Enter`     | Detail-Modal oeffnen        |
| `o`         | Original-Artikel oeffnen    |
| `b`         | Lesezeichen setzen/entfernen|
| `s` / `/`   | Suche fokussieren           |
| `Esc`       | Modal/Suche schliessen      |
| `1` - `8`   | Kategorie auswaehlen        |

## Lizenz

Dieses Projekt steht unter der [MIT-Lizenz](LICENSE).

## Autor

**Martin Pfeffer** — [celox.io](https://celox.io) — [GitHub](https://github.com/pepperonas)

---

&copy; 2026 Martin Pfeffer | [celox.io](https://celox.io)
