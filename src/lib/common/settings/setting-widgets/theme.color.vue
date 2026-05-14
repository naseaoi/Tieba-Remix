<template>
    <div class="theme-color-component">
        <ColorPicker text="浅色主题" v-model="lightTheme" @change="changeThemeColor" />
        <ColorPicker text="深色主题" v-model="darkTheme" @change="changeThemeColor" />
    </div>
</template>

<script lang="ts" setup>
import ColorPicker from "@/components/color-picker.vue";
import { applyThemeColor } from "@/lib/theme";
import { themeColor } from "@/lib/user-values";
import { ref } from "vue";

const lightTheme = ref(themeColor.get().light);
const darkTheme = ref(themeColor.get().dark);

function changeThemeColor() {
    themeColor.set({
        dark: darkTheme.value,
        light: lightTheme.value,
    });
    applyThemeColor();
}
</script>

<style lang="scss" scoped>
.theme-color-component {
    display: flex;
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
}
</style>

<style lang="scss">
.theme-picker {
    z-index: 9999 !important;
}
</style>
