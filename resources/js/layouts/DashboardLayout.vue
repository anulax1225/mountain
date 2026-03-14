<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Menu, ChevronUp, ChevronDown } from 'lucide-vue-next'
import ThemeToggle from '@/components/ThemeToggle.vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import { useHeaderVisibility } from '@/composables'

const props = defineProps({
  auth: Object,
  project: Object,
  scene: Object,
  collapsibleHeader: {
    type: Boolean,
    default: false
  }
})

const mobileQuery = typeof window !== 'undefined' ? window.matchMedia('(max-width: 1023px)') : null
const isMobile = ref(mobileQuery?.matches ?? false)

const onMediaChange = (e) => { isMobile.value = e.matches }
onMounted(() => mobileQuery?.addEventListener('change', onMediaChange))
onUnmounted(() => mobileQuery?.removeEventListener('change', onMediaChange))

const sidebarOpen = ref(!isMobile.value)
const { isVisible: headerVisible, toggle: toggleHeader } = useHeaderVisibility('dashboardHeaderVisible', true)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}
</script>

<template>
  <div class="min-h-screen">
    <Sidebar
      :is-open="sidebarOpen"
      :auth="auth"
      :project="project"
      :scene="scene"
    />

    <div :class="['transition-all duration-300 ease-in-out', sidebarOpen ? 'lg:ml-64' : 'lg:ml-16']">
      <!-- Collapsible Header -->
      <Transition name="slide-down">
        <header
          v-if="headerVisible || !collapsibleHeader"
          class="relative flex justify-between items-center bg-background/0 backdrop-blur-md px-4 md:px-6 h-14"
        >
          <div class="flex items-center gap-2">
            <Button variant="ghost" size="icon" @click="toggleSidebar">
              <Menu class="w-5 h-5" />
            </Button>
            <Button
              v-if="collapsibleHeader"
              variant="ghost"
              size="icon"
              @click="toggleHeader"
              title="Masquer la barre d'en-tête"
            >
              <ChevronUp class="w-4 h-4" />
            </Button>
          </div>
          <ThemeToggle />
        </header>
      </Transition>

      <!-- Toggle button when header is hidden (only if collapsible) -->
      <Transition name="fade">
        <div
          v-if="!headerVisible && collapsibleHeader"
          class="top-0 left-1/2 z-50 fixed -translate-x-1/2"
          :style="{ marginLeft: isMobile ? '0' : (sidebarOpen ? '8rem' : '2rem') }"
        >
          <Button
            variant="secondary"
            size="sm"
            @click="toggleHeader"
            class="bg-card/90 hover:bg-card shadow-lg backdrop-blur rounded-t-none rounded-b-lg"
            title="Afficher la barre d'en-tête"
          >
            <ChevronDown class="mr-2 w-4 h-4" />
            Afficher l'en-tête
          </Button>
        </div>
      </Transition>

      <main :class="['px-4 md:px-6', headerVisible || !collapsibleHeader ? 'py-5' : 'pt-5 pb-5']">
        <slot />
      </main>
    </div>

    <div
      v-if="sidebarOpen"
      @click="toggleSidebar"
      class="lg:hidden z-40 fixed inset-0 bg-black/50"
    ></div>
  </div>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease-in-out;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>