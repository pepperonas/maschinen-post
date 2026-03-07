# MaschinenPost — Verbesserungsplan

Basierend auf einer detaillierten Codebase-Analyse: aktuelle Starken, Lucken und konkrete Feature-Ideen.

---

## Phase 1 — Lesekomfort & Interaktion (HIGH IMPACT, MEDIUM EFFORT)

### 1.1 Lesezeichen / Favoriten (localStorage)

**Problem:** Nutzer konnen interessante Artikel nicht speichern. Alles ist ephemer — wer einen Artikel nicht sofort liest, muss ihn spater wiederfinden.

**Umsetzung:**
- Neuer Hook `useBookmarks` — Set von Artikel-IDs in localStorage (`maschinenpost-bookmarks`)
- Herz-/Stern-Icon auf jeder `ArticleCard` (rechts neben "Lesen"-Link)
- Neuer Filter-Tab "Gespeichert" in `CategoryFilter` (neben "Alle")
- Wenn aktiv: Frontend filtert lokal aus `articles[]` statt neuer API-Call
- Badge-Count auf dem Tab: "Gespeichert (12)"
- Export-Button: Alle Bookmarks als JSON/Links kopieren

**Dateien:**
- `hooks/useBookmarks.ts` (NEU)
- `ArticleCard.tsx` — Bookmark-Icon im Footer
- `CategoryFilter.tsx` — "Gespeichert"-Tab
- `App.tsx` — Bookmark-State + Filter-Logik
- `api/types.ts` — CATEGORIES erweitern

**Aufwand:** ~2h | **Impact:** Hoch — macht die App "sticky", Nutzer kommen zuruck

---

### 1.2 Gelesen-Markierung

**Problem:** Bei 1000+ Artikeln verliert man den Uberblick, was man schon gelesen hat. Besonders nach einem Refresh sieht alles gleich aus.

**Umsetzung:**
- Set von gelesenen Artikel-IDs in localStorage (`maschinenpost-read`)
- Klick auf Titel oder "Lesen" markiert Artikel als gelesen
- Visuelle Unterscheidung: Opacity 60% auf Titel + dezenterer Border
- Toggle in Header oder CategoryFilter: "Ungelesene zuerst" / "Alle"
- Max 500 IDs speichern (alteste automatisch entfernen)

**Dateien:**
- `hooks/useReadHistory.ts` (NEU)
- `ArticleCard.tsx` — onClick-Handler + CSS-Klasse
- `App.tsx` — Read-State durchreichen

**Aufwand:** ~1.5h | **Impact:** Mittel — verbessert taeglichen Workflow

---

### 1.3 Artikel-Detailansicht (In-App)

**Problem:** Klick auf einen Artikel offnet immer die externe Quelle. Der Nutzer verlasst die App und verliert den Kontext (Filter, Scroll-Position).

**Umsetzung:**
- Neues Modal `ArticleDetailModal` (fullscreen auf Mobile, 80% auf Desktop)
- Zeigt: Titel, Quelle, Datum, Sprache, KI-Zusammenfassung (groesser), Tags, Kategorie, Sentiment
- "Originalquelle offnen" Button prominent
- Verwandte Artikel: 3 Karten mit gleicher Kategorie (lokale Filterung aus geladenen Artikeln)
- Keyboard: Escape schliessen, Pfeiltasten voriger/nachster Artikel
- URL-Hash: `#/article/123` fur Deeplinks/Sharing

**Dateien:**
- `components/ArticleDetailModal.tsx` (NEU)
- `ArticleCard.tsx` — onClick offnet Detail statt externem Link
- `App.tsx` — Route `#/article/:id`, Detail-State
- `api/client.ts` — getArticle(id) Funktion (GET /api/articles/{id} existiert bereits)

**Aufwand:** ~4h | **Impact:** Hoch — halt Nutzer in der App, ermoglicht Sharing

---

### 1.4 Tastatur-Navigation (Power Users)

**Problem:** Keine Keyboard-Shortcuts. News-Reader leben von schneller Navigation.

