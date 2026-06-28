<script setup lang="ts">
import { AdminLayout, toastService, CreateButton, EditButton, DeleteButton, IconButton } from '@admin'
import DataTable from '@admin/components/ui/dataTable/DataTable.vue'
import Label from '@admin/components/ui/Label.vue'
import ShowButton from '@admin/components/ui/button/ShowButton.vue'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { scraperService, type Scraper } from '../../services/scraperService'
import { scraperUrlService } from '../../services/scraperUrlService'

const route = useRoute()
const router = useRouter()
const table = ref()
const scrapers = ref<Scraper[]>([])
const selectedScraperId = ref<number | null>(null)
const downloadingId = ref<number | null>(null)

const fetchScrapers = async () => {
  try {
    const response = await scraperService.getAll({ per_page: 100, sort: 'name', direction: 'asc' })
    scrapers.value = response.data.data
  } catch (error) {
    console.error('Hiba a scraperek betöltésekor:', error)
  }
}

const deleteScraperUrl = async (id: number) => {
  try {
    await scraperUrlService.delete(id)
    toastService.success('Scraper URL sikeresen törölve!')
    table.value?.refresh()
  } catch (error) {
    console.error('Hiba a scraper URL törlésekor:', error)
    toastService.error('Hiba történt a törlés során.')
  }
}

const editScraperUrl = (id: number) => {
  router.push(`/admin/scraper-url/${id}/edit`)
}

const showScraperUrl = (id: number) => {
  router.push(`/admin/scraper-url/${id}`)
}

const downloadScraperUrl = async (id: number) => {
  try {
    downloadingId.value = id
    await scraperUrlService.download(id)
    toastService.success('URL letöltése elindítva!')
    table.value?.refresh()
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
      ref="table"
      url="/api/admin/scraper/scraper-urls"
      :extra-params="selectedScraperId ? { scraper_id: selectedScraperId } : {}"
    >
      <template #cell-ready="{ row }">
        <span v-if="(row as any).ready" class="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
          Kész
        </span>
        <span v-else class="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
          Várakozik
        </span>
      </template>

      <template #cell-url="{ row }">
        <a :href="(row as any).url" target="_blank" class="text-blue-600 hover:underline break-all block max-w-sm">
          {{ (row as any).url }}
        </a>
      </template>

      <template #cell-expiration_at="{ row }">
        <span class="text-sm">{{ formatDate((row as any).expiration_at) }}</span>
      </template>

      <template #cell-download="{ row }">
        <div class="flex items-center gap-1">
          <IconButton
            icon="Download"
            title="Letöltés"
            :disabled="downloadingId === (row as any).id"
            @click="downloadScraperUrl((row as any).id)"
          />
          <div class="relative group">
            <IconButton icon="Info" />
            <div
              v-if="(row as any).meta_data && Object.keys((row as any).meta_data).length"
              class="pointer-events-none absolute left-8 top-0 z-50 hidden w-150 rounded border border-slate-200 bg-white p-3 shadow-lg group-hover:block"
            >
              <p class="mb-1 text-xs font-semibold text-slate-600">Letöltött adatok</p>
              <dl class="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
                <div v-for="(value, key) in (row as any).meta_data" :key="String(key)" class="contents text-sm">
                  <dt class="whitespace-nowrap text-right font-bold text-slate-700">{{ key }}:</dt>
                  <dd class="break-all text-slate-800">{{ value }}</dd>
                </div>
              </dl>
            </div>
            <div
              v-else
              class="pointer-events-none absolute left-8 top-0 z-50 hidden w-48 rounded border border-slate-200 bg-white p-3 shadow-lg group-hover:block"
            >
              <p class="text-xs text-slate-400">Nincs letöltött adat.</p>
            </div>
          </div>
        </div>
      </template>

      <template #row-actions="{ row }">
        <ShowButton @click="showScraperUrl((row as any).id)" />
        <EditButton @click="editScraperUrl((row as any).id)" />
        <DeleteButton @confirm="deleteScraperUrl((row as any).id)" />
      </template>

      <template #empty>
        Nincs megjeleníthető scraper URL.
      </template>
    </DataTable>
  </AdminLayout>
</template>
