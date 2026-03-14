<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import LandingLayout from '@/layouts/LandingLayout.vue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppImage from '@/components/AppImage.vue';

interface Project {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    picture_path: string | null;
    is_public: boolean;
    user: {
        name: string;
    };
    start_image: {
        id: string;
        path: string;
    } | null;
}

interface Props {
    projects: {
        data: Project[];
        links: any[];
        meta: any;
    };
}

defineProps<Props>();
</script>

<template>
    <LandingLayout>
        <Head title="Galerie Publique" />

        <div class="mx-auto px-4 py-8 pt-24 min-h-screen container">
            <div class="mb-8">
                <h1 class="mb-2 text-4xl" style="font-family: var(--font-family-display); font-weight: 800;">Galerie</h1>
                <p class="text-muted-foreground">
                    Explorez les visites virtuelles publiques
                </p>
            </div>

            <div v-if="projects.data.length === 0" class="py-12 text-center">
                <p class="text-muted-foreground">Aucun projet public disponible</p>
            </div>

            <div v-else class="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <Link v-for="project in projects.data" :key="project.id" :href="`/gallery/${project.slug}`"
                    class="group h-full">
                    <Card class="h-full hover:shadow-lg overflow-hidden transition-all">
                        <div class="relative bg-muted aspect-video overflow-hidden">
                            <AppImage v-if="project.picture_path"
                                :src="`/projects/${project.slug}/picture`"
                                :alt="project.name"
                                class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            <div v-else class="flex justify-center items-center w-full h-full">
                                <span class="text-muted-foreground">Pas d'image</span>
                            </div>
                        </div>

                        <CardHeader class="flex-1">
                            <CardTitle>{{ project.name }}</CardTitle>
                            <CardDescription v-if="project.description">
                                {{ project.description }}
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <div class="flex justify-between items-center">
                                <span class="text-muted-foreground text-sm">
                                    Par {{ project.user.name }}
                                </span>
                                <Badge variant="secondary">Public</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            <div v-if="projects.links.length > 3" class="flex justify-center gap-2 mt-8">
                <Link v-for="(link, index) in projects.links" :key="index" :href="link.url" :class="[
                    'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                    link.active
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80',
                    !link.url && 'opacity-50 cursor-not-allowed',
                ]" :disabled="!link.url" v-html="link.label" />
            </div>
        </div>
    </LandingLayout>
</template>