**Umsetzung:**
- `j` / `k` — nachster / voriger Artikel (visueller Fokus-Ring)
- `Enter` — Artikel-Detail offnen
- `o` — Originalquelle in neuem Tab
- `b` — Bookmark togglen
- `s` — Suche fokussieren
- `/` — Suche offnen (wie GitHub)
- `Escape` — Suche/Modal schliessen
- `1`-`7` — Kategorie direkt wahlen
- Keyboard-Hint in AboutModal dokumentieren

**Dateien:**
- `hooks/useKeyboardNav.ts` (NEU)
- `ArticleCard.tsx` — `data-article-index` Attribut + Fokus-Ring-Klasse
- `App.tsx` — Hook einbinden, focusedIndex State
- `AboutModal.tsx` — Shortcut-Dokumentation

**Aufwand:** ~3h | **Impact:** Mittel — Power-User-Feature, erhoht Retention

---

## Phase 2 — Intelligente Features (HIGH IMPACT, HIGH EFFORT)

### 2.1 Trending-Ansicht / Nachrichten-Cluster

**Problem:** Wenn ein Thema (z.B. "GPT-5 Release") von 5 Quellen berichtet wird, sieht man 5 separate Karten. Kein Uberblick uber "heisse Themen".

**Umsetzung Backend:**
- Neuer Endpoint: `GET /api/articles/trending` — Gruppiert Artikel der letzten 48h nach Similarity
- Clustering-Strategie (ohne ML): Gleiche Kategorie + uberlappende Tags (Jaccard-Ahnlichkeit > 0.3)
- Response: `[{ topic: "GPT-5 Release", articles: [...], articleCount: 5, latestAt: "..." }]`
- Neues DTO: `TrendingTopic`
- Lightweight: Kein externer Service, nur SQL + Java-Logik

**Umsetzung Frontend:**
- Neuer Tab "Trending" in CategoryFilter (zwischen "Alle" und den Kategorien)
- Kartendesign: Topic-Header mit Article-Count Badge, darunter kompakte Artikel-Liste
- Expand/Collapse pro Cluster

**Dateien:**
- `service/TrendingService.java` (NEU)
- `controller/ArticleController.java` — neuer Endpoint
- `model/dto/TrendingTopic.java` (NEU)
- `components/TrendingView.tsx` (NEU)
- `components/TrendingCard.tsx` (NEU)
- `api/client.ts` — getTrending()
- `api/types.ts` — TrendingTopic Interface

**Aufwand:** ~6h | **Impact:** Sehr hoch — Alleinstellungsmerkmal, kein anderer DE-Aggregator hat das

---

### 2.2 Taglicher/Wochentlicher Digest

**Problem:** Nicht jeder will Live-Feed. Manche Nutzer wollen eine taegliche Zusammenfassung der wichtigsten Nachrichten.

**Umsetzung Backend:**
- Neuer Endpoint: `GET /api/digest?period=daily|weekly`
- Selektiert Top-Artikel pro Kategorie (nach Sentiment-Gewichtung: positiv > neutral > kritisch)
- Optional: Claude generiert eine Meta-Zusammenfassung uber alle Artikel des Tages (~50 Tokens extra)
- Caching: Digest einmal pro Tag generieren, in DB oder Caffeine speichern

**Umsetzung Frontend:**
- Neue Route: `#/digest`
- Kompaktes Magazin-Layout: Sections pro Kategorie mit je 2-3 Artikeln
- "Digest teilen" Button (Copy-to-Clipboard als formatierter Text)
- Datumsnavigation: "Gestern", "Letzte Woche"

**Dateien:**
- `service/DigestService.java` (NEU)
- `controller/DigestController.java` (NEU)
- `model/dto/DigestResponse.java` (NEU)
- `pages/Digest.tsx` (NEU)
- `components/DigestSection.tsx` (NEU)

**Aufwand:** ~8h | **Impact:** Hoch — erschliesst neuen Nutzertyp (Gelegenheitsleser)

---

### 2.3 Content-basierte Duplikaterkennung

**Problem:** Gleiche Nachricht erscheint in TechCrunch, The Verge und heise. URL-Hash Dedup hilft nicht, da URLs verschieden sind. Nutzer sehen redundante Karten.

