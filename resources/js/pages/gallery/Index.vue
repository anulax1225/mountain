<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
    <div class="min-h-screen bg-background">

        <Head title="Galerie Publique" />

        <div class="container mx-auto px-4 py-8">
            <div class="mb-8">
                <h1 class="text-4xl font-bold mb-2">Galerie</h1>
                <p class="text-muted-foreground">
                    Explorez les visites virtuelles publiques
                </p>
            </div>

            <div v-if="projects.data.length === 0" class="text-center py-12">
                <p class="text-muted-foreground">Aucun projet public disponible</p>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link v-for="project in projects.data" :key="project.id" :href="`/gallery/${project.slug}`"
                    class="group">
                    <Card class="overflow-hidden transition-all hover:shadow-lg">
                        <div class="aspect-video bg-muted relative overflow-hidden">
                            <img v-if="project.picture_path"
                                :src="`/projects/${project.slug}/picture`"
                                :alt="project.name"
                                class="w-full h-full object-cover transition-transform group-hover:scale-105" />
                            <div v-else class="w-full h-full flex items-center justify-center">
                                <span class="text-muted-foreground">Pas d'image</span>
                            </div>
                        </div>

                        <CardHeader>
                            <CardTitle>{{ project.name }}</CardTitle>
                            <CardDescription v-if="project.description">
                                {{ project.description }}
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <div class="flex items-center justify-between">
                                <span class="text-sm text-muted-foreground">
                                    Par {{ project.user.name }}
                                </span>
                                <Badge variant="secondary">Public</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            <div v-if="projects.links.length > 3" class="mt-8 flex justify-center gap-2">
                <Link v-for="(link, index) in projects.links" :key="index" :href="link.url" :class="[
                    'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                    link.active
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80',
                    !link.url && 'opacity-50 cursor-not-allowed',
                ]" :disabled="!link.url" v-html="link.label" />
            </div>
        </div>
    </div>
</template>