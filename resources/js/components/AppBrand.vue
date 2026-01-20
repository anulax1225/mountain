<template>
    <Link href="/" class="flex items-center gap-2">
        <AppLogo class="w-7 h-7" />
        <span class="font-bold text-zinc-900 dark:text-zinc-100 text-lg">Owlaround</span>
    </Link>
</template>

<script setup>
import { Link } from '@inertiajs/vue3'
import AppLogo from './AppLogo.vue';
</script>