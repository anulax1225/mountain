<script setup>
import { ref, useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()

const loaded = ref(false)

function onLoad() {
  loaded.value = true
}

function onError() {
  loaded.value = true
}
</script>

<template>
  <div class="relative overflow-hidden" :class="attrs.class">
    <div
      v-if="!loaded"
      class="absolute inset-0 z-10 animate-shimmer"
    />
    <img
      v-bind="attrs"
      :class="[attrs.class, loaded ? 'opacity-100' : 'opacity-0']"
      class="transition-opacity duration-300"
      @load="onLoad"
      @error="onError"
    />
  </div>
</template>