**Umsetzung Backend:**
- Nach AI-Processing: Vergleiche Summary mit allen Artikeln der letzten 48h (gleiche Kategorie)
- Simple Ahnlichkeit: Trigram-Overlap oder Levenshtein auf Summary-Text
- Bei >70% Ahnlichkeit: `duplicateOfId` Feld setzen, Frontend gruppiert
- Alternativ: Claude im selben API-Call fragen: "Ist dieser Artikel thematisch identisch mit: [Liste der letzten 5 Summaries der Kategorie]?" — aber das erhoht Tokens

**Umsetzung Frontend:**
- Duplikate unter dem Hauptartikel als "Auch berichtet von: The Verge, heise" anzeigen
- Kleine Source-Badges statt voller Karten

**Dateien:**
- `service/DuplicateDetectionService.java` (NEU)
- `Article.java` — neues Feld `duplicateOfId`
- `ArticleResponse.java` — `relatedSources` Liste
- `ArticleCard.tsx` — "Auch berichtet von" Section

**Aufwand:** ~5h | **Impact:** Hoch — bereinigt den Feed massiv, bessere UX

---

### 2.4 RSS-Feed fur MaschinenPost selbst

**Problem:** Die App aggregiert RSS-Feeds, bietet aber selbst keinen RSS-Feed an. Nutzer konnen MaschinenPost nicht in ihren eigenen Reader einbinden.

**Umsetzung Backend:**
- Neuer Endpoint: `GET /api/feed.xml` (oder `/rss`)
- Generiert Atom/RSS-Feed mit den letzten 50 Artikeln
- Enthalt: Titel, AI-Summary als Description, Kategorie als Category-Tag, Link zur Originalquelle
- Rome-Library ist bereits im Projekt (fur Parsing) — kann auch fur Generierung genutzt werden
- Content-Type: `application/rss+xml`
- Cache: 15min Caffeine Cache

**Umsetzung Frontend:**
- RSS-Icon im Header neben GitHub-Link
- `<link rel="alternate" type="application/rss+xml">` im HTML-Head

**Dateien:**
- `controller/RssFeedController.java` (NEU)
- `Header.tsx` — RSS-Icon
- `frontend/index.html` — Link-Tag

**Aufwand:** ~2h | **Impact:** Mittel — Meta-Feature, technisch elegant, gute PR fur Open-Source

---

## Phase 3 — Betrieb & Zuverlassigkeit (MEDIUM IMPACT, LOW EFFORT)

### 3.1 Feed-Health-Monitoring & Auto-Disable

**Problem:** Wenn ein RSS-Feed dauerhaft offline geht, loggt der Scheduler endlos Fehler. Kein Mechanismus um kaputte Feeds zu erkennen oder zu deaktivieren.

**Umsetzung:**
- Neue Felder auf `Feed`: `failCount` (int), `lastError` (String), `disabledAt` (Timestamp)
- Bei Fetch-Fehler: `failCount++`, `lastError` speichern
- Bei Erfolg: `failCount = 0`, `lastError = null`
- Bei `failCount >= 5`: Feed automatisch deaktivieren (`active = false`, `disabledAt = now`)
- Admin-Endpoint: `POST /api/feeds/{id}/reactivate` — setzt failCount zuruck, reaktiviert
- Stats-Endpoint erweitern: Feed-Health in Response aufnehmen

**Dateien:**
- `Feed.java` — neue Felder
- `FeedService.java` — Error-Tracking-Logik
- `FeedController.java` — Reactivate-Endpoint
- `StatsResponse.java` — Feed-Health-Info

**Aufwand:** ~2h | **Impact:** Mittel — verhindert unnoetige Fehler-Logs und haengende Cycles

---

### 3.2 Artikel-Retention-Policy (Auto-Cleanup)

**Problem:** Die DB wachst endlos. Bei 10 Feeds x ~5 Artikel/Tag = ~50 Artikel/Tag = ~18.000/Jahr. Alte Artikel sind irrelevant.

