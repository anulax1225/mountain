<script setup>
import { computed } from 'vue'
import { Link, usePage } from '@inertiajs/vue3'
import { FolderOpen, ChevronLeft, LayoutGrid, GalleryVerticalEnd, Home, Users, BarChart3, Globe, MailOpen } from 'lucide-vue-next'

const props = defineProps({
    isOpen: Boolean,
    project: Object
})

const page = usePage()
const isAdmin = computed(() => page.props.auth?.user?.is_admin)
const canManageSettings = computed(() => props.project.permissions?.can_manage_settings ?? false)

const baseNavigation = computed(() => {
    const items = [
        { name: 'Projets', icon: FolderOpen, href: '/dashboard' },
        { name: 'Galerie', icon: GalleryVerticalEnd, href: '/gallery' },
    ]

    if (isAdmin.value) {
        items.push({ name: 'Administration', icon: Users, href: '/dashboard/admin/users' })
        items.push({ name: 'Contact', icon: MailOpen, href: '/dashboard/admin/contact-requests' })
    }

    return items
})

const navigation = computed(() => {
    if (props.project) {

        const extras = props.project.is_public && canManageSettings ?
            [
                { name: 'Analytics', icon: BarChart3, href: `/dashboard/projects/${props.project.slug}/analytics` }
            ]
            : [];
        return [
            { name: 'Retour', icon: ChevronLeft, href: '/dashboard' },
            { name: 'Scenes', icon: LayoutGrid, href: '/dashboard/projects/' + props.project?.slug },
            { name: 'Éditeur 360°', icon: Globe, href: '/dashboard/editor/' + props.project?.slug },
            ...extras,
        ]
    }
    return baseNavigation.value
})

const isActive = (href) => {
    const currentUrl = page.url
    return currentUrl === href
}
</script>

<template>
    <nav class="flex-1 py-3 overflow-y-auto">
        <div :class="['px-3', isOpen ? '' : 'px-2']">
            <p v-if="isOpen"
                class="mb-2 px-3 font-medium text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider">
                Général
            </p>
            <ul class="space-y-2">
                <li v-for="item in navigation" :key="item.name">
                    <Link :href="item.href" :title="!isOpen ? item.name : undefined" :class="[
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                        isActive(item.href)
                            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-normal'
                            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100'
                    ]">
                        <component :is="item.icon" class="w-5 h-5 shrink-0" />
                        <span v-if="isOpen">{{ item.name }}</span>
                    </Link>
                </li>
            </ul>
        </div>
        <slot />
    </nav>
</template>
