import { createApiClient } from '@user/services/apiClient'

const api = createApiClient()

export type ScraperStatus = 'active' | 'inactive' | 'blocked'

export interface Scraper {
  id: number
  name: string
  base_url: string
  enabled: boolean
  robots_txt: boolean
  follow_links: boolean
  chunk_size: number
  blocked: string | null
  is_blocked: boolean
  status: ScraperStatus
  created_at: string
  updated_at: string
  scraper_urls_count?: number
  downloaded_urls_count?: number
}

export interface ScraperDashboardSummary {
  total_scrapers: number
  active_scrapers: number
  inactive_scrapers: number
  blocked_scrapers: number
  total_urls: number
  worker_enabled: boolean
  worker_limit: number
}

export interface ScraperFormData {
  name: string
  base_url?: string
  enabled: boolean
  robots_txt: boolean
  follow_links: boolean
  chunk_size: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  filters?: {
    search?: string
    sort?: string
    direction?: string
  }
  columns?: Array<{ key: string; label: string; sortable: boolean }>
}

export interface SingleResponse<T> {
  data: T
}

export interface ScraperDashboardResponse {
  summary: ScraperDashboardSummary
  data: Scraper[]
}

export const scraperService = {
  getAll(params?: { search?: string; sort?: string; direction?: string; page?: number; per_page?: number }) {
    return api.get<PaginatedResponse<Scraper>>('/api/admin/scraper/scrapers', { params })
  },

  getDashboard() {
    return api.get<ScraperDashboardResponse>('/api/admin/scraper/scrapers/dashboard')
  },

  getCreateData() {
    return api.get<{ defaults: Omit<ScraperFormData, 'name' | 'base_url'> }>('/api/admin/scraper/scrapers/create')
  },

  getById(id: number | string) {
    return api.get<SingleResponse<Scraper>>(`/api/admin/scraper/scrapers/${id}`)
  },

  getEditData(id: number | string) {
    return api.get<SingleResponse<Scraper>>(`/api/admin/scraper/scrapers/${id}/edit`)
  },

  create(payload: ScraperFormData) {
    return api.post<SingleResponse<Scraper>>('/api/admin/scraper/scrapers', payload)
  },

  update(id: number | string, payload: Omit<ScraperFormData, 'base_url'>) {
    return api.put<SingleResponse<Scraper>>(`/api/admin/scraper/scrapers/${id}`, payload)
  },

  delete(id: number | string) {
    return api.delete(`/api/admin/scraper/scrapers/${id}`)
  },
}
