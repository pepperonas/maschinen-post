export interface Article {
  id: number
  title: string
  url: string
  source: string
  language: string
  publishedAt: string
  rawContent: string | null
  summary: string | null
  tags: string[]
  category: string | null
  sentiment: string | null
  duplicateOfId: number | null
  processed: boolean
  createdAt: string
  updatedAt: string
}

export interface ArticlesPage {
  content: Article[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  last: boolean
  first: boolean
}

export interface Feed {
  id: number
  name: string
  url: string
  language: string
  active: boolean
  failCount: number
  lastError: string | null
  disabledAt: string | null
  lastFetchedAt: string | null
  createdAt: string
}

export interface Stats {
  totalArticles: number
  processedArticles: number
  totalFeeds: number
  lastUpdate: string | null
  articlesPerCategory: Record<string, number>
}

export interface StatsHistory {
  articlesPerSource: Record<string, number>
  sentimentDistribution: Record<string, number>
  totalInPeriod: number
  days: number
}

export interface TrendingTopic {
  topic: string
  category: string
  articleCount: number
  articles: Article[]
  latestAt: string | null
}

export interface DigestResponse {
  period: string
  from: string
  to: string
  totalArticles: number
  sections: Record<string, Article[]>
}

export const CATEGORIES = [
  'Alle',
  'KI-Modelle',
  'Robotik',
  'Regulierung',
  'Startups',
  'Forschung',
  'Hardware',
  'Tools',
] as const

export type Category = (typeof CATEGORIES)[number]
