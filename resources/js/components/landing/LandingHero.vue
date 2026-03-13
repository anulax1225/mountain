<script setup>
import { Link } from '@inertiajs/vue3'
import { Button } from '@/components/ui/button'
import PlaceholderPattern from '@/components/PlaceholderPattern.vue'
import { ArrowRight } from 'lucide-vue-next'
</script>

<template>
    <section class="relative px-4 sm:px-6 lg:px-8 pt-32 pb-20 overflow-hidden">
        <div class="-z-10 absolute inset-0">
            <div class="absolute inset-0 bg-gradient-to-b from-muted to-background">
            </div>
            <div
                class="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]">
            </div>
        </div>

        <div class="mx-auto max-w-7xl">
            <div class="mx-auto mb-16 max-w-4xl text-center">
                <h1
                    class="mb-6 font-bold text-foreground text-5xl sm:text-6xl lg:text-7xl tracking-tight">
                    Créez des visites virtuelles<br />immersives en 360°
                </h1>

                <p class="mx-auto mb-12 max-w-2xl text-muted-foreground text-xl leading-relaxed">
                    Éditeur photo panoramique professionnel pour créer des expériences 3D interactives. Téléversez,
                    composez et partagez de superbes environnements virtuels.
                </p>

                <div class="flex sm:flex-row flex-col justify-center items-center gap-4">
                    <Link href="/login">
                        <Button size="lg"
                            class="bg-primary hover:bg-primary/90 px-8 h-12 text-primary-foreground text-base">
                            Se connecter
                            <ArrowRight class="ml-2 w-5 h-5" />
                        </Button>
                    </Link>
                    <Link href="/gallery">
                        <Button size="lg" variant="outline" class="px-8 h-12 text-base">
                            Voir la galerie
                        </Button>
                    </Link>
                </div>
            </div>

            <div class="relative mx-auto max-w-5xl">
                <div
                    class="absolute -inset-4 bg-gradient-to-r from-muted via-background to-muted opacity-50 blur-3xl rounded-3xl">
                </div>
                <div
                    class="relative bg-card shadow-2xl border border-border rounded-2xl overflow-hidden">
                    <PlaceholderPattern class="aspect-[16/9]" />
                </div>
            </div>
        </div>
    </section>
</template>