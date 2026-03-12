<script setup>
import { computed } from 'vue'
import { Link, router } from '@inertiajs/vue3'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, TrendingUp, Users, Clock, Eye, MousePointer } from 'lucide-vue-next'
import { useDateTime } from '@/composables'

const props = defineProps({
  auth: Object,
  project: Object,
  analytics: Object,
  selectedPeriod: {
    type: Number,
    default: 30,
  },
})

const { formatDate } = useDateTime()

const periods = [
  { value: 7, label: '7 jours' },
  { value: 30, label: '30 jours' },
  { value: 90, label: '90 jours' },
]

const changePeriod = (days) => {
  router.get(`/dashboard/projects/${props.project.slug}/analytics`, { days }, {
    preserveState: true,
    preserveScroll: true,
  })
}

const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (minutes === 0) return `${remainingSeconds}s`
  return `${minutes}m ${remainingSeconds}s`
}

const formatChartDate = (dateString) => {
  return formatDate(dateString, { day: 'numeric', month: 'short' })
}

// Compute max value for chart scaling
const maxViews = computed(() => {
  if (!props.analytics?.views_over_time) return 0
  return Math.max(...props.analytics.views_over_time.map(d => d.views), 1)
})

const chartHeight = 200
</script>

<template>
  <DashboardLayout :auth="auth" :project="project">
    <div class="mx-auto max-w-7xl">
      <!-- Header -->
      <div class="mb-6 md:mb-8 space-y-4">
        <div class="flex items-center gap-4">
          <Link :href="`/dashboard/projects/${project?.slug}`">
            <Button variant="ghost" size="icon">
              <ArrowLeft class="w-5 h-5" />
            </Button>
          </Link>
          <div class="flex-1 min-w-0">
            <h1 class="font-bold text-foreground text-2xl md:text-3xl">Statistiques</h1>
            <p class="mt-1 text-muted-foreground truncate">{{ project?.name }}</p>
          </div>
        </div>
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="period in periods"
            :key="period.value"
            :variant="selectedPeriod === period.value ? 'default' : 'outline'"
            size="sm"
            @click="changePeriod(period.value)"
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

      <div v-if="analytics">
        <!-- Overview Cards -->
        <div class="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader class="flex flex-row justify-between items-center space-y-0 pb-2">
              <CardTitle class="font-medium text-sm">Vues totales</CardTitle>
              <TrendingUp class="w-4 h-4 text-muted-foreground" />
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
              <Users class="w-4 h-4 text-muted-foreground" />
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
              <Clock class="w-4 h-4 text-muted-foreground" />
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
              <MousePointer class="w-4 h-4 text-muted-foreground" />
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
              <div class="absolute left-0 top-0 bottom-0 flex flex-col justify-between pr-2 text-right text-xs text-muted-foreground">
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
                  <div class="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-foreground text-background text-xs rounded shadow-lg whitespace-nowrap pointer-events-none transition-opacity z-10">
                    <div class="font-semibold">{{ formatChartDate(day.date) }}</div>
                    <div>{{ day.views }} vues</div>
                    <div>{{ day.unique_visitors }} visiteurs</div>
                  </div>
                </div>
              </div>

              <!-- X-axis labels (show every 7th day) -->
              <div class="ml-12 mt-2 flex justify-between text-xs text-muted-foreground">
                <span v-for="(day, index) in analytics.views_over_time" :key="index">
                  <span v-if="index % 7 === 0">{{ formatChartDate(day.date) }}</span>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Details Tabs -->
        <Tabs default-value="images" class="w-full">
          <TabsList class="grid grid-cols-2 w-full max-w-full sm:max-w-md">
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
                    class="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Badge variant="secondary" class="shrink-0 w-8 h-8 flex items-center justify-center">
                      {{ index + 1 }}
                    </Badge>
                    <div class="flex-1 min-w-0">
                      <p class="font-medium text-foreground truncate">
                        {{ item.image?.name || 'Sans nom' }}
                      </p>
                      <p class="text-muted-foreground text-sm">
                        {{ item.view_count }} vues
                      </p>
                    </div>
                    <div class="shrink-0 w-24 h-16 bg-muted rounded overflow-hidden">
                      <img
                        v-if="item.image?.slug"
                        :src="`/images/${item.image.slug}/download`"
                        :alt="item.image.name"
                        class="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
                <div v-else class="py-12 text-center text-muted-foreground">
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
                    class="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Badge variant="secondary" class="shrink-0 w-8 h-8 flex items-center justify-center">
                      {{ index + 1 }}
                    </Badge>
                    <div class="flex-1">
                      <p class="font-medium text-foreground">
                        Hotspot #{{ item.hotspot?.id || '?' }}
                      </p>
                      <p class="text-muted-foreground text-sm">
                        {{ item.click_count }} clics
                      </p>
                    </div>
                  </div>
                </div>
                <div v-else class="py-12 text-center text-muted-foreground">
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
