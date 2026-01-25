<script setup>
import { ref, computed, onMounted } from 'vue'
import { Link } from '@inertiajs/vue3'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { ArrowLeft, TrendingUp, Users, Clock, Eye, MousePointer } from 'lucide-vue-next'
import owl from '@/owl-sdk.js'

const props = defineProps({
  auth: Object,
  projectSlug: String,
})

const project = ref(null)
const analytics = ref(null)
const loading = ref(true)
const selectedPeriod = ref(30)

const periods = [
  { value: 7, label: '7 jours' },
  { value: 30, label: '30 jours' },
  { value: 90, label: '90 jours' },
]

const loadProject = async () => {
  try {
    const response = await owl.projects.get(props.projectSlug)
    project.value = response
  } catch (error) {
    console.error('Failed to load project:', error)
  }
}

const loadAnalytics = async () => {
  try {
    loading.value = true
    const response = await owl.analytics.getProjectAnalytics(props.projectSlug, selectedPeriod.value)
    analytics.value = response
  } catch (error) {
    console.error('Failed to load analytics:', error)
  } finally {
    loading.value = false
  }
}

const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (minutes === 0) return `${remainingSeconds}s`
  return `${minutes}m ${remainingSeconds}s`
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short'
  })
}

// Compute max value for chart scaling
const maxViews = computed(() => {
  if (!analytics.value?.views_over_time) return 0
  return Math.max(...analytics.value.views_over_time.map(d => d.views), 1)
})

const chartHeight = 200

onMounted(async () => {
  await loadProject()
  await loadAnalytics()
})
</script>

