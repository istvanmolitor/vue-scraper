<script setup lang="ts">
import { AdminLayout, toastService, CreateButton, EditButton, DeleteButton, IconButton } from '@admin'
import DataTable, { type Column, type PaginationMeta } from '@admin/components/ui/dataTable/DataTable.vue'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { scraperService, type Scraper } from '../../services/scraperService'

const router = useRouter()
const scrapers = ref<Scraper[]>([])
const isLoading = ref(false)
const pagination = ref<PaginationMeta>({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
})

const columns = ref<Column[]>([])

const fetchScrapers = async (params: {
  search?: string
  sort?: string
  direction?: 'asc' | 'desc'
  page?: number
}) => {
  try {
    isLoading.value = true
    const response = await scraperService.getAll(params)
    scrapers.value = response.data.data
    pagination.value = response.data.meta
    columns.value = (response.data.columns ?? []) as Column[]
  } catch (error) {
    console.error('Hiba a scraperek betöltésekor:', error)
  } finally {
    isLoading.value = false
  }
}

const editScraper = (id: number) => {
  router.push(`/admin/scraper/${id}/edit`)
}

const openUrls = (id: number) => {
  router.push({
    path: '/admin/scraper-url',
    query: { scraper_id: String(id) },
  })
}

const deleteScraper = async (id: number) => {
  try {
    await scraperService.delete(id)
    toastService.success('Scraper sikeresen törölve!')
    await fetchScrapers({ page: pagination.value.current_page })
  } catch (error) {
    console.error('Hiba a scraper törlésekor:', error)
    toastService.error('Hiba történt a törlés során.')
  }
}

onMounted(() => {
  fetchScrapers({ page: 1, sort: 'id', direction: 'desc' })
})
</script>

<template>
  <AdminLayout pageTitle="Scraperek">
    <DataTable
      :columns="columns"
      :data="scrapers"
      :loading="isLoading"
      :pagination="pagination"
      search-placeholder="Keresés név vagy URL alapján..."
      default-sort="id"
      default-direction="desc"
      @fetch="fetchScrapers"
    >
      <template #actions>
        <CreateButton to="/admin/scraper/create">Új scraper</CreateButton>
      </template>

      <template #cell-enabled="{ row }">
        <span v-if="row.enabled" class="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
          Aktív
        </span>
        <span v-else class="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
          Inaktív
        </span>
      </template>

      <template #cell-base_url="{ row }">
        <a :href="row.base_url" target="_blank" class="text-blue-600 hover:underline truncate block max-w-md">
          {{ row.base_url }}
        </a>
      </template>

      <template #row-actions="{ row }">
        <IconButton icon="Link" title="URL-ek" @click="openUrls(row.id)" />
        <EditButton @click="editScraper(row.id)" />
        <DeleteButton @confirm="deleteScraper(row.id)" />
      </template>

      <template #empty>
        Nincs megjeleníthető scraper.
      </template>
    </DataTable>
  </AdminLayout>
</template>
