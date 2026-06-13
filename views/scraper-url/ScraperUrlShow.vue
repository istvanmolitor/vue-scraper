<script setup lang="ts">
import { AdminLayout, BackButton, DeleteButton, EditButton, IconButton, LoadingSpinner, toastService } from '@admin'
import Card from '@admin/components/ui/Card.vue'
import CardContent from '@admin/components/ui/CardContent.vue'
import CardDescription from '@admin/components/ui/CardDescription.vue'
import CardHeader from '@admin/components/ui/CardHeader.vue'
import CardTitle from '@admin/components/ui/CardTitle.vue'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { scraperUrlService, type ScraperUrl } from '../../services/scraperUrlService'

const route = useRoute()
const router = useRouter()
const scraperUrl = ref<ScraperUrl | null>(null)
const isLoading = ref(true)
const isDownloading = ref(false)

const formatDate = (value: string | null): string => {
  if (!value) {
    return '-'
  }

  return new Date(value).toLocaleString('hu-HU')
}

const metaDataJson = computed((): string => {
  if (!scraperUrl.value?.meta_data) {
    return '-'
  }

  try {
    return JSON.stringify(scraperUrl.value.meta_data, null, 2)
  } catch {
    return '-'
  }
})

const fetchScraperUrl = async (): Promise<void> => {
  const id = route.params.id as string

  try {
    isLoading.value = true
    const response = await scraperUrlService.getById(id)
    scraperUrl.value = response.data.data
  } catch (error) {
    console.error('Hiba a scraper URL betoltese soran:', error)
    toastService.error('Nem sikerult betolteni a scraper URL adatait.')
    router.push('/admin/scraper-url')
  } finally {
    isLoading.value = false
  }
}

const downloadScraperUrl = async (): Promise<void> => {
  if (!scraperUrl.value) {
    return
  }

  try {
    isDownloading.value = true
    await scraperUrlService.download(scraperUrl.value.id)
    toastService.success('URL letoltese elinditva!')
    await fetchScraperUrl()
  } catch (error) {
    console.error('Hiba az URL letoltes inditasakor:', error)
    toastService.error('Hiba tortent a letoltes inditasakor.')
  } finally {
    isDownloading.value = false
  }
}

const deleteScraperUrl = async (): Promise<void> => {
  if (!scraperUrl.value) {
    return
  }

  try {
    await scraperUrlService.delete(scraperUrl.value.id)
    toastService.success('Scraper URL sikeresen torolve.')
    router.push('/admin/scraper-url')
  } catch (error) {
    console.error('Hiba a scraper URL torlesekor:', error)
    toastService.error('Hiba tortent a torles soran.')
  }
}

onMounted(async () => {
  await fetchScraperUrl()
})
</script>

<template>
  <AdminLayout pageTitle="Scraper URL megtekintese">
    <div class="mb-4 flex items-center justify-between gap-2">
      <BackButton to="/admin/scraper-url" />

      <div v-if="scraperUrl" class="flex items-center gap-2">
        <IconButton
          icon="Download"
          title="Letoltes"
          :disabled="isDownloading"
          @click="downloadScraperUrl"
        />
        <EditButton :to="`/admin/scraper-url/${scraperUrl.id}/edit`" />
        <DeleteButton @confirm="deleteScraperUrl" />
      </div>
    </div>

    <div v-if="isLoading" class="flex justify-center py-8">
      <LoadingSpinner label="Betoltes..." />
    </div>

    <Card v-else-if="scraperUrl">
      <CardHeader>
        <CardTitle>Scraper URL #{{ scraperUrl.id }}</CardTitle>
        <CardDescription>Rogzitett URL reszletes adatai</CardDescription>
      </CardHeader>

      <CardContent class="space-y-6">
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <p class="text-xs text-muted-foreground">Scraper</p>
            <p class="font-medium">{{ scraperUrl.scraper?.name ?? '-' }}</p>
          </div>

          <div>
            <p class="text-xs text-muted-foreground">Tipus</p>
            <p class="font-medium">{{ scraperUrl.type ?? '-' }}</p>
          </div>

          <div>
            <p class="text-xs text-muted-foreground">Prioritas</p>
            <p class="font-medium">{{ scraperUrl.priority ?? '-' }}</p>
          </div>

          <div>
            <p class="text-xs text-muted-foreground">Allapot</p>
            <p class="font-medium" :class="scraperUrl.ready ? 'text-green-600' : 'text-amber-600'">
              {{ scraperUrl.ready ? 'Kesz' : 'Varakozik' }}
            </p>
          </div>

          <div>
            <p class="text-xs text-muted-foreground">Szulo URL ID</p>
            <p class="font-medium">{{ scraperUrl.parent_id ?? '-' }}</p>
          </div>

          <div>
            <p class="text-xs text-muted-foreground">Letoltve</p>
            <p class="font-medium">{{ formatDate(scraperUrl.downloaded_at) }}</p>
          </div>

          <div>
            <p class="text-xs text-muted-foreground">Lejarat</p>
            <p class="font-medium">{{ formatDate(scraperUrl.expiration_at) }}</p>
          </div>

          <div>
            <p class="text-xs text-muted-foreground">Letrehozva</p>
            <p class="font-medium">{{ formatDate(scraperUrl.created_at) }}</p>
          </div>

          <div>
            <p class="text-xs text-muted-foreground">Frissitve</p>
            <p class="font-medium">{{ formatDate(scraperUrl.updated_at) }}</p>
          </div>
        </div>

        <div>
          <p class="mb-1 text-xs text-muted-foreground">URL</p>
          <a
            :href="scraperUrl.url"
            target="_blank"
            rel="noopener noreferrer"
            class="break-all text-sm font-medium text-blue-600 hover:underline"
          >
            {{ scraperUrl.url }}
          </a>
        </div>

        <div>
          <p class="mb-1 text-xs text-muted-foreground">Meta adatok</p>
          <pre class="max-h-80 overflow-auto rounded-md border border-slate-200 bg-slate-50 p-3 text-xs">{{ metaDataJson }}</pre>
        </div>
      </CardContent>
    </Card>
  </AdminLayout>
</template>