<template>
  <DashboardLayout :auth="auth" :project="project">
    <div class="mx-auto max-w-7xl">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-8">
        <Link :href="`/dashboard/projects/${projectSlug}`">
          <Button variant="ghost" size="icon">
            <ArrowLeft class="w-5 h-5" />
          </Button>
        </Link>
        <div class="flex-1">
          <h1 class="font-bold text-zinc-900 dark:text-zinc-100 text-3xl">Statistiques</h1>
          <p class="mt-1 text-zinc-600 dark:text-zinc-400">{{ project?.name || 'Chargement...' }}</p>
        </div>
        <div class="flex gap-2">
          <Button
            v-for="period in periods"
            :key="period.value"
            :variant="selectedPeriod === period.value ? 'default' : 'outline'"
            size="sm"
            @click="selectedPeriod = period.value; loadAnalytics()"
          >
            {{ period.label }}
          </Button>
        </div>
      </div>

      <!-- Warning for non-public projects -->
      <div v-if="!project?.is_public" class="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <p class="text-amber-800 dark:text-amber-200 text-sm">
          Les statistiques ne sont disponibles que pour les projets publics. Rendez votre projet public dans les paramètres pour commencer à collecter des données.
        </p>
      </div>

      <LoadingSpinner v-if="loading" />

      <div v-else-if="analytics">
        <!-- Overview Cards -->
        <div class="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader class="flex flex-row justify-between items-center space-y-0 pb-2">
              <CardTitle class="font-medium text-sm">Vues totales</CardTitle>
              <TrendingUp class="w-4 h-4 text-zinc-500" />
            </CardHeader>
            <CardContent>
              <div class="font-bold text-2xl">{{ analytics.overview.total_views }}</div>
              <p class="text-muted-foreground text-xs">
                {{ analytics.overview.unique_visitors }} visiteurs uniques
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader class="flex flex-row justify-between items-center space-y-0 pb-2">
              <CardTitle class="font-medium text-sm">Visiteurs uniques</CardTitle>
              <Users class="w-4 h-4 text-zinc-500" />
            </CardHeader>
            <CardContent>
              <div class="font-bold text-2xl">{{ analytics.overview.unique_visitors }}</div>
              <p class="text-muted-foreground text-xs">
                Sur {{ selectedPeriod }} jours
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader class="flex flex-row justify-between items-center space-y-0 pb-2">
              <CardTitle class="font-medium text-sm">Durée moyenne</CardTitle>
              <Clock class="w-4 h-4 text-zinc-500" />
            </CardHeader>
            <CardContent>
              <div class="font-bold text-2xl">{{ formatDuration(analytics.overview.avg_duration_seconds) }}</div>
              <p class="text-muted-foreground text-xs">
                Par session
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader class="flex flex-row justify-between items-center space-y-0 pb-2">
              <CardTitle class="font-medium text-sm">Interactions</CardTitle>
              <MousePointer class="w-4 h-4 text-zinc-500" />
            </CardHeader>
            <CardContent>
              <div class="font-bold text-2xl">{{ analytics.overview.total_hotspot_clicks }}</div>
              <p class="text-muted-foreground text-xs">
                Clics sur hotspots
              </p>
            </CardContent>
          </Card>
        </div>

        <!-- Views Chart -->
        <Card class="mb-8">
          <CardHeader>
            <CardTitle>Vues dans le temps</CardTitle>
            <CardDescription>Nombre de vues et visiteurs uniques par jour</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="relative" :style="{ height: chartHeight + 'px' }">
              <!-- Y-axis labels -->
              <div class="absolute left-0 top-0 bottom-0 flex flex-col justify-between pr-2 text-right text-xs text-zinc-500">
                <span>{{ maxViews }}</span>
                <span>{{ Math.floor(maxViews / 2) }}</span>
                <span>0</span>
              </div>

              <!-- Chart area -->
              <div class="ml-12 h-full flex items-end gap-1">
                <div
                  v-for="(day, index) in analytics.views_over_time"
                  :key="index"
                  class="flex-1 flex flex-col justify-end gap-1 group relative"
                >
                  <!-- Bars -->
                  <div
                    class="bg-purple-500 rounded-t transition-all hover:bg-purple-600"
                    :style="{ height: (day.views / maxViews * (chartHeight - 40)) + 'px' }"
                  ></div>

                  <!-- Tooltip -->
                  <div class="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 text-xs rounded shadow-lg whitespace-nowrap pointer-events-none transition-opacity z-10">
                    <div class="font-semibold">{{ formatDate(day.date) }}</div>
                    <div>{{ day.views }} vues</div>
                    <div>{{ day.unique_visitors }} visiteurs</div>
                  </div>
                </div>
              </div>

              <!-- X-axis labels (show every 7th day) -->
              <div class="ml-12 mt-2 flex justify-between text-xs text-zinc-500">
                <span v-for="(day, index) in analytics.views_over_time" :key="index">
                  <span v-if="index % 7 === 0">{{ formatDate(day.date) }}</span>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Details Tabs -->
        <Tabs default-value="images" class="w-full">
          <TabsList class="grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="images">
              <Eye class="mr-2 w-4 h-4" />
              Images les plus vues
            </TabsTrigger>
            <TabsTrigger value="hotspots">
              <MousePointer class="mr-2 w-4 h-4" />
              Hotspots les plus cliqués
            </TabsTrigger>
          </TabsList>

          <TabsContent value="images" class="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Images les plus vues</CardTitle>
                <CardDescription>Top 10 des images panoramiques</CardDescription>
              </CardHeader>
              <CardContent>
                <div v-if="analytics.most_viewed_images.length > 0" class="space-y-4">
                  <div
                    v-for="(item, index) in analytics.most_viewed_images"
                    :key="item.image?.id || index"
                    class="flex items-center gap-4 p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Badge variant="secondary" class="shrink-0 w-8 h-8 flex items-center justify-center">
                      {{ index + 1 }}
                    </Badge>
                    <div class="flex-1 min-w-0">
                      <p class="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {{ item.image?.name || 'Sans nom' }}
                      </p>
                      <p class="text-zinc-500 dark:text-zinc-400 text-sm">
                        {{ item.view_count }} vues
                      </p>
                    </div>
                    <div class="shrink-0 w-24 h-16 bg-zinc-100 dark:bg-zinc-800 rounded overflow-hidden">
                      <img
                        v-if="item.image?.slug"
                        :src="`/images/${item.image.slug}/download`"
                        :alt="item.image.name"
                        class="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
                <div v-else class="py-12 text-center text-zinc-500">
                  Aucune donnée disponible
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hotspots" class="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Hotspots les plus cliqués</CardTitle>
                <CardDescription>Top 10 des points de navigation</CardDescription>
              </CardHeader>
              <CardContent>
                <div v-if="analytics.most_clicked_hotspots.length > 0" class="space-y-4">
                  <div
                    v-for="(item, index) in analytics.most_clicked_hotspots"
                    :key="item.hotspot?.id || index"
                    class="flex items-center gap-4 p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Badge variant="secondary" class="shrink-0 w-8 h-8 flex items-center justify-center">
                      {{ index + 1 }}
                    </Badge>
                    <div class="flex-1">
                      <p class="font-medium text-zinc-900 dark:text-zinc-100">
                        Hotspot #{{ item.hotspot?.id || '?' }}
                      </p>
                      <p class="text-zinc-500 dark:text-zinc-400 text-sm">
                        {{ item.click_count }} clics
                      </p>
                    </div>
                  </div>
                </div>
                <div v-else class="py-12 text-center text-zinc-500">
                  Aucune donnée disponible
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  </DashboardLayout>
</template>
