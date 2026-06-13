import { createApiClient } from '@user/services/apiClient'

const api = createApiClient()

export interface Scraper {
  id: number
  name: string
  base_url: string
  enabled: boolean
  robots_txt: boolean
  follow_links: boolean
  chunk_size: number
  blocked: string | null
  created_at: string
  updated_at: string
  scraper_urls_count?: number
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
}

export interface SingleResponse<T> {
  data: T
}

export const scraperService = {
  getAll(params?: { search?: string; sort?: string; direction?: string; page?: number; per_page?: number }) {
    return api.get<PaginatedResponse<Scraper>>('/api/admin/scraper/scrapers', { params })
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
