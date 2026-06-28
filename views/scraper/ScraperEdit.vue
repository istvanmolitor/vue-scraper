<script setup lang="ts">
import { AdminLayout, BackButton, FormButtons, InputError, LoadingSpinner, toastService } from '@admin'
import Card from '@admin/components/ui/Card.vue'
import CardContent from '@admin/components/ui/CardContent.vue'
import CardDescription from '@admin/components/ui/CardDescription.vue'
import CardFooter from '@admin/components/ui/CardFooter.vue'
import CardHeader from '@admin/components/ui/CardHeader.vue'
import CardTitle from '@admin/components/ui/CardTitle.vue'
import Checkbox from '@admin/components/ui/Checkbox.vue'
import InputField from '@admin/components/ui/InputField.vue'
import Label from '@admin/components/ui/Label.vue'
import Input from '@admin/components/ui/Input.vue'
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { scraperService, type ScraperFormData } from '../../services/scraperService'

const route = useRoute()
const router = useRouter()
const isLoading = ref(true)
const isSaving = ref(false)
const errors = ref<Record<string, string[]>>({})
const baseUrl = ref('')

const form = reactive<Omit<ScraperFormData, 'base_url'>>({
  name: '',
  enabled: true,
  robots_txt: true,
  follow_links: false,
  chunk_size: 1000,
})

const fetchScraper = async () => {
  const id = route.params.id as string

  try {
    isLoading.value = true
    const response = await scraperService.getEditData(id)
    const scraper = response.data.data

    form.name = scraper.name
    form.enabled = scraper.enabled
    form.robots_txt = scraper.robots_txt
    form.follow_links = scraper.follow_links
    form.chunk_size = scraper.chunk_size
    baseUrl.value = scraper.base_url
  } catch (error) {
    console.error('Hiba a scraper betöltésekor:', error)
    router.push('/admin/scraper')
  } finally {
    isLoading.value = false
  }
}

const handleSubmit = async () => {
  const id = route.params.id as string

  try {
    isSaving.value = true
    errors.value = {}

    await scraperService.update(id, form)
    toastService.success('Scraper sikeresen frissítve!')
    router.push(`/admin/scraper-url?scraper_id=${id}`)
  } catch (error: any) {
    console.error('Hiba a scraper mentésekor:', error)
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
  fetchScraper()
})
</script>

<template>
  <AdminLayout pageTitle="Scraper szerkesztése">
    <div class="flex items-center justify-end space-y-2 mb-4">
      <BackButton to="/admin/scraper" />
    </div>

    <div v-if="isLoading" class="flex justify-center py-8"><LoadingSpinner label="Betöltés..." /></div>

    <Card v-else>
      <CardHeader>
        <CardTitle>Scraper adatok</CardTitle>
        <CardDescription>Módosítsd a scraper adatait.</CardDescription>
      </CardHeader>

      <CardContent class="space-y-4">
        <InputField id="name" label="Név" v-model="form.name" :errors="errors.name" />

        <div class="space-y-2">
          <Label for="base_url">Alap URL</Label>
          <Input id="base_url" :model-value="baseUrl" readonly />
        </div>

        <div class="space-y-2">
          <Label for="chunk_size">Csomagméret</Label>
          <Input id="chunk_size" v-model="form.chunk_size" type="number" min="1" max="100000" />
          <InputError :message="errors.chunk_size" />
        </div>

        <div class="flex items-center space-x-2">
          <Checkbox id="enabled" v-model="form.enabled" />
          <Label for="enabled" variant="checkbox">Engedélyezve</Label>
        </div>

        <div class="flex items-center space-x-2">
          <Checkbox id="robots_txt" v-model="form.robots_txt" />
          <Label for="robots_txt" variant="checkbox">Robots.txt figyelembevétele</Label>
        </div>

        <div class="flex items-center space-x-2">
          <Checkbox id="follow_links" v-model="form.follow_links" />
          <Label for="follow_links" variant="checkbox">Linkek követése</Label>
        </div>
      </CardContent>

      <CardFooter>
        <FormButtons
          :is-saving="isSaving"
          @save="handleSubmit"
          @cancel="router.push('/admin/scraper')"
        />
      </CardFooter>
    </Card>
  </AdminLayout>
</template>
