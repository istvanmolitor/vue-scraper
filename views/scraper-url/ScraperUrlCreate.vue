<script setup lang="ts">
import { AdminLayout, BackButton, FormButtons, InputError, LoadingSpinner, toastService } from '@admin'
import Card from '@admin/components/ui/Card.vue'
import CardContent from '@admin/components/ui/CardContent.vue'
import CardDescription from '@admin/components/ui/CardDescription.vue'
import CardFooter from '@admin/components/ui/CardFooter.vue'
import CardHeader from '@admin/components/ui/CardHeader.vue'
import CardTitle from '@admin/components/ui/CardTitle.vue'
import Input from '@admin/components/ui/Input.vue'
import Label from '@admin/components/ui/Label.vue'
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { scraperUrlService, type ScraperSelectItem, type ScraperUrlFormData } from '../../services/scraperUrlService'

const route = useRoute()
const router = useRouter()
const isLoading = ref(true)
const isSaving = ref(false)
const errors = ref<Record<string, string[]>>({})
const scrapers = ref<ScraperSelectItem[]>([])

const form = reactive<ScraperUrlFormData>({
  scraper_id: 0,
  type: 'page',
  url: '',
  priority: 0,
  expiration_at: null,
})

const fetchCreateData = async () => {
  try {
    isLoading.value = true
    const response = await scraperUrlService.getCreateData()
    scrapers.value = response.data.scrapers

    const queryScraperId = route.query.scraper_id
    if (typeof queryScraperId === 'string' && queryScraperId !== '' && !Number.isNaN(Number(queryScraperId))) {
      form.scraper_id = Number(queryScraperId)
    } else if (scrapers.value.length > 0) {
      form.scraper_id = scrapers.value[0].id
    }

    form.priority = response.data.defaults.priority
  } catch (error) {
    console.error('Hiba az űrlap adatok betöltésekor:', error)
    toastService.error('Nem sikerült betölteni az űrlap adatait.')
  } finally {
    isLoading.value = false
  }
}

const handleSubmit = async () => {
  try {
    isSaving.value = true
    errors.value = {}

    const response: any = await scraperUrlService.create(form)
    toastService.success('Scraper URL sikeresen létrehozva!')

    const createdId = response?.data?.data?.id ?? response?.data?.id ?? response?.id

    if (createdId !== undefined && createdId !== null) {
      await router.push({
        name: 'scraper-url-edit',
        params: { id: String(createdId) },
      })
      return
    }

    router.push('/admin/scraper-url')
  } catch (error: any) {
    console.error('Hiba a scraper URL létrehozásakor:', error)
    if (error.response?.status === 422) {
      errors.value = error.response.data.errors
      toastService.error('Kérjük, javítsd a hibaüzeneteket.')
    } else {
      toastService.error('Hiba történt a mentés során.')
    }
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  fetchCreateData()
})
</script>

<template>
  <AdminLayout pageTitle="Új scraper URL">
    <div class="flex items-center justify-end space-y-2 mb-4">
      <BackButton to="/admin/scraper-url" />
    </div>

    <div v-if="isLoading" class="flex justify-center py-8"><LoadingSpinner label="Betöltés..." /></div>

    <Card v-else>
      <CardHeader>
        <CardTitle>Scraper URL adatok</CardTitle>
        <CardDescription>Add meg az új scraper URL adatait a létrehozáshoz.</CardDescription>
      </CardHeader>

      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label for="scraper_id">Scraper</Label>
          <select
            id="scraper_id"
            v-model="form.scraper_id"
            class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option v-for="scraper in scrapers" :key="scraper.id" :value="scraper.id">
              {{ scraper.name }} ({{ scraper.base_url }})
            </option>
          </select>
          <InputError :message="errors.scraper_id" />
        </div>

        <div class="space-y-2">
          <Label for="url">URL</Label>
          <Input id="url" v-model="form.url" placeholder="https://example.com/path" />
          <InputError :message="errors.url" />
        </div>

        <div class="space-y-2">
          <Label for="type">Típus</Label>
          <Input id="type" v-model="form.type" placeholder="page" />
          <InputError :message="errors.type" />
        </div>

        <div class="space-y-2">
          <Label for="priority">Prioritás</Label>
          <Input id="priority" v-model="form.priority" type="number" min="0" max="100000" />
          <InputError :message="errors.priority" />
        </div>

        <div class="space-y-2">
          <Label for="expiration_at">Lejárat</Label>
          <Input id="expiration_at" v-model="form.expiration_at" type="datetime-local" />
          <InputError :message="errors.expiration_at" />
        </div>
      </CardContent>

      <CardFooter>
        <FormButtons
          :is-saving="isSaving"
          @save="handleSubmit"
          @cancel="router.push('/admin/scraper-url')"
        />
      </CardFooter>
    </Card>
  </AdminLayout>
</template>
