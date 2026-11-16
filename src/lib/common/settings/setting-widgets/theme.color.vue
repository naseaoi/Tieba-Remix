<template>
    <div class="theme-color-component">
        <ColorPicker text="浅色" v-model="lightTheme" @change="changeThemeColor" />
        <ColorPicker text="深色" v-model="darkTheme" @change="changeThemeColor" />
        <button v-if="!isDefault" type="button" class="reset-button" title="恢复默认" aria-label="恢复默认"
            @click="resetThemeColor">
            <RotateCcw class="reset-icon" aria-hidden="true" />
        </button>
    </div>
</template>

<script lang="ts" setup>
import { RotateCcw } from "@lucide/vue";
import ColorPicker from "@/components/color-picker.vue";
import { applyThemeColor } from "@/lib/theme";
import { themeColor } from "@/lib/user-values";
import { computed, ref } from "vue";

const lightTheme = ref(themeColor.get().light);
const darkTheme = ref(themeColor.get().dark);

const isDefault = computed(() => {
    const { light, dark } = themeColor.defaultValue;
    return lightTheme.value.toLowerCase() === light.toLowerCase()
        && darkTheme.value.toLowerCase() === dark.toLowerCase();
});

function changeThemeColor() {
    themeColor.set({
        dark: darkTheme.value,
        light: lightTheme.value,
    });
    applyThemeColor();
}

function resetThemeColor() {
    lightTheme.value = themeColor.defaultValue.light;
    darkTheme.value = themeColor.defaultValue.dark;
    changeThemeColor();
}
</script>

<style lang="scss" scoped>
$ease: cubic-bezier(0.4, 0, 0.2, 1);

.theme-color-component {
    display: flex;
    align-items: center;
    gap: 8px;
}

.reset-button {
    display: inline-flex;
    width: 32px;
    height: 32px;
    box-sizing: border-box;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 1px solid transparent;
    border-radius: 6px;
    background: none;
    color: var(--minimal-fore);
    cursor: pointer;
    transition:
        color 0.18s $ease,
        background-color 0.18s $ease;

    &:hover {
        background-color: var(--default-hover);
        color: var(--default-fore);
    }

    &:focus-visible {
        border-color: var(--default-fore);
        outline: none;
    }

    .reset-icon {
        width: 16px;
        height: 16px;
        stroke-width: 1.75;
    }
}
</style>
