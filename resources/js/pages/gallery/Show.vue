<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import { onMounted } from 'vue';
import LandingLayout from '@/layouts/LandingLayout.vue';
import EditorViewer from '@/components/dashboard/editor/EditorViewer.vue';
import { useAnalyticsTracking } from '@/composables/useAnalyticsTracking.js';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Maximize } from 'lucide-vue-next';

const props = defineProps<{
    project: {
        slug: string;
        name: string;
        description: string | null;
        is_public: boolean;
        user: { name: string };
        scenes: any[];
        start_image: { slug: string } | null;
    };
}>();

const { initTracking, trackImageView, trackHotspotClick, trackSessionEnd } = useAnalyticsTracking(props.project?.slug);

onMounted(() => {
    if (props.project?.is_public) {
        initTracking();

        if (props.project.start_image?.slug) {
            trackImageView(props.project.start_image.slug);
        }
    }
});
</script>

<template>
    <LandingLayout>
        <Head :title="project.name" />

        <div class="flex flex-col h-screen pt-16">
            <div class="mx-auto px-4 py-4 container shrink-0">
                <Link href="/gallery" class="inline-flex items-center gap-2 mb-4 text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft class="w-4 h-4" />
                    Retour à la galerie
                </Link>

                <div>
                    <h1 class="mb-2 text-4xl" style="font-family: var(--font-family-display); font-weight: 800;">
                        {{ project.name }}
                    </h1>
                    <p v-if="project.description" class="mb-3 text-muted-foreground">
                        {{ project.description }}
                    </p>
                    <div class="flex items-center gap-3">
                        <Badge variant="secondary">Par {{ project.user.name }}</Badge>
                        <Button as-child variant="outline" size="sm">
                            <a :href="`/gallery/${project.slug}/embed`" target="_blank">
                                <Maximize class="w-4 h-4 mr-2" />
                                Voir en plein écran
                            </a>
                        </Button>
                    </div>
                </div>
            </div>

            <div class="relative w-full flex-1 min-h-0 overflow-hidden">
                <EditorViewer
                    v-if="project && project.scenes?.some(s => s.images?.length > 0)"
                    :project="project"
                    :on-track-image-view="trackImageView"
                    :on-track-hotspot-click="trackHotspotClick"
                />
                <div v-else class="flex items-center justify-center h-full bg-muted">
                    <p class="text-muted-foreground text-lg">
                        Ce projet ne contient aucune image.
                    </p>
                </div>
            </div>
        </div>
    </LandingLayout>
</template>
