<script setup>
import { Head } from '@inertiajs/vue3';
import { onBeforeUnmount, onMounted } from 'vue';
import EditorViewer from '@/components/dashboard/editor/EditorViewer.vue';
import { useAnalyticsTracking } from '@/composables/useAnalyticsTracking.js';

const props = defineProps({
    project: Object,
});

// Initialize analytics tracking for public gallery
const { initTracking, trackImageView, trackHotspotClick, trackSessionEnd } = useAnalyticsTracking(props.project?.slug);

onMounted(() => {
    // Only track if project is public
    if (props.project?.is_public) {
        initTracking();

        // Track initial image view (start_image)
        if (props.project.start_image?.slug) {
            trackImageView(props.project.start_image.slug);
        }
    }
});
</script>

<template>
    <div class="relative w-screen h-screen overflow-hidden">

        <Head :title="project.name" />
        <EditorViewer
            v-if="project"
            :project="project"
            :on-track-image-view="trackImageView"
            :on-track-hotspot-click="trackHotspotClick"
            />
    </div>
</template>