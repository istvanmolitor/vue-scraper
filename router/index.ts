import type { RouteRecordRaw } from 'vue-router'

const scraperRoutes: RouteRecordRaw[] = [
  {
    path: '/admin/scraper',
    name: 'scrapers',
    component: () => import('../views/scraper/ScraperIndex.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/scraper/create',
    name: 'scraper-create',
    component: () => import('../views/scraper/ScraperCreate.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/scraper/:id/edit',
    name: 'scraper-edit',
    component: () => import('../views/scraper/ScraperEdit.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/scraper-url',
    name: 'scraper-urls',
    component: () => import('../views/scraper-url/ScraperUrlIndex.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/scraper-url/create',
    name: 'scraper-url-create',
    component: () => import('../views/scraper-url/ScraperUrlCreate.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/scraper-url/:id/edit',
    name: 'scraper-url-edit',
    component: () => import('../views/scraper-url/ScraperUrlEdit.vue'),
    meta: { requiresAuth: true }
  },
]

export default scraperRoutes
