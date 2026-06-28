<script setup lang="ts">
import { AdminLayout, toastService, CreateButton, EditButton, DeleteButton, IconButton } from '@admin'
import DataTable from '@admin/components/ui/dataTable/DataTable.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { scraperService } from '../../services/scraperService'

const router = useRouter()
const table = ref()

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
    table.value?.refresh()
  } catch (error) {
    console.error('Hiba a scraper törlésekor:', error)
    toastService.error('Hiba történt a törlés során.')
  }
}
</script>

<template>
  <AdminLayout pageTitle="Scraperek">
    <DataTable
      ref="table"
      url="/api/admin/scraper/scrapers"
    >
      <template #actions>
        <CreateButton to="/admin/scraper/create">Új scraper</CreateButton>
      </template>

      <template #cell-enabled="{ row }">
        <span v-if="(row as any).enabled" class="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
          Aktív
        </span>
        <span v-else class="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
          Inaktív
        </span>
      </template>

      <template #cell-base_url="{ row }">
        <a :href="(row as any).base_url" target="_blank" class="text-blue-600 hover:underline truncate block max-w-md">
          {{ (row as any).base_url }}
        </a>
      </template>

      <template #row-actions="{ row }">
        <IconButton icon="Link" title="URL-ek" @click="openUrls((row as any).id)" />
        <EditButton @click="editScraper((row as any).id)" />
        <DeleteButton @confirm="deleteScraper((row as any).id)" />
      </template>

      <template #empty>
        Nincs megjeleníthető scraper.
      </template>
    </DataTable>
  </AdminLayout>
</template>
