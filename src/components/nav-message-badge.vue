<template>
    <span class="message-unread-count" aria-hidden="true">{{ displayCount }}</span>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ count: number }>();
const displayCount = computed(() => Math.min(props.count, 99));
</script>

<style scoped lang="scss">
.message-unread-count {
    position: absolute;
    top: 0;
    right: 0;
    display: inline-flex;
    box-sizing: border-box;
    min-width: 16px;
    height: 16px;
    align-items: center;
    justify-content: center;
    padding: 0 3px;
    border: 2px solid var(--surface-glass);
    border-radius: 8px;
    background-color: var(--error-color);
    color: white;
    font-size: 9px;
    font-weight: var(--font-weight-bold);
    line-height: 1;
    pointer-events: none;
    transform: translate(35%, -35%);
}
</style>
