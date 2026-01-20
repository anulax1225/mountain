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
import { Settings, LogOut, ChevronUp } from 'lucide-vue-next'

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
    .slice(0, 2)
}
</script>

<template>
  <div class="p-3 border-t border-zinc-200/80 dark:border-zinc-800/80">
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <button
          :class="[
            'w-full flex items-center gap-3 p-2 rounded-xl transition-all duration-200',
            'hover:bg-zinc-200/80 dark:hover:bg-zinc-800/80',
            'focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 focus:ring-offset-2 focus:ring-offset-zinc-50 dark:focus:ring-offset-zinc-900',
            !isOpen && 'justify-center'
          ]"
        >
          <Avatar class="w-9 h-9 shrink-0">
            <AvatarFallback class="bg-gradient-to-br from-zinc-700 to-zinc-900 dark:from-zinc-200 dark:to-zinc-400 text-white dark:text-zinc-900 text-sm font-medium">
              {{ getInitials(auth?.user?.name) }}
            </AvatarFallback>
          </Avatar>
          <div v-if="isOpen" class="flex-1 text-left min-w-0">
            <p class="font-medium text-zinc-900 dark:text-zinc-100 text-sm truncate">
              {{ auth?.user?.name || 'Utilisateur' }}
            </p>
            <p class="text-zinc-500 dark:text-zinc-400 text-xs truncate">
              {{ auth?.user?.email || 'utilisateur@exemple.com' }}
            </p>
          </div>
          <ChevronUp v-if="isOpen" class="w-4 h-4 text-zinc-400 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        :align="isOpen ? 'end' : 'center'"
        :side="isOpen ? 'top' : 'right'"
        :side-offset="8"
        class="w-56"
      >
        <DropdownMenuLabel class="font-normal">
          <div class="flex flex-col space-y-1">
            <p class="text-sm font-medium">{{ auth?.user?.name || 'Utilisateur' }}</p>
            <p class="text-xs text-zinc-500 dark:text-zinc-400 truncate">
              {{ auth?.user?.email || 'utilisateur@exemple.com' }}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem as-child>
          <Link href="/dashboard/settings" class="flex items-center gap-2 w-full cursor-pointer">
            <Settings class="w-4 h-4" />
            <span>Paramètres</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem as-child>
          <Link
            href="/logout"
            method="post"
            as="button"
            class="flex items-center gap-2 w-full text-left text-red-600 dark:text-red-400 cursor-pointer"
          >
            <LogOut class="w-4 h-4" />
            <span>Se déconnecter</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
