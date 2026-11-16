<template>
    <label class="color-picker" :title="model.toUpperCase()">
        <span class="color-swatch" :style="{ backgroundColor: model }"></span>
        <span v-if="text" class="color-label">{{ text }}</span>
        <input class="color-input" type="color" v-model="model" :aria-label="text || undefined" />
    </label>
</template>

<script setup lang="ts">
import { useDebounce } from "@/lib/utils/composables";
import { watch } from "vue";

export interface ColorPickerOpts {
    text?: string;
}

withDefaults(defineProps<ColorPickerOpts>(), {
    text: "",
});

const model = defineModel<string>({ required: true });

const emit = defineEmits<{ (e: "change", value: string): void }>();

const DEBOUNCE_TIME = 500 as const;

const debouncedUpdate = useDebounce(() => {
    emit("change", model.value);
}, DEBOUNCE_TIME);

watch(model, function () {
    debouncedUpdate();
});
</script>

<style lang="scss" scoped>
$ease: cubic-bezier(0.4, 0, 0.2, 1);

// 尺寸与 setting-select 的触发器一致，便于同一行并排
.color-picker {
    position: relative;
    display: inline-flex;
    box-sizing: border-box;
    align-items: center;
    padding: 6px 10px;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background-color: var(--default-background);
    color: var(--default-fore);
    cursor: pointer;
    font-size: 13px;
    line-height: 18px;
    transition:
        border-color 0.18s $ease,
        box-shadow 0.18s $ease;
    gap: 8px;

    &:hover {
        border-color: var(--minimal-fore);
    }

    &:focus-within {
        border-color: var(--default-fore);
        box-shadow: 0 0 0 1px var(--default-fore);
    }
}

.color-swatch {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    border-radius: 4px;
    box-shadow: inset 0 0 0 1px rgb(0 0 0 / 12%);
}

.color-label {
    white-space: nowrap;
}

// 原生取色器铺满整个按钮并隐藏，保留键盘与点击行为
.color-input {
    position: absolute;
    width: 100%;
    height: 100%;
    padding: 0;
    border: none;
    margin: 0;
    cursor: pointer;
    inset: 0;
    opacity: 0;
}
</style>
