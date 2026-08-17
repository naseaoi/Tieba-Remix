<template>
    <Transition name="detached-message-alert">
        <button v-if="visible" type="button" class="detached-message-alert" :class="{ expanded }"
            :aria-label="`${count} 条未读消息，打开消息菜单`" @click="emit('open')">
            <Mail class="detached-message-icon" aria-hidden="true" />
            <span class="detached-message-label">有 {{ displayCount }} 条消息</span>
            <NavMessageBadge :count="count" />
        </button>
    </Transition>
</template>

<script setup lang="ts">
import { Mail } from "@lucide/vue";
import { computed } from "vue";
import NavMessageBadge from "./nav-message-badge.vue";

const props = defineProps<{
    count: number,
    expanded: boolean,
    visible: boolean,
}>();
const emit = defineEmits<{ open: [] }>();
const displayCount = computed(() => Math.min(props.count, 99));
</script>

<style scoped lang="scss">
.detached-message-alert {
    position: fixed;
    z-index: 1201;
    top: 12px;
    right: 12px;
    display: inline-flex;
    overflow: visible;
    min-width: 40px;
    height: 40px;
    align-items: center;
    justify-content: center;
    padding: 0 10px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background-color: var(--surface-glass);
    color: var(--default-fore);
    cursor: pointer;
    @include blur-effect(12px);
    box-shadow: 0 2px 10px rgb(0 0 0 / 12%);
    transition: background-color var(--fast-duration), box-shadow var(--fast-duration);

    &:hover {
        background-color: var(--default-hover);
        box-shadow: 0 4px 14px rgb(0 0 0 / 16%);
    }

    &:focus-visible {
        outline: 2px solid var(--tieba-theme-color);
        outline-offset: 2px;
    }

    .detached-message-icon {
        width: 18px;
        height: 18px;
        flex: 0 0 18px;
    }

    .detached-message-label {
        overflow: hidden;
        max-width: 0;
        margin-left: 0;
        font-size: 13px;
        font-weight: var(--font-weight-bold);
        opacity: 0;
        transition: max-width var(--default-duration), margin-left var(--default-duration),
            opacity var(--fast-duration);
        white-space: nowrap;
    }

    > .message-unread-count {
        top: -4px;
        right: -4px;
        transform: none;
        transition: opacity var(--fast-duration), transform var(--fast-duration);
    }

    &.expanded {
        .detached-message-label {
            max-width: 90px;
            margin-left: 8px;
            opacity: 1;
        }

        > .message-unread-count {
            opacity: 0;
            transform: scale(0.75);
        }
    }
}

.detached-message-alert-enter-active,
.detached-message-alert-leave-active {
    transition: opacity var(--fast-duration), transform var(--fast-duration);
}

.detached-message-alert-enter-from,
.detached-message-alert-leave-to {
    opacity: 0;
    transform: translateX(calc(100% + 16px));
}

@media (prefers-reduced-motion: reduce) {
    .detached-message-alert,
    .detached-message-alert .detached-message-label,
    .detached-message-alert > .message-unread-count,
    .detached-message-alert-enter-active,
    .detached-message-alert-leave-active {
        transition: none;
    }
}

@media (width <= 600px) {
    .detached-message-alert {
        top: 8px;
        min-width: 36px;
        height: 36px;
        padding: 0 9px;

        .detached-message-icon {
            width: 16px;
            height: 16px;
            flex-basis: 16px;
        }
    }
}
</style>
