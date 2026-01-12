<script setup>
import { Link } from '@inertiajs/vue3'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Settings, LogOut } from 'lucide-vue-next'

defineProps({
  isOpen: Boolean,
  auth: Object
})

const getInitials = (name) => {
  if (!name) return 'U'
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
}
</script>

<template>
  <div class="p-4 border-zinc-200 dark:border-zinc-800 border-t">
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <button 
          :class="[
            'w-full flex items-center gap-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors',
            !isOpen && 'justify-center'
          ]"
        >
          <Avatar class="w-8 h-8">
            <AvatarFallback class="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm">
              {{ getInitials(auth?.user?.name) }}
            </AvatarFallback>
          </Avatar>
          <div v-if="isOpen" class="flex-1 text-left">
            <p class="font-medium text-zinc-900 dark:text-zinc-100 text-sm">{{ auth?.user?.name || 'Utilisateur' }}</p>
            <p class="text-zinc-500 dark:text-zinc-400 text-xs">{{ auth?.user?.email || 'utilisateur@exemple.com' }}</p>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" class="w-56">
        <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href="/dashboard/settings" class="flex items-center gap-2 w-full">
            <Settings class="w-4 h-4" />
            <span>Paramètres</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href="/logout" method="post" as="button" class="flex items-center gap-2 w-full text-left">
            <LogOut class="w-4 h-4" />
            <span>Se déconnecter</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>