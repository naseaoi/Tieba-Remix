<template>
    <button type="button" class="setting-switch" role="switch" :aria-checked="innerValue" :disabled="disabled"
        :class="{ on: innerValue }" @click="toggle">
        <span class="switch-thumb"></span>
    </button>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";

const props = defineProps<{
    modelValue: boolean;
    disabled?: boolean;
}>();

const emit = defineEmits<{
    (e: "update:modelValue", value: boolean): void;
    (e: "change", value: boolean): void;
}>();

const innerValue = ref(!!props.modelValue);

watch(() => props.modelValue, v => {
    innerValue.value = !!v;
});

function toggle() {
    if (props.disabled) return;
    innerValue.value = !innerValue.value;
    emit("update:modelValue", innerValue.value);
    emit("change", innerValue.value);
}
</script>

<style lang="scss" scoped>
.setting-switch {
    position: relative;
    box-sizing: border-box;
    width: 36px;
    height: 20px;
    flex-shrink: 0;
    padding: 0;
    border: none;
    border-radius: 999px;
    background-color: var(--border-color);
    cursor: pointer;
    outline: none;
    transition:
        background-color 0.2s ease,
        box-shadow 0.2s ease;

    .switch-thumb {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background-color: #fff;
        box-shadow: 0 1px 3px rgb(0 0 0 / 22%);
        transition:
            transform 0.2s cubic-bezier(0.4, 0, 0.2, 1),
            background-color 0.2s ease;
    }

    &:hover:not(:disabled) {
        background-color: var(--minimal-fore);
    }

    &.on {
        background-color: #000 !important;

        .switch-thumb {
            transform: translateX(16px);
        }

        &:hover {
            background-color: #222 !important;
        }
    }

    &:focus-visible {
        box-shadow: 0 0 0 2px var(--default-background), 0 0 0 4px #000;
    }

    &:disabled {
        cursor: not-allowed;
        opacity: 0.5;
    }
}

.dark-theme .setting-switch.on {
    background-color: #fff !important;

    .switch-thumb {
        background-color: #000;
    }

    &:hover {
        background-color: #e6e6e6 !important;
    }
}

.dark-theme .setting-switch:focus-visible {
    box-shadow: 0 0 0 2px var(--default-background), 0 0 0 4px #fff;
}
</style>
