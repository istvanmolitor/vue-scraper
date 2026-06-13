import { createApiClient } from '@user/services/apiClient'

const api = createApiClient()

export interface ScraperUrl {
  id: number
  scraper_id: number
  type: string | null
  url: string
  priority: number | null
  parent_id: number | null
  downloaded_at: string | null
  expiration_at: string | null
  meta_data: Record<string, unknown> | null
  created_at: string
  updated_at: string
  ready: boolean
  scraper?: {
    id: number
    name: string
    base_url: string
  }
}

export interface ScraperUrlFormData {
  scraper_id: number
  type?: string
  url: string
  priority?: number
  expiration_at?: string | null
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
    scraper_id?: number | null
  }
}

export interface SingleResponse<T> {
  data: T
}

export interface ScraperSelectItem {
  id: number
  name: string
  base_url: string
}

export const scraperUrlService = {
  getAll(params?: {
    search?: string
    sort?: string
    direction?: string
    page?: number
    per_page?: number
    scraper_id?: number
  }) {
    return api.get<PaginatedResponse<ScraperUrl>>('/api/admin/scraper/scraper-urls', { params })
  },

  getCreateData() {
    return api.get<{ scrapers: ScraperSelectItem[]; defaults: { priority: number } }>('/api/admin/scraper/scraper-urls/create')
  },

  getById(id: number | string) {
    return api.get<SingleResponse<ScraperUrl>>(`/api/admin/scraper/scraper-urls/${id}`)
  },

  getEditData(id: number | string) {
    return api.get<{ data: ScraperUrl; scrapers: ScraperSelectItem[] }>(`/api/admin/scraper/scraper-urls/${id}/edit`)
  },

  create(payload: ScraperUrlFormData) {
    return api.post<SingleResponse<ScraperUrl>>('/api/admin/scraper/scraper-urls', payload)
  },

  update(id: number | string, payload: { type?: string; priority?: number; expiration_at?: string | null }) {
    return api.put<SingleResponse<ScraperUrl>>(`/api/admin/scraper/scraper-urls/${id}`, payload)
  },

  delete(id: number | string) {
    return api.delete(`/api/admin/scraper/scraper-urls/${id}`)
  },

  download(id: number | string) {
    return api.post(`/api/admin/scraper/scraper-urls/${id}/download`)
  },

  bulkDownload(ids: number[]) {
    return api.post('/api/admin/scraper/scraper-urls/bulk-download', { ids })
  },

  exportCsv(scraperId?: number) {
    const params = new URLSearchParams()
    if (scraperId) {
      params.set('scraper_id', String(scraperId))
    }

    const query = params.toString()
    return `/api/admin/scraper/scraper-urls/export${query ? `?${query}` : ''}`
  },
}
