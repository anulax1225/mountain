<script setup>
import { ref } from 'vue'
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

const sidebarOpen = ref(true)
const { isVisible: headerVisible, toggle: toggleHeader } = useHeaderVisibility('dashboardHeaderVisible', true)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}
</script>

<template>
  <div class="bg-zinc-50 dark:bg-zinc-950 min-h-screen">
    <Sidebar
      :is-open="sidebarOpen"
      :auth="auth"
      :project="project"
      :scene="scene"
    />

    <div :class="['transition-all duration-300 ease-in-out', sidebarOpen ? 'ml-64' : 'ml-16']">
      <!-- Collapsible Header -->
      <Transition name="slide-down">
        <header
          v-if="headerVisible || !collapsibleHeader"
          class="flex justify-between items-center bg-zinc-50 dark:bg-zinc-950 px-6 border-zinc-200 dark:border-zinc-800 border-b h-14"
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
          class="fixed top-0 left-1/2 -translate-x-1/2 z-50"
          :style="{ marginLeft: sidebarOpen ? '8rem' : '2rem' }"
        >
          <Button
            variant="secondary"
            size="sm"
            @click="toggleHeader"
            class="bg-white/90 hover:bg-white dark:bg-zinc-800/90 dark:hover:bg-zinc-800 shadow-lg backdrop-blur rounded-t-none rounded-b-lg"
            title="Afficher la barre d'en-tête"
          >
            <ChevronDown class="w-4 h-4 mr-2" />
            Afficher l'en-tête
          </Button>
        </div>
      </Transition>

      <main :class="['px-6', headerVisible || !collapsibleHeader ? 'py-5' : 'pt-5 pb-5']">
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