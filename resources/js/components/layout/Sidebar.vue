<script setup>
import AppBrand from '@/components/AppBrand.vue'
import AppLogo from '@/components/AppLogo.vue'
import SidebarNavigation from './SidebarNavigation.vue'
import SidebarProjectContext from './SidebarProjectContext.vue'
import UserMenu from './UserMenu.vue'

defineProps({
  isOpen: Boolean,
  auth: Object,
  project: Object,
  scene: Object
})
</script>

<template>
  <aside :class="[
    'fixed inset-y-0 left-0 z-50 flex flex-col justify-items-start bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300',
    isOpen ? 'w-64' : 'w-20'
  ]">
    <!-- Brand -->
    <div class="flex justify-between items-center px-4 border-zinc-200 dark:border-zinc-800 h-16">
      <div v-if="isOpen" class="flex items-center gap-2">
        <AppBrand />
      </div>
      <div v-else class="flex justify-center items-center">
        <AppLogo class="w-9 h-9" />
      </div>
    </div>

    <!-- Navigation -->
    <SidebarNavigation :is-open="isOpen" :project="project">
      <SidebarProjectContext v-if="project" :is-open="isOpen" :project="project" :scene="scene" />
    </SidebarNavigation>

    <!-- User Menu -->
    <UserMenu :is-open="isOpen" :auth="auth" />
  </aside>
</template>