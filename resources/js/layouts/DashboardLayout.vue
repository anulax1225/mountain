<script setup>
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-vue-next'
import ThemeToggle from '@/components/ThemeToggle.vue'
import Sidebar from '@/components/layout/Sidebar.vue'

defineProps({
  auth: Object,
  project: Object,
  scene: Object,
})

const sidebarOpen = ref(true)

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

    <div :class="['transition-all duration-300', sidebarOpen ? 'ml-64' : 'ml-20']">
      <header class="flex justify-between items-center bg-white dark:bg-zinc-900 px-6 border-zinc-200 dark:border-zinc-800 border-b h-14">
        <Button variant="ghost" size="icon" @click="toggleSidebar">
          <Menu class="w-5 h-5" />
        </Button>
        <ThemeToggle />
      </header>

      <main class="px-6 py-5">
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