# MaschinenPost

[![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)](https://github.com/pepperonas/maschinen-post/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff.svg)](https://vitejs.dev/)
[![Claude API](https://img.shields.io/badge/Claude%20API-Sonnet%204-cc785c.svg)](https://docs.anthropic.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3.45-003b57.svg)](https://www.sqlite.org/)
[![GitHub](https://img.shields.io/github/stars/pepperonas/maschinen-post?style=social)](https://github.com/pepperonas/maschinen-post)
[![GitHub last commit](https://img.shields.io/github/last-commit/pepperonas/maschinen-post)](https://github.com/pepperonas/maschinen-post/commits/main)
[![GitHub repo size](https://img.shields.io/github/repo-size/pepperonas/maschinen-post)](https://github.com/pepperonas/maschinen-post)

Dark, industrial-styled AI & Robotics news aggregator with automated content fetching and Claude-powered German-language summarization.

## Screenshots

### Live Feed — Dark Industrial UI
![MaschinenPost Dark Theme](docs/screenshot-dark.png)

### AI-Powered Summaries with Category Filtering
![MaschinenPost AI Summaries](docs/screenshot-ai.png)

## Features

- **RSS Feed Aggregation** — Fetches from 5 major AI/Robotics sources every 30 minutes
- **AI Summarization** — Claude API generates concise German summaries, tags, categories, and sentiment analysis
- **Industrial Dark UI** — Brutalist design with IBM Plex Mono, subtle grid textures, and electric yellow accents
- **Category Filtering** — Filter by KI-Modelle, Robotik, Regulierung, Startups, Forschung, Hardware, Tools
- **Full-Text Search** — Debounced search across titles and AI summaries
- **Live Updates** — 30s polling with "Neue Artikel" notification banner
- **Sentiment Analysis** — Visual indicators (&#9650; positiv, &#9679; neutral, &#9660; kritisch) per article
- **Dark/Light Mode** — Theme toggle with localStorage persistence
- **Responsive** — Mobile-first design with dense 3-column card grid

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 18 + TypeScript + Tailwind CSS |
| Backend  | Spring Boot 3.2 (Java 17)          |
| AI       | Claude API (claude-sonnet-4-20250514)     |
| Database | SQLite (dev) / PostgreSQL (prod)    |
| RSS      | Rome (Java RSS parser)              |
| Build    | Vite (frontend) + Maven (backend)   |

## RSS Sources

| Source | Feed |
|--------|------|
| Google AI Blog | `feeds.feedburner.com/blogspot/gJZg` |
| OpenAI Blog | `openai.com/blog/rss.xml` |
| The Verge AI | `theverge.com/rss/ai-artificial-intelligence/index.xml` |
| TechCrunch AI | `techcrunch.com/category/artificial-intelligence/feed/` |
| MIT AI News | `news.mit.edu/topic/mitartificial-intelligence2-rss.xml` |

## Prerequisites

- Java 17+
- Maven 3.9+
- Node.js 18+
- npm 9+
- Claude API key (optional, for AI summaries)

## Setup

### Backend

```bash
cd backend

# Run with default settings (no AI summaries)
mvn spring-boot:run

# Run with Claude API for AI-powered summaries
CLAUDE_API_KEY=sk-ant-your-key-here mvn spring-boot:run
```

The backend starts on `http://localhost:8080`. On first launch it:
1. Seeds the RSS feed sources in the database
2. Fetches articles from all feeds
3. Processes articles with Claude AI (if API key is set)
4. Repeats every 30 minutes

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on `http://localhost:5173` with API proxy to the backend.

### Production Build

```bash
# Build frontend
cd frontend
npm run build

# Build backend
cd backend
mvn clean package

# Run the JAR
java -jar target/maschinenpost-0.0.1.jar
```

## API Endpoints

| Method | Path                  | Description                       |
|--------|-----------------------|-----------------------------------|
| GET    | `/api/articles`       | Paginated articles (query params: `page`, `size`, `category`, `search`, `sort`) |
| GET    | `/api/articles/{id}`  | Single article                    |
| GET    | `/api/feeds`          | List active RSS sources           |
| POST   | `/api/feeds`          | Add new RSS source                |
| GET    | `/api/stats`          | Dashboard statistics              |
| POST   | `/api/refresh`        | Trigger manual feed refresh       |

## Configuration

Environment variables:

| Variable        | Default | Description                    |
|-----------------|---------|--------------------------------|
| `CLAUDE_API_KEY` | (none)  | Anthropic API key for summaries |
| `SERVER_PORT`   | 8080    | Backend server port            |

Application config in `backend/src/main/resources/application.yml`.

## License

This project is licensed under the [MIT License](LICENSE).

## Author

**Martin Pfeffer** — [celox.io](https://celox.io) — [GitHub](https://github.com/pepperonas)

---

&copy; 2026 Martin Pfeffer | [celox.io](https://celox.io)
