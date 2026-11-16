<template>
    <template v-for="(segment, index) in segments" :key="index">
        <mark v-if="segment.hit" class="trex-search-hit">{{ segment.text }}</mark>
        <template v-else>{{ segment.text }}</template>
    </template>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { highlightSegments } from "../search-state";

const props = defineProps<{
    text: string;
    word: string;
}>();

const segments = computed(() => highlightSegments(props.text, props.word));
</script>
