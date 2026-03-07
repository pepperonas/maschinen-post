import type { Article, ArticlesPage, DigestResponse, Feed, Stats, StatsHistory, TrendingTopic } from './types'

const BASE = '/api'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options)
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  }
  return res.json()
}

export async function fetchArticles(params: {
  page?: number
  size?: number
  category?: string
  search?: string
  sort?: string
  language?: string
}): Promise<ArticlesPage> {
  const sp = new URLSearchParams()
  if (params.page !== undefined) sp.set('page', String(params.page))
  if (params.size !== undefined) sp.set('size', String(params.size))
  if (params.category && params.category !== 'Alle')
    sp.set('category', params.category)
  if (params.search) sp.set('search', params.search)
  if (params.sort) sp.set('sort', params.sort)
  if (params.language) sp.set('language', params.language)
  return request<ArticlesPage>(`${BASE}/articles?${sp}`)
}

export async function fetchArticle(id: number): Promise<Article> {
  return request<Article>(`${BASE}/articles/${id}`)
}

export async function fetchFeeds(): Promise<Feed[]> {
  return request<Feed[]>(`${BASE}/feeds`)
}

export async function fetchStats(): Promise<Stats> {
  return request<Stats>(`${BASE}/stats`)
}

export async function fetchStatsHistory(days = 30): Promise<StatsHistory> {
  return request<StatsHistory>(`${BASE}/stats/history?days=${days}`)
}

export async function fetchTrending(hours = 48): Promise<TrendingTopic[]> {
  return request<TrendingTopic[]>(`${BASE}/articles/trending?hours=${hours}`)
}

export async function fetchDigest(period = 'daily'): Promise<DigestResponse> {
  return request<DigestResponse>(`${BASE}/articles/digest?period=${period}`)
}

export async function refreshFeeds(): Promise<{ message: string }> {
  return request<{ message: string }>(`${BASE}/refresh`, { method: 'POST' })
}

export async function reactivateFeed(id: number): Promise<Feed> {
  return request<Feed>(`${BASE}/feeds/${id}/reactivate`, { method: 'POST' })
}
