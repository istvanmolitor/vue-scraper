<script setup lang="ts">
import { AdminLayout, BackButton, FormButtons, InputError, LoadingSpinner, toastService } from '@admin'
import Card from '@admin/components/ui/Card.vue'
import CardContent from '@admin/components/ui/CardContent.vue'
import CardDescription from '@admin/components/ui/CardDescription.vue'
import CardFooter from '@admin/components/ui/CardFooter.vue'
import CardHeader from '@admin/components/ui/CardHeader.vue'
import CardTitle from '@admin/components/ui/CardTitle.vue'
import Checkbox from '@admin/components/ui/Checkbox.vue'
import Input from '@admin/components/ui/Input.vue'
import Label from '@admin/components/ui/Label.vue'
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
  enabled: true,
  robots_txt: true,
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
      await router.push({
        name: 'scraper-edit',
        params: { id: String(createdScraperId) },
      })
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
        <div class="space-y-2">
          <Label for="name">Név</Label>
          <Input id="name" v-model="form.name" placeholder="Példa scraper" />
          <InputError :message="errors.name" />
        </div>

        <div class="space-y-2">
          <Label for="base_url">Alap URL</Label>
          <Input id="base_url" v-model="form.base_url" placeholder="https://example.com" />
          <InputError :message="errors.base_url" />
        </div>

        <div class="space-y-2">
          <Label for="chunk_size">Csomagméret</Label>
          <Input id="chunk_size" v-model="form.chunk_size" type="number" min="1" max="100000" />
          <InputError :message="errors.chunk_size" />
        </div>

        <div class="flex items-center space-x-2">
          <Checkbox id="enabled" v-model="form.enabled" />
          <Label for="enabled" class="cursor-pointer">Engedélyezve</Label>
        </div>

        <div class="flex items-center space-x-2">
          <Checkbox id="robots_txt" v-model="form.robots_txt" />
          <Label for="robots_txt" class="cursor-pointer">Robots.txt figyelembevétele</Label>
        </div>

        <div class="flex items-center space-x-2">
          <Checkbox id="follow_links" v-model="form.follow_links" />
          <Label for="follow_links" class="cursor-pointer">Linkek követése</Label>
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
