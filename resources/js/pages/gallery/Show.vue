<script setup>
import { Head } from '@inertiajs/vue3';
import EditorViewer from '@/components/dashboard/editor/EditorViewer.vue';


const props = defineProps({
    project: Object,
});
console.log(props.project);
</script>

<template>
    <div class="relative w-screen h-screen overflow-hidden">

        <Head :title="project.name" />
        <EditorViewer
            v-if="project"
            :project="project"
            />
    </div>
</template>