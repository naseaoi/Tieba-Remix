<template>
    <div class="color-picker">
        <input class="color-input" type="color" v-model="model" />
        <p v-if="text">{{ text }}</p>
    </div>
</template>

<script setup lang="ts">
import _ from "lodash";
import { onBeforeUnmount, watch } from "vue";

export interface ColorPickerOpts {
    text?: string;
}

withDefaults(defineProps<ColorPickerOpts>(), {
    text: "",
});

const model = defineModel<string>({ required: true });

const emit = defineEmits<{ (e: "change", value: string): void }>();

const DEBOUNCE_TIME = 500 as const;

const debouncedUpdate = _.debounce(() => {
    emit("change", model.value);
}, DEBOUNCE_TIME);

onBeforeUnmount(function () {
    debouncedUpdate.cancel();
});

watch(model, function () {
    debouncedUpdate();
});
</script>

<style lang="scss" scoped>
$picker-size: 32px;

.color-picker {
    display: flex;
    align-items: center;
    gap: 10px;

    .color-input {
        width: $picker-size;
        height: $picker-size;
        padding: 2px;
        border: 1.5px solid var(--border-color);
        border-radius: 8px;
        background: none;
        cursor: pointer;

        &::-webkit-color-swatch-wrapper {
            padding: 0;
        }

        &::-webkit-color-swatch {
            border: none;
            border-radius: 5px;
        }

        &::-moz-color-swatch {
            border: none;
            border-radius: 5px;
        }
    }

    p {
        font-size: 13px;
        color: var(--minimal-fore);
    }
}
</style>