**Umsetzung:**
- Neuer Scheduler: `@Scheduled(cron = "0 0 3 * * *")` — taeglich um 3 Uhr
- Loscht Artikel alter als 90 Tage (konfigurierbar via `application.yml`)
- Bookmarks-sicher: Endpoint `GET /api/articles/ids?ids=1,2,3` fur Frontend-Validierung (optional)
- Log: "Deleted 247 articles older than 90 days"
- Property: `maschinenpost.retention.days: 90`

**Dateien:**
- `scheduler/CleanupScheduler.java` (NEU)
- `ArticleRepository.java` — `deleteByCreatedAtBefore(LocalDateTime)`
- `application.yml` — retention.days Property

**Aufwand:** ~1h | **Impact:** Mittel — verhindert DB-Bloat, wichtig fur Langzeitbetrieb

---

### 3.3 Health-Endpoint & Monitoring

**Problem:** Kein Health-Check. Wenn der Service haengt, merkt es niemand bis ein Nutzer sich beschwert. Kein Monitoring-Integration moglich.

**Umsetzung:**
- Spring Boot Actuator einbinden (nur `/actuator/health` und `/actuator/info` exposen)
- Custom Health-Indicator: `FeedHealthIndicator` — prueft ob letzter erfolgreicher Fetch < 24h
- Custom Health-Indicator: `DatabaseHealthIndicator` — prueft ob articleCount > 0
- `/actuator/info` — App-Version, letzte Artikel-Anzahl, Feed-Count
- Nginx: Proxy `/health` -> `/actuator/health`
- Optional: Simple Uptime-Check via cron auf dem VPS (`curl -sf http://localhost:3010/actuator/health || systemctl restart maschinenpost`)

**Dateien:**
- `pom.xml` — spring-boot-starter-actuator
- `application.yml` — management.endpoints.web.exposure.include: health,info
- `application-prod.yml` — gleiche Config
- `health/FeedHealthIndicator.java` (NEU)

**Aufwand:** ~1.5h | **Impact:** Mittel — Grundlage fur jedes Monitoring-Setup

---

### 3.4 Rate-Limiting auf /api/refresh

**Problem:** `POST /api/refresh` ist ungeschuetzt. Jemand konnte den Endpoint spammen und hunderte parallele Feed-Fetches + Claude-API-Calls ausloesen. Der AtomicBoolean verhindert Parallelitat, aber nicht Spam.

**Umsetzung:**
- Einfaches In-Memory Rate-Limit: Max 1 Request pro 10 Minuten pro IP
- `ConcurrentHashMap<String, Instant>` im Controller
- Bei Throttling: HTTP 429 Too Many Requests + `Retry-After` Header
- Kein externer Dependency notig (kein Bucket4j/Redis)

**Dateien:**
- `StatsController.java` — Rate-Limit-Logik im refresh-Endpoint

**Aufwand:** ~30min | **Impact:** Niedrig-Mittel — Sicherheit gegen Missbrauch

---

## Phase 4 — PWA & Mobile Experience (MEDIUM IMPACT, MEDIUM EFFORT)

### 4.1 Progressive Web App (Installierbar)

**Problem:** Die App ist eine reine Website. Auf dem S24 Ultra musste man einen Browser-Tab offenhalten. Als PWA konnte man sie auf den Homescreen legen.

