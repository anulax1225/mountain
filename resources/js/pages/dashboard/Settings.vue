<script setup>
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import ProfileSettings from '@/components/dashboard/settings/ProfileSettings.vue'
import PasswordSettings from '@/components/dashboard/settings/PasswordSettings.vue'
import NotificationSettings from '@/components/dashboard/settings/NotificationSettings.vue'
import DangerZone from '@/components/dashboard/settings/DangerZone.vue'

const props = defineProps({
  auth: Object
})
</script>

<template>
  <DashboardLayout :auth="auth">
    <div class="mx-auto max-w-4xl">
      <div class="mb-8">
        <h1 class="font-bold text-zinc-900 dark:text-zinc-100 text-3xl">Paramètres</h1>
        <p class="mt-1 text-zinc-600 dark:text-zinc-400">Gérez les paramètres de votre compte et vos préférences</p>
      </div>

      <div class="space-y-6">
        <ProfileSettings :user="auth.user" />
        <PasswordSettings />
        <NotificationSettings />
        <DangerZone />
      </div>
    </div>
  </DashboardLayout>
</template>