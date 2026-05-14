<template>
    <div ref="rootRef" class="setting-select" :class="{ open }">
        <button type="button" class="select-trigger" :class="{ active: open }" @click="toggleOpen">
            <span class="trigger-text">{{ currentText }}</span>
            <span class="material-symbols-outlined trigger-icon">expand_more</span>
        </button>

        <transition name="setting-select-pop">
            <div v-if="open" class="select-popover">
                <ul class="select-list">
                    <li v-for="(item, idx) in data" :key="idx" class="select-item"
                        :class="{ selected: item.value === currentValue }"
                        @click="choose(item)" @mouseenter="onEnter(idx)" @mouseleave="onLeave(idx)">
                        <span class="item-text">{{ item.text }}</span>
                    </li>
                </ul>
            </div>
        </transition>
    </div>
</template>

<script lang="ts" setup generic="T">
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from "vue";

interface SelectItem {
    value: T;
    text: string;
    desc?: string;
}

const props = defineProps<{
    data: SelectItem[];
    defaultValue?: T;
}>();

const emit = defineEmits<{
    (e: "change", value: T): void;
}>();

// 由 settings.vue 注入：把 hover desc 投到面板底部的悬浮提示条
const hoverDescApi = inject<{ set: (text: string) => void; clear: () => void }>("settingHoverDesc", {
    set: () => { },
    clear: () => { },
});

const rootRef = ref<HTMLElement>();
const open = ref(false);
const currentValue = ref<T | undefined>(props.defaultValue);
const hoverIdx = ref<number>(-1);

watch(() => props.defaultValue, v => {
    currentValue.value = v;
});

const currentText = computed(() => {
    const found = props.data.find(d => d.value === currentValue.value);
    return found?.text ?? "";
});

function toggleOpen() {
    open.value = !open.value;
    if (!open.value) hoverDescApi.clear();
}

function choose(item: SelectItem) {
    currentValue.value = item.value;
    open.value = false;
    hoverDescApi.clear();
    emit("change", item.value);
}

function onEnter(idx: number) {
    hoverIdx.value = idx;
    const desc = props.data[idx]?.desc;
    if (desc) hoverDescApi.set(desc);
    else hoverDescApi.clear();
}

function onLeave(idx: number) {
    if (hoverIdx.value === idx) {
        hoverIdx.value = -1;
        hoverDescApi.clear();
    }
}

function handleDocClick(e: MouseEvent) {
    if (!rootRef.value) return;
    if (!rootRef.value.contains(e.target as Node)) {
        open.value = false;
        hoverDescApi.clear();
    }
}

function handleEsc(e: KeyboardEvent) {
    if (e.key === "Escape") {
        open.value = false;
        hoverDescApi.clear();
    }
}

onMounted(() => {
    document.addEventListener("click", handleDocClick, true);
    document.addEventListener("keydown", handleEsc);
});

onBeforeUnmount(() => {
    document.removeEventListener("click", handleDocClick, true);
    document.removeEventListener("keydown", handleEsc);
    hoverDescApi.clear();
});
</script>

<style lang="scss" scoped>
$ease: cubic-bezier(0.4, 0, 0.2, 1);

.setting-select {
    position: relative;
    display: inline-block;
    width: 100%;
    max-width: 240px;
    font-size: 13px;
}

.select-trigger {
    display: inline-flex;
    box-sizing: border-box;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    padding: 6px 10px;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background-color: var(--default-background);
    color: var(--default-fore);
    cursor: pointer;
    font: inherit;
    font-size: 13px;
    outline: none;
    transition:
        border-color 0.18s $ease,
        box-shadow 0.18s $ease;
    gap: 8px;

    .trigger-text {
        overflow: hidden;
        flex: 1;
        text-align: left;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .trigger-icon {
        flex-shrink: 0;
        color: var(--minimal-fore);
        font-size: 18px;
        transition: transform 0.18s $ease;
    }

    &:hover {
        border-color: var(--minimal-fore);
    }

    &.active {
        border-color: var(--default-fore);
        box-shadow: 0 0 0 1px var(--default-fore);

        .trigger-icon {
            transform: rotate(180deg);
        }
    }
}

.select-popover {
    position: absolute;
    z-index: 2025;
    top: calc(100% + 4px);
    right: 0;
    left: 0;
    display: flex;
    overflow: hidden;
    padding: 4px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background-color: var(--default-background);
    box-shadow: 0 6px 18px rgb(0 0 0 / 10%);
    transform-origin: top center;
}

.select-list {
    display: flex;
    width: 100%;
    flex-direction: column;
    padding: 0;
    margin: 0;
    list-style: none;
}

.select-item {
    display: flex;
    align-items: center;
    padding: 7px 10px;
    border-radius: 5px;
    color: var(--default-fore);
    cursor: pointer;
    line-height: 1.4;
    transition:
        background-color 0.12s $ease,
        color 0.12s $ease;

    .item-text {
        overflow: hidden;
        flex: 1;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    &:hover {
        background-color: var(--default-hover);
    }

    // 当前选中：聚焦样式（背景高亮 + 加粗 + 高亮文字）
    &.selected {
        background-color: var(--default-hover);
        color: var(--highlight-fore);
        font-weight: var(--font-weight-bold);
    }

    // 当前选中 + 悬停：保持背景对比（用 active 色稍深）
    &.selected:hover {
        background-color: var(--default-active);
    }
}

// 弹出层动画
.setting-select-pop-enter-active,
.setting-select-pop-leave-active {
    transition:
        opacity 0.14s $ease,
        transform 0.14s $ease;
}

.setting-select-pop-enter-from,
.setting-select-pop-leave-to {
    opacity: 0;
    transform: scale(0.98) translateY(-4px);
}
</style>