**Umsetzung:**
- `manifest.json` — App-Name, Icons (192px + 512px), Theme-Color (#0a0a0a), Display: standalone
- Service Worker (Workbox via Vite-Plugin): Cache-First fur Static Assets, Network-First fur API
- Offline-Fallback: Zuletzt geladene Artikel aus Cache anzeigen + "Offline"-Banner
- Install-Prompt: "Zum Homescreen hinzufuegen" Banner (einmalig, dismissable)
- Icons aus OG-Image ableiten oder separates App-Icon erstellen

**Dateien:**
- `frontend/public/manifest.json` (NEU)
- `frontend/public/icons/` (NEU — 192px, 512px)
- `vite.config.ts` — vite-plugin-pwa
- `frontend/index.html` — manifest Link-Tag
- `components/InstallBanner.tsx` (NEU)

**Aufwand:** ~3h | **Impact:** Hoch fur Mobile-Nutzer — App-like Experience

---

### 4.2 Browser Push-Benachrichtigungen

**Problem:** Nutzer mussen aktiv die App offnen um neue Artikel zu sehen. Fur Breaking News (z.B. "GPT-5 Released") ware eine Push-Notification ideal.

**Umsetzung:**
- Service Worker Notifications API (kein Backend-Push-Service notig fur einfache Variante)
- Polling im Service Worker: Alle 30min `/api/stats` pruefen, bei neuen Artikeln Notification zeigen
- Notification: "MaschinenPost: 5 neue Artikel" + Klick offnet App
- Opt-in: Toggle in Header + Permission-Request
- Datenschutz: Keine Daten an Dritte, alles client-seitig

**Alternativ (robust):**
- Web Push API mit Backend-Integration (VAPID Keys, Push-Subscriptions in DB)
- Deutlich mehr Aufwand, aber funktioniert auch bei geschlossenem Browser

**Aufwand:** ~2h (einfach) / ~8h (Web Push) | **Impact:** Mittel — abhaengig von Nutzertyp

---

### 4.3 Swipe-Gesten (Mobile)

**Problem:** Auf Touch-Devices fehlen native Gesten. Kein Swipe-to-Bookmark, kein Pull-to-Refresh.

**Umsetzung:**
- Pull-to-Refresh auf der Artikelliste (touch-action: pan-y + custom Handler)
- Swipe-Right auf Karte: Bookmark togglen (mit visueller Bestatigung)
- Swipe-Left auf Karte: "Gelesen" markieren
- Library: Kein Dependency — reines Pointer Events API (~100 Zeilen)

**Dateien:**
- `hooks/useSwipe.ts` (NEU)
- `ArticleCard.tsx` — Touch-Handler + Swipe-Indicator
- `ArticleGrid.tsx` — Pull-to-Refresh

**Aufwand:** ~3h | **Impact:** Mittel — Mobile-UX, aber Feature-Discovery ist schwierig

---

## Phase 5 — Analytics & Insights (LOW-MEDIUM IMPACT, MEDIUM EFFORT)

### 5.1 Statistik-Dashboard (In-App)

**Problem:** `/api/stats` liefert Zahlen, aber es gibt keine Visualisierung. Wie viele Artikel pro Tag? Welche Quellen liefern am meisten? Trend uber die Zeit?

**Umsetzung Backend:**
- Neuer Endpoint: `GET /api/stats/history?days=30`
- Aggregiert: Artikel pro Tag, pro Kategorie, pro Quelle, pro Sentiment
- Neues DTO: `StatsHistory` mit Timeseries-Daten

**Umsetzung Frontend:**
- Neue Route: `#/stats`
- Charts mit recharts oder chart.js (leichtgewichtig):
  - Balkendiagramm: Artikel pro Tag (letzte 30 Tage)
  - Donut: Verteilung nach Kategorie
  - Stacked Bar: Sentiment pro Kategorie
  - Tabelle: Top-Quellen nach Artikelanzahl
- Responsive: 2-Spalten auf Desktop, 1-Spalte auf Mobile
- Dark/Light Theme-kompatibel

**Dateien:**
- `service/StatsHistoryService.java` (NEU)
- `controller/StatsController.java` — neuer Endpoint
- `model/dto/StatsHistory.java` (NEU)
- `pages/Stats.tsx` (NEU)
- `components/charts/` (NEU — 3-4 Chart-Komponenten)
- `package.json` — recharts Dependency

**Aufwand:** ~6h | **Impact:** Mittel — visuell beeindruckend, gut fur README/Showcase

---

### 5.2 Quellen-Vergleich

**Problem:** Nutzer sehen nicht, welche Quellen aktiv sind, wie oft sie liefern, oder ob eine Quelle offline ist.

**Umsetzung:**
- Neue Route: `#/sources`
- Pro Quelle: Name, URL, Sprache, Artikel-Count, letzter Fetch, Health-Status (gruen/gelb/rot)
- Sortierbar nach: Artikel-Count, letzter Fetch
- Link zum Original-Feed

**Dateien:**
- `pages/Sources.tsx` (NEU)
- `api/client.ts` — getFeeds() (GET /api/feeds existiert bereits)
- Feed-Response erweitern um Article-Count + Health

**Aufwand:** ~3h | **Impact:** Niedrig — Transparenz-Feature

---

## Phase 6 — Code-Qualitat & Wartbarkeit (LOW VISIBLE IMPACT, HIGH LONG-TERM VALUE)

### 6.1 Frontend-Tests (Vitest + Testing Library)

**Problem:** 0 Frontend-Tests. Backend hat 43 Tests, aber kein einziger Test prueft die React-Komponenten. Regressions werden nur per manueller Inspektion entdeckt.

**Umsetzung:**
- Vitest + @testing-library/react + jsdom Setup
- Prioritat:
  1. `useArticles` Hook — Fetch-Logik, Pagination, AbortController
  2. `useBookmarks` Hook — localStorage Read/Write
  3. `ArticleCard` — Rendering mit verschiedenen Article-Objekten (mit/ohne Summary, Tags, Sentiment)
  4. `CategoryFilter` — Click-Handler, aktiver State
  5. `SearchBar` — Debounce-Verhalten
  6. `App` — Integration: Route-Handling, Filter-Kombination
- Mock: `fetch` via MSW (Mock Service Worker) oder einfaches vi.fn()
- CI: `npm test` in GitHub Actions Workflow hinzufuegen

**Dateien:**
- `frontend/vitest.config.ts` (NEU)
- `frontend/src/test/setup.ts` (NEU)
- `frontend/src/__tests__/` (NEU — 6+ Testdateien)
- `.github/workflows/ci.yml` — npm test Step

**Aufwand:** ~6h | **Impact:** Nicht sichtbar fur Nutzer, aber kritisch fur Wartbarkeit

---

### 6.2 Error Boundary

**Problem:** Wenn eine React-Komponente crasht (z.B. unerwartetes API-Format), wird die gesamte App weiss. Kein Fallback, kein Error-Report.

**Umsetzung:**
- `ErrorBoundary` Klassen-Komponente (React Error Boundaries erfordern Class Components)
- Fallback-UI: "Etwas ist schiefgelaufen" + Retry-Button + Error-Details (Collapsible)
- Wrappen um `ArticleGrid` und um die gesamte App
- Optional: Error an Sentry/LogRocket senden (datenschutzfreundlich)

**Dateien:**
- `components/ErrorBoundary.tsx` (NEU)
- `App.tsx` — ErrorBoundary wrappen

**Aufwand:** ~1h | **Impact:** Niedrig (selten sichtbar), aber verhindert komplette App-Ausfalle

---

### 6.3 API-Client Typsicherheit

**Problem:** `api/client.ts` ist ein einfacher fetch-Wrapper ohne Typsicherheit. Fehlerhafte Responses werden nicht validiert.

**Umsetzung:**
- Zod-Schema-Validierung fur API-Responses (oder einfache Runtime-Checks)
- Typisierte Error-Responses: `ApiError` Klasse mit Status-Code + Message
- Retry-Logik: 1x Retry bei 5xx, kein Retry bei 4xx
- Request-Interceptor fur globales Error-Handling

**Dateien:**
- `api/client.ts` — erweitern
- `api/schemas.ts` (NEU — Zod Schemas, optional)

**Aufwand:** ~2h | **Impact:** Niedrig sichtbar, verbessert Debugging und Robustheit

---

## Phase 7 — Sharing & Community (LOW EFFORT, NICE-TO-HAVE)

### 7.1 Share-Buttons

**Problem:** Keine Moglichkeit, einen Artikel oder die App zu teilen. OG-Tags sind vorhanden, aber kein Share-Trigger.

**Umsetzung:**
- Web Share API (nativ auf Mobile): `navigator.share({ title, url })`
- Fallback (Desktop): Copy-to-Clipboard mit Bestatigung
- Share-Icon auf jeder Karte (neben "Lesen")
- "App teilen" Button im About-Modal

**Dateien:**
- `ArticleCard.tsx` — Share-Icon + Handler
- `AboutModal.tsx` — App-Share-Button

**Aufwand:** ~1h | **Impact:** Niedrig — aber kostet fast nichts und erhoht Verbreitung

---

### 7.2 Embed-Widget

**Problem:** Blogs/Websites konnen MaschinenPost-Artikel nicht einbinden.

**Umsetzung:**
- Statische JS-Datei: `embed.js` — rendert die letzten 5 Artikel als Widget
- Konfigurierbar: Kategorie-Filter, Anzahl, Theme
- iframe-Alternative fur einfache Integration
- Embed-Code-Generator im About-Modal

**Aufwand:** ~4h | **Impact:** Niedrig — Nischen-Feature, aber gut fur Open-Source-Reputation

---

## Zusammenfassung & Priorisierung

| # | Feature | Aufwand | Impact | Prioritat |
|---|---------|---------|--------|-----------|
| **1.1** | Lesezeichen (localStorage) | 2h | Hoch | **P1** |
| **1.2** | Gelesen-Markierung | 1.5h | Mittel | **P1** |
| **1.3** | Artikel-Detailansicht | 4h | Hoch | **P1** |
| **1.4** | Tastatur-Navigation | 3h | Mittel | **P2** |
| **2.1** | Trending/Nachrichten-Cluster | 6h | Sehr hoch | **P1** |
| **2.2** | Taglicher Digest | 8h | Hoch | **P2** |
| **2.3** | Content-Duplikaterkennung | 5h | Hoch | **P2** |
| **2.4** | RSS-Feed Output | 2h | Mittel | **P1** |
| **3.1** | Feed-Health-Monitoring | 2h | Mittel | **P1** |
| **3.2** | Artikel-Retention (Cleanup) | 1h | Mittel | **P1** |
| **3.3** | Health-Endpoint (Actuator) | 1.5h | Mittel | **P1** |
| **3.4** | Rate-Limiting /api/refresh | 30min | Niedrig-Mittel | **P2** |
| **4.1** | PWA (installierbar) | 3h | Hoch (Mobile) | **P2** |
| **4.2** | Push-Benachrichtigungen | 2-8h | Mittel | **P3** |
| **4.3** | Swipe-Gesten | 3h | Mittel | **P3** |
| **5.1** | Statistik-Dashboard | 6h | Mittel | **P2** |
| **5.2** | Quellen-Vergleich | 3h | Niedrig | **P3** |
| **6.1** | Frontend-Tests | 6h | Hoch (intern) | **P1** |
| **6.2** | Error Boundary | 1h | Niedrig | **P2** |
| **6.3** | API-Client Typsicherheit | 2h | Niedrig | **P3** |
| **7.1** | Share-Buttons | 1h | Niedrig | **P2** |
| **7.2** | Embed-Widget | 4h | Niedrig | **P3** |

### Empfohlene Reihenfolge (P1 zuerst)

**Sprint 1 — Basics:** 3.2, 3.3, 3.1, 2.4 (~6.5h)
- Artikel-Cleanup, Health-Check, Feed-Monitoring, RSS-Output
- Robustheit und Betrieb absichern

**Sprint 2 — UX:** 1.1, 1.2, 1.3 (~7.5h)
- Lesezeichen, Gelesen-Markierung, Artikel-Detail
- App wird "sticky" und nutzbar fur taeglichen Gebrauch

**Sprint 3 — Intelligence:** 2.1, 6.1 (~12h)
- Trending-Ansicht + Frontend-Tests
- Alleinstellungsmerkmal + Qualitat

**Sprint 4 — Polish:** 1.4, 4.1, 7.1, 6.2 (~8h)
- Keyboard-Nav, PWA, Share, Error Boundary
- Mobile-Erlebnis und Finish

**Sprint 5 — Advanced:** 2.2, 2.3, 5.1, 3.4 (~19.5h)
- Digest, Duplikaterkennung, Dashboard, Rate-Limiting
- Differenzierung und Skalierung
