<script setup>
import { Link } from '@inertiajs/vue3'
import { Button } from '@/components/ui/button'
import PlaceholderPattern from '@/components/PlaceholderPattern.vue'
import { ArrowRight } from 'lucide-vue-next'

defineProps({
    webglActive: { type: Boolean, default: false },
})
</script>

<template>
    <section class="relative flex flex-col justify-center px-4 sm:px-6 lg:px-8 min-h-screen overflow-hidden">
        <!-- Organic gradient blobs background (fallback when WebGL unavailable) -->
        <div v-if="!webglActive" class="-z-10 absolute inset-0">
            <div class="absolute inset-0 bg-background/60"></div>
            <!-- Primary blob top-left -->
            <div class="absolute -top-24 -left-24 w-[40rem] h-[40rem] rounded-full opacity-[0.15] dark:opacity-[0.25]"
                style="background: radial-gradient(circle, oklch(0.6 0.25 var(--primary-hue)), transparent 70%);"></div>
            <!-- Secondary blob top-right -->
            <div class="absolute -top-12 -right-32 w-[35rem] h-[35rem] rounded-full opacity-[0.12] dark:opacity-[0.20]"
                style="background: radial-gradient(circle, oklch(0.7 0.22 var(--secondary-hue)), transparent 70%);"></div>
            <!-- Subtle bottom blob -->
            <div class="absolute -bottom-32 left-1/3 w-[30rem] h-[30rem] rounded-full opacity-[0.08] dark:opacity-[0.15]"
                style="background: radial-gradient(circle, oklch(0.6 0.2 var(--primary-hue)), transparent 70%);"></div>
            <!-- Faint dot pattern -->
            <div class="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
                style="background-image: radial-gradient(circle, oklch(0.3 0.08 var(--primary-hue)) 1px, transparent 1px); background-size: 2rem 2rem;"></div>
        </div>

        <div class="mx-auto max-w-7xl">
            <div class="mx-auto mb-16 max-w-4xl text-center">
                <!-- Staggered typography with weight contrast -->
                <h1 class="mb-6 tracking-tight animate-fade-up">
                    <span class="block text-muted-foreground text-xl sm:text-2xl lg:text-3xl" style="font-family: var(--font-family-body); font-weight: 300;">
                        Créez des
                    </span>
                    <span class="block text-primary text-5xl sm:text-6xl lg:text-7xl" style="font-family: var(--font-family-display); font-weight: 800;">
                        visites virtuelles
                    </span>
                    <span class="block text-foreground text-4xl sm:text-5xl lg:text-6xl" style="font-family: var(--font-family-display); font-weight: 200;">
                        immersives en 360°
                    </span>
                </h1>

                <p class="mx-auto mb-12 max-w-2xl text-muted-foreground text-lg sm:text-xl leading-relaxed animate-fade-up delay-200">
                    Éditeur photo panoramique professionnel pour créer des expériences 3D interactives. Téléversez,
                    composez et partagez de superbes environnements virtuels.
                </p>

                <div class="flex sm:flex-row flex-col justify-center items-center gap-4 animate-fade-up delay-300">
                    <Link href="/gallery">
                        <Button size="lg" class="rounded-full bg-primary hover:bg-primary/90 px-8 h-12 text-primary-foreground text-base hover:shadow-[0_0_30px_oklch(0.5_0.15_var(--primary-hue)/0.3)]">
                            Voir la galerie
                            <ArrowRight class="ml-2 w-5 h-5" />
                        </Button>
                    </Link>
                    <Link href="/contact">
                        <Button size="lg" variant="outline" class="rounded-full px-8 h-12 text-base">
                            Nous contacter
                        </Button>
                    </Link>
                </div>
            </div>

            <div class="relative mx-auto max-w-5xl animate-fade-up delay-500">
                <!-- Warm glow behind demo -->
                <div class="absolute -inset-8 rounded-3xl opacity-50 blur-3xl"
                    style="background: linear-gradient(135deg, oklch(0.8 0.1 var(--primary-hue) / 0.3), oklch(0.85 0.08 var(--secondary-hue) / 0.2), transparent);"></div>
                <div class="relative bg-card shadow-2xl border border-border rounded-2xl overflow-hidden">
                    <PlaceholderPattern class="aspect-[16/9]" />
                </div>
            </div>
        </div>
    </section>
</template>
