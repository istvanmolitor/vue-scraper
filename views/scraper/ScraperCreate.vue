<script setup lang="ts">
import { AdminLayout, BackButton, FormButtons, LoadingSpinner, toastService } from '@admin'
import Card from '@admin/components/ui/Card.vue'
import CardContent from '@admin/components/ui/CardContent.vue'
import CardDescription from '@admin/components/ui/CardDescription.vue'
import CardFooter from '@admin/components/ui/CardFooter.vue'
import CardHeader from '@admin/components/ui/CardHeader.vue'
import CardTitle from '@admin/components/ui/CardTitle.vue'
import CheckboxField from '@admin/components/ui/CheckboxField.vue'
import InputField from '@admin/components/ui/InputField.vue'
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { scraperService, type ScraperFormData } from '../../services/scraperService'

const router = useRouter()
const isLoading = ref(true)
const isSaving = ref(false)
const errors = ref<Record<string, string[]>>({})

const form = reactive<ScraperFormData>({
  name: '',
  base_url: '',
  enabled: false,
  robots_txt: false,
  follow_links: false,
  chunk_size: 1000,
})

const fetchDefaults = async () => {
  try {
    isLoading.value = true
    const response = await scraperService.getCreateData()
    const defaults = response.data.defaults
    form.enabled = defaults.enabled
    form.robots_txt = defaults.robots_txt
    form.follow_links = defaults.follow_links
    form.chunk_size = defaults.chunk_size
  } catch (error) {
    console.error('Hiba az alapértékek betöltésekor:', error)
  } finally {
    isLoading.value = false
  }
}

const handleSubmit = async () => {
  try {
    isSaving.value = true
    errors.value = {}

    const response: any = await scraperService.create(form)
    toastService.success('Scraper sikeresen létrehozva!')

    const createdScraperId = response?.data?.data?.id ?? response?.data?.id ?? response?.id

    if (createdScraperId !== undefined && createdScraperId !== null) {
      await router.push(`/admin/scraper-url?scraper_id=${createdScraperId}`)
      return
    }

    router.push('/admin/scraper')
  } catch (error: any) {
    console.error('Hiba a scraper létrehozásakor:', error)
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
  fetchDefaults()
})
</script>

<template>
  <AdminLayout pageTitle="Új scraper">
    <div class="flex items-center justify-end space-y-2 mb-4">
      <BackButton to="/admin/scraper" />
    </div>

    <div v-if="isLoading" class="flex justify-center py-8"><LoadingSpinner label="Betöltés..." /></div>

    <Card v-else>
      <CardHeader>
        <CardTitle>Scraper adatok</CardTitle>
        <CardDescription>Add meg az új scraper adatait a létrehozáshoz.</CardDescription>
      </CardHeader>

      <CardContent class="space-y-4">
        <InputField id="name" label="Név" v-model="form.name" placeholder="Példa scraper" :errors="errors.name" />

        <InputField id="base_url" label="Alap URL" v-model="form.base_url" placeholder="https://example.com" :errors="errors.base_url" />

        <InputField id="chunk_size" label="Csomagméret" v-model="form.chunk_size" type="number" min="1" max="100000" :errors="errors.chunk_size" />

        <CheckboxField id="enabled" label="Engedélyezve" v-model="form.enabled" />

        <CheckboxField id="robots_txt" label="Robots.txt figyelembevétele" v-model="form.robots_txt" />

        <CheckboxField id="follow_links" label="Linkek követése" v-model="form.follow_links" />
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
