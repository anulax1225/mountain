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
  <div class="p-3 border-t border-border">
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <button
          :class="[
            'w-full flex items-center gap-3 p-2 rounded-xl transition-all duration-200',
            'hover:bg-muted',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
            !isOpen && 'justify-center'
          ]"
        >
          <Avatar class="w-9 h-9 shrink-0">
            <AvatarFallback class="bg-gradient-to-br from-foreground/70 to-foreground text-background text-sm font-medium">
              {{ getInitials(auth?.user?.name) }}
            </AvatarFallback>
          </Avatar>
          <div v-if="isOpen" class="flex-1 text-left min-w-0">
            <p class="font-medium text-foreground text-sm truncate">
              {{ auth?.user?.name || 'Utilisateur' }}
            </p>
            <p class="text-muted-foreground text-xs truncate">
              {{ auth?.user?.email || 'utilisateur@exemple.com' }}
            </p>
          </div>
          <ChevronUp v-if="isOpen" class="w-4 h-4 text-muted-foreground shrink-0" />
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
            <p class="text-xs text-muted-foreground truncate">
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
