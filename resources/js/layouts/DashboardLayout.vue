<script setup>
import { ref } from 'vue';
import { Link } from '@inertiajs/vue3';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FolderOpen, Image, Edit3, Menu, LogOut, Settings } from 'lucide-vue-next';
import AppBrand from '@/components/AppBrand.vue';
import AppLogo from '@/components/AppLogo.vue';

defineProps({
  auth: Object,
});

const sidebarOpen = ref(true);

const navigation = [
  { name: 'Projets', icon: FolderOpen, href: '/dashboard' },
  { name: 'Scènes', icon: Image, href: '/dashboard/scenes' },
  { name: 'Éditeur', icon: Edit3, href: '/dashboard/editor' },
];

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
};
</script>

<template>
  <div class="bg-zinc-50 min-h-screen">
    <!-- Sidebar -->
    <aside 
      :class="[
        'fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-zinc-200 transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-20'
      ]"
    >
      <!-- Brand -->
      <div class="flex justify-between items-center px-4 border-zinc-200 h-16">
        <div v-if="sidebarOpen" class="flex items-center gap-2">
          <AppBrand></AppBrand>
        </div>
        <div v-else class="flex justify-center items-center">
          <AppLogo class="w-9 h-9"/>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 py-4 overflow-y-auto">
        <ul class="space-y-1 px-2">
          <li v-for="item in navigation" :key="item.name">
            <Link
              :href="item.href"
              :class="[
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                'hover:bg-zinc-100 hover:text-zinc-900',
                'text-zinc-700'
              ]"
            >
              <component :is="item.icon" class="flex-shrink-0 w-5 h-5" />
              <span v-if="sidebarOpen">{{ item.name }}</span>
            </Link>
          </li>
        </ul>
      </nav>

      <!-- User section -->
      <div class="p-4 border-zinc-200 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <button 
              :class="[
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-100 transition-colors',
                !sidebarOpen && 'justify-center'
              ]"
            >
              <Avatar class="w-8 h-8">
                <AvatarFallback class="bg-zinc-900 text-white text-sm">
                  {{ getInitials(auth?.user?.name) }}
                </AvatarFallback>
              </Avatar>
              <div v-if="sidebarOpen" class="flex-1 text-left">
                <p class="font-medium text-zinc-900 text-sm">{{ auth?.user?.name || 'Utilisateur' }}</p>
                <p class="text-zinc-500 text-xs">{{ auth?.user?.email || 'utilisateur@exemple.com' }}</p>
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
    </aside>

    <!-- Main content -->
    <div :class="['transition-all duration-300', sidebarOpen ? 'ml-64' : 'ml-20']">
      <!-- Header -->
      <header class="flex justify-between items-center bg-white px-6 border-zinc-200 border-b h-16">
        <Button variant="ghost" size="icon" @click="toggleSidebar">
          <Menu class="w-5 h-5" />
        </Button>
      </header>

      <!-- Page content -->
      <main class="p-6">
        <slot />
      </main>
    </div>

    <!-- Mobile overlay -->
    <div 
      v-if="sidebarOpen" 
      @click="toggleSidebar"
      class="lg:hidden z-40 fixed inset-0 bg-black/50"
    ></div>
  </div>
</template>