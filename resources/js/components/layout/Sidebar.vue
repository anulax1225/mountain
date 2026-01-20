<script setup>
import { Link } from '@inertiajs/vue3'
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
    'fixed inset-y-0 left-0 z-50 flex flex-col bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200/80 dark:border-zinc-800/80 transition-all duration-300 ease-in-out',
    isOpen ? 'w-64' : 'w-16'
  ]">
    <!-- Brand -->
    <div :class="[
      'flex items-center h-14 border-b border-zinc-200/80 dark:border-zinc-800/80 shrink-0',
      isOpen ? 'px-4 justify-start' : 'justify-center'
    ]">
      <Link href="/dashboard" class="flex items-center gap-2.5 group">
        <AppLogo class="w-8 h-8 group-hover:scale-105 transition-transform" />
        <span v-if="isOpen" class="font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">Owlaround</span>
      </Link>
    </div>

    <!-- Navigation -->
    <SidebarNavigation :is-open="isOpen" :project="project">
      <SidebarProjectContext v-if="project" :is-open="isOpen" :project="project" :scene="scene" />
    </SidebarNavigation>

    <!-- User Menu -->
    <UserMenu :is-open="isOpen" :auth="auth" />
  </aside>
</template>
