# MaschinenPost

Dark, industrial-styled AI & Robotics news aggregator with automated content fetching and Claude-powered German-language summarization.

## Features

- **RSS Feed Aggregation** — Fetches from 5 major AI/Robotics sources every 30 minutes
- **AI Summarization** — Claude API generates concise German summaries, tags, categories, and sentiment
- **Industrial Dark UI** — Brutalist design with IBM Plex Mono, grid textures, and electric yellow accents
- **Search & Filter** — Full-text search across titles and summaries, category filtering
- **Live Updates** — Polling for new articles with notification banner
- **Dark/Light Mode** — Theme toggle with localStorage persistence
- **Responsive** — Mobile-first design with dense card grid

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

- Google AI Blog
- OpenAI Blog
- The Verge AI
- TechCrunch AI
- MIT AI News

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

# Build backend (optionally copy frontend build to static resources)
cd backend
mvn clean package

# Run the JAR
java -jar target/maschinenpost-1.0.0.jar
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

MIT

---

&copy; 2026 Martin Pfeffer | [celox.io](https://celox.io)
