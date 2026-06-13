<script setup lang="ts">
import { AdminLayout, toastService, CreateButton, EditButton, DeleteButton, IconButton } from '@admin'
import DataTable, { type Column, type PaginationMeta } from '@admin/components/ui/dataTable/DataTable.vue'
import Label from '@admin/components/ui/Label.vue'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { scraperService, type Scraper } from '../../services/scraperService'
import { scraperUrlService, type ScraperUrl } from '../../services/scraperUrlService'

const route = useRoute()
const router = useRouter()
const scraperUrls = ref<ScraperUrl[]>([])
const scrapers = ref<Scraper[]>([])
const selectedScraperId = ref<number | null>(null)
const isLoading = ref(false)
const downloadingId = ref<number | null>(null)
const pagination = ref<PaginationMeta>({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
})

const columns: Column<ScraperUrl>[] = [
  { key: 'id', label: 'ID', sortable: true, width: '80px' },
  { key: 'type', label: 'Típus', sortable: true, width: '120px' },
  { key: 'url', label: 'URL', sortable: false },
  { key: 'priority', label: 'Prioritás', sortable: true, width: '120px' },
  { key: 'ready', label: 'Állapot', sortable: true, width: '120px' },
  { key: 'expiration_at', label: 'Lejárat', sortable: true, width: '180px' },
]

const fetchScrapers = async () => {
  try {
    const response = await scraperService.getAll({ per_page: 100, sort: 'name', direction: 'asc' })
    scrapers.value = response.data.data
  } catch (error) {
    console.error('Hiba a scraperek betöltésekor:', error)
  }
}

const fetchScraperUrls = async (params: {
  search?: string
  sort?: string
  direction?: 'asc' | 'desc'
  page?: number
}) => {
  try {
    isLoading.value = true

    const requestParams: {
      search?: string
      sort?: string
      direction?: string
      page?: number
      scraper_id?: number
    } = {
      ...params,
    }

    if (selectedScraperId.value) {
      requestParams.scraper_id = selectedScraperId.value
    }

    const response = await scraperUrlService.getAll(requestParams)
    scraperUrls.value = response.data.data
    pagination.value = response.data.meta
  } catch (error) {
    console.error('Hiba a scraper URL-ek betöltésekor:', error)
  } finally {
    isLoading.value = false
  }
}

const deleteScraperUrl = async (id: number) => {
  try {
    await scraperUrlService.delete(id)
    toastService.success('Scraper URL sikeresen törölve!')
    await fetchScraperUrls({ page: pagination.value.current_page })
  } catch (error) {
    console.error('Hiba a scraper URL törlésekor:', error)
    toastService.error('Hiba történt a törlés során.')
  }
}

const editScraperUrl = (id: number) => {
  router.push(`/admin/scraper-url/${id}/edit`)
}

const downloadScraperUrl = async (id: number) => {
  try {
    downloadingId.value = id
    await scraperUrlService.download(id)
    toastService.success('URL letöltése elindítva!')
    await fetchScraperUrls({ page: pagination.value.current_page })
  } catch (error) {
    console.error('Hiba az URL letöltésekor:', error)
    toastService.error('Hiba történt a letöltés indításakor.')
  } finally {
    downloadingId.value = null
  }
}

const changeScraperFilter = async () => {
  const query: Record<string, string> = {}
  if (selectedScraperId.value) {
    query.scraper_id = String(selectedScraperId.value)
  }

  await router.replace({
    path: '/admin/scraper-url',
    query,
  })

  fetchScraperUrls({ page: 1, sort: 'id', direction: 'desc' })
}

const formatDate = (dateString: string | null) => {
  if (!dateString) {
    return '-'
  }

  return new Date(dateString).toLocaleString('hu-HU')
}

onMounted(async () => {
  const queryScraperId = route.query.scraper_id
  if (typeof queryScraperId === 'string' && queryScraperId !== '' && !Number.isNaN(Number(queryScraperId))) {
    selectedScraperId.value = Number(queryScraperId)
  }

  await fetchScrapers()
  fetchScraperUrls({ page: 1, sort: 'id', direction: 'desc' })
})
</script>

<template>
  <AdminLayout pageTitle="Scraper URL-ek">
    <div class="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div class="w-full md:max-w-xs">
        <Label for="scraper-filter">Szűrés scraper szerint</Label>
        <select
          id="scraper-filter"
          v-model="selectedScraperId"
          class="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm"
          @change="changeScraperFilter"
        >
          <option :value="null">Összes scraper</option>
          <option v-for="scraper in scrapers" :key="scraper.id" :value="scraper.id">
            {{ scraper.name }}
          </option>
        </select>
      </div>

      <div class="flex gap-2">
        <CreateButton
          :to="selectedScraperId ? `/admin/scraper-url/create?scraper_id=${selectedScraperId}` : '/admin/scraper-url/create'"
        >
          Új URL
        </CreateButton>

        <a
          :href="scraperUrlService.exportCsv(selectedScraperId ?? undefined)"
          class="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          CSV export
        </a>
      </div>
    </div>

    <DataTable
      :columns="columns"
      :data="scraperUrls"
      :loading="isLoading"
      :pagination="pagination"
      search-placeholder="Keresés URL vagy típus alapján..."
      default-sort="id"
      default-direction="desc"
      @fetch="fetchScraperUrls"
    >
      <template #cell-ready="{ row }">
        <span v-if="row.ready" class="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
          Kész
        </span>
        <span v-else class="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
          Várakozik
        </span>
      </template>

      <template #cell-url="{ row }">
        <a :href="row.url" target="_blank" class="text-blue-600 hover:underline truncate block max-w-xl">
          {{ row.url }}
        </a>
      </template>

      <template #cell-expiration_at="{ row }">
        <span class="text-sm">{{ formatDate(row.expiration_at) }}</span>
      </template>

      <template #row-actions="{ row }">
        <IconButton
          icon="Download"
          title="Letöltés"
          :disabled="downloadingId === row.id"
          @click="downloadScraperUrl(row.id)"
        />
        <EditButton @click="editScraperUrl(row.id)" />
        <DeleteButton @confirm="deleteScraperUrl(row.id)" />
      </template>

      <template #empty>
        Nincs megjeleníthető scraper URL.
      </template>
    </DataTable>
  </AdminLayout>
</template>
