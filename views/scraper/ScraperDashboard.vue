<script setup lang="ts">
import { AdminLayout, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Icon, LoadingSpinner, StatsCard, StatusBadge, toastService } from '@admin'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { scraperService, type Scraper, type ScraperDashboardSummary } from '../../services/scraperService'

const router = useRouter()
const scrapers = ref<Scraper[]>([])
const isLoading = ref(false)
const summary = ref<ScraperDashboardSummary>({
  total_scrapers: 0,
  active_scrapers: 0,
  inactive_scrapers: 0,
  blocked_scrapers: 0,
  total_urls: 0,
  worker_enabled: false,
  worker_limit: 0,
})

const blockedScrapers = computed(() => scrapers.value.filter((scraper) => scraper.status === 'blocked'))
const inactiveScrapers = computed(() => scrapers.value.filter((scraper) => scraper.status === 'inactive'))

const fetchDashboard = async () => {
  try {
    isLoading.value = true
    const response = await scraperService.getDashboard()
    scrapers.value = response.data.data
    summary.value = response.data.summary
  } catch (error) {
    console.error('Hiba a scraper dashboard betöltésekor:', error)
    toastService.error('A scraper dashboard betöltése sikertelen.')
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dateString: string | null) => {
  if (!dateString) {
    return 'Nincs blokk'
  }

  return new Date(dateString).toLocaleString('hu-HU')
}

const openScrapers = () => {
  router.push('/admin/scraper')
}

const openScraperUrls = (scraperId?: number) => {
  if (scraperId) {
    router.push({
      path: '/admin/scraper-url',
      query: { scraper_id: String(scraperId) },
    })

    return
  }

  router.push('/admin/scraper-url')
}

const editScraper = (scraperId: number) => {
  router.push(`/admin/scraper/${scraperId}/edit`)
}

onMounted(() => {
  fetchDashboard()
})
</script>

<template>
  <AdminLayout pageTitle="Scraper dashboard">
    <div class="space-y-6">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 class="text-2xl font-semibold tracking-tight text-foreground">Állapot áttekintés</h2>
          <p class="text-sm text-muted-foreground">
            A scraper worker és az összes konfigurált scraper pillanatnyi állapota.
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <Button variant="outline" @click="openScrapers">
            <Icon name="List" class="h-4 w-4" />
            Scraperek
          </Button>

          <Button variant="outline" @click="openScraperUrls()">
            <Icon name="Link" class="h-4 w-4" />
            URL-ek
          </Button>

          <Button :disabled="isLoading" @click="fetchDashboard">
            <Icon name="RefreshCcw" class="h-4 w-4" />
            Frissítés
          </Button>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatsCard title="Összes scraper" :value="summary.total_scrapers" description="Konfigurált források" icon="Bot" color="blue" />
        <StatsCard title="Aktív" :value="summary.active_scrapers" description="Futtatható scraperek" icon="BadgeCheck" color="green" />
        <StatsCard title="Blokkolt" :value="summary.blocked_scrapers" description="Ideiglenesen várakoznak" icon="Clock3" color="orange" />
        <StatsCard title="URL-ek" :value="summary.total_urls" description="Összes ismert scraper URL" icon="Link" color="blue" />
        <StatsCard
          title="Worker limit"
          :value="summary.worker_limit"
          :description="summary.worker_enabled ? 'A worker jelenleg fut.' : 'A worker jelenleg leállított.'"
          icon="Gauge"
          :color="summary.worker_enabled ? 'green' : 'orange'"
        />
      </div>

      <div v-if="isLoading && scrapers.length === 0" class="flex min-h-64 items-center justify-center rounded-xl border bg-card">
        <LoadingSpinner class="h-8 w-8" />
      </div>

      <div v-else class="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Scraper állapotok</CardTitle>
            <CardDescription>
              Gyors állapotnézet scraperenként. Innen közvetlenül megnyitható a szerkesztés és a kapcsolódó URL lista.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div v-if="scrapers.length === 0" class="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              Nincs megjeleníthető scraper.
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="scraper in scrapers"
                :key="scraper.id"
                class="flex flex-col gap-4 rounded-xl border border-border/70 bg-background/70 p-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div class="min-w-0 space-y-2">
                  <div class="flex flex-wrap items-center gap-2">
                    <h3 class="text-base font-semibold text-foreground">{{ scraper.name }}</h3>
                    <StatusBadge :status="scraper.status" />
                  </div>

                  <a :href="scraper.base_url" target="_blank" class="block truncate text-sm text-blue-600 hover:underline">
                    {{ scraper.base_url }}
                  </a>

                  <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span>{{ scraper.scraper_urls_count ?? 0 }} URL</span>
                    <span>Csomagméret: {{ scraper.chunk_size }}</span>
                    <span>Robots.txt: {{ scraper.robots_txt ? 'igen' : 'nem' }}</span>
                    <span>Követ linkeket: {{ scraper.follow_links ? 'igen' : 'nem' }}</span>
                  </div>

                  <p v-if="scraper.is_blocked" class="text-sm text-orange-700 dark:text-orange-400">
                    Blokkolva eddig: {{ formatDate(scraper.blocked) }}
                  </p>
                  <p v-else class="text-sm text-muted-foreground">
                    Utolsó módosítás: {{ formatDate(scraper.updated_at) }}
                  </p>
                </div>

                <div class="flex flex-wrap gap-2">
                  <Button variant="outline" @click="openScraperUrls(scraper.id)">
                    <Icon name="Link" class="h-4 w-4" />
                    URL-ek
                  </Button>
                  <Button variant="outline" @click="editScraper(scraper.id)">
                    <Icon name="Pencil" class="h-4 w-4" />
                    Szerkesztés
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div class="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Worker állapot</CardTitle>
              <CardDescription>
                A háttérben futó scraper worker globális állapota.
              </CardDescription>
            </CardHeader>

            <CardContent class="space-y-4">
              <div class="flex items-center justify-between rounded-lg border border-border/70 px-4 py-3">
                <div>
                  <p class="text-sm font-medium text-foreground">Worker</p>
                  <p class="text-xs text-muted-foreground">Feldolgozási limit: {{ summary.worker_limit }}</p>
                </div>
                <StatusBadge :status="summary.worker_enabled ? 'active' : 'inactive'" />
              </div>

              <div class="rounded-lg border border-border/70 px-4 py-3 text-sm text-muted-foreground">
                <p>Aktív scraperek: {{ summary.active_scrapers }}</p>
                <p>Inaktív scraperek: {{ summary.inactive_scrapers }}</p>
                <p>Blokkolt scraperek: {{ summary.blocked_scrapers }}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Figyelmet igényel</CardTitle>
              <CardDescription>
                Azok a scraperek, amelyek jelenleg nem futtathatók azonnal.
              </CardDescription>
            </CardHeader>

            <CardContent class="space-y-4">
              <div>
                <div class="mb-2 flex items-center gap-2">
                  <Icon name="Clock3" class="h-4 w-4 text-orange-600" />
                  <p class="text-sm font-medium text-foreground">Blokkolt</p>
                </div>

                <div v-if="blockedScrapers.length === 0" class="text-sm text-muted-foreground">Nincs blokkolt scraper.</div>
                <div v-else class="space-y-2">
                  <div v-for="scraper in blockedScrapers" :key="`blocked-${scraper.id}`" class="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 dark:border-orange-950 dark:bg-orange-950/30">
                    <p class="text-sm font-medium text-foreground">{{ scraper.name }}</p>
                    <p class="text-xs text-muted-foreground">Feloldás ideje: {{ formatDate(scraper.blocked) }}</p>
                  </div>
                </div>
              </div>

              <div>
                <div class="mb-2 flex items-center gap-2">
                  <Icon name="PauseCircle" class="h-4 w-4 text-slate-500" />
                  <p class="text-sm font-medium text-foreground">Inaktív</p>
                </div>

                <div v-if="inactiveScrapers.length === 0" class="text-sm text-muted-foreground">Nincs inaktív scraper.</div>
                <div v-else class="space-y-2">
                  <div v-for="scraper in inactiveScrapers" :key="`inactive-${scraper.id}`" class="rounded-lg border border-border/70 px-3 py-2">
                    <p class="text-sm font-medium text-foreground">{{ scraper.name }}</p>
                    <p class="text-xs text-muted-foreground">{{ scraper.scraper_urls_count ?? 0 }} kapcsolt URL</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>