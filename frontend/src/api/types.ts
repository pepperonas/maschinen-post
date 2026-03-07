export interface Article {
  id: number
  title: string
  url: string
  source: string
  publishedAt: string
  rawContent: string | null
  summary: string | null
  tags: string[]
  category: string | null
  sentiment: string | null
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
  active: boolean
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
