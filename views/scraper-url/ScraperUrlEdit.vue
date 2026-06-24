<script setup lang="ts">
import { AdminLayout, BackButton, FormButtons, InputError, LoadingSpinner, toastService } from '@admin'
import Card from '@admin/components/ui/Card.vue'
import CardContent from '@admin/components/ui/CardContent.vue'
import CardDescription from '@admin/components/ui/CardDescription.vue'
import CardFooter from '@admin/components/ui/CardFooter.vue'
import CardHeader from '@admin/components/ui/CardHeader.vue'
import CardTitle from '@admin/components/ui/CardTitle.vue'
import InputField from '@admin/components/ui/InputField.vue'
import Label from '@admin/components/ui/Label.vue'
import Input from '@admin/components/ui/Input.vue'
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { scraperUrlService } from '../../services/scraperUrlService'

const route = useRoute()
const router = useRouter()
const isLoading = ref(true)
const isSaving = ref(false)
const errors = ref<Record<string, string[]>>({})
const scraperName = ref('')
const url = ref('')

const form = reactive<{
  type: string
  priority: number | null
  expiration_at: string | null
}>({
  type: 'page',
  priority: 0,
  expiration_at: null,
})

const toDatetimeLocal = (value: string | null): string | null => {
  if (!value) {
    return null
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return null
  }

  const pad = (num: number) => String(num).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const fetchScraperUrl = async () => {
  const id = route.params.id as string

  try {
    isLoading.value = true
    const response = await scraperUrlService.getEditData(id)
    const scraperUrl = response.data.data

    form.type = scraperUrl.type ?? 'page'
    form.priority = scraperUrl.priority ?? 0
    form.expiration_at = toDatetimeLocal(scraperUrl.expiration_at)

    scraperName.value = scraperUrl.scraper?.name ?? '-'
    url.value = scraperUrl.url
  } catch (error) {
    console.error('Hiba a scraper URL betöltésekor:', error)
    router.push('/admin/scraper-url')
  } finally {
    isLoading.value = false
  }
}

const handleSubmit = async () => {
  const id = route.params.id as string

  try {
    isSaving.value = true
    errors.value = {}

    await scraperUrlService.update(id, form)
    toastService.success('Scraper URL sikeresen frissítve!')
    router.push('/admin/scraper-url')
  } catch (error: any) {
    console.error('Hiba a scraper URL mentésekor:', error)
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
  fetchScraperUrl()
})
</script>

<template>
  <AdminLayout pageTitle="Scraper URL szerkesztése">
    <div class="flex items-center justify-end space-y-2 mb-4">
      <BackButton to="/admin/scraper-url" />
    </div>

    <div v-if="isLoading" class="flex justify-center py-8"><LoadingSpinner label="Betöltés..." /></div>

    <Card v-else>
      <CardHeader>
        <CardTitle>Scraper URL adatok</CardTitle>
        <CardDescription>Módosítsd az URL feldolgozási adatait.</CardDescription>
      </CardHeader>

      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label for="scraper_name">Scraper</Label>
          <Input id="scraper_name" :model-value="scraperName" readonly />
        </div>

        <div class="space-y-2">
          <Label for="url">URL</Label>
          <Input id="url" :model-value="url" readonly />
        </div>

        <InputField id="type" label="Típus" v-model="form.type" :errors="errors.type" />

        <div class="space-y-2">
          <Label for="priority">Prioritás</Label>
          <Input id="priority" v-model="form.priority" type="number" min="0" max="100000" />
          <InputError :message="errors.priority" />
        </div>

        <InputField id="expiration_at" label="Lejárat" v-model="form.expiration_at" :type="'datetime-local'" :errors="errors.expiration_at" />
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
