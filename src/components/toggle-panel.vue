<template>
    <UserDialog ref="dialog" v-bind="dialogOpts">
        <div class="toggle-panel">
            <div v-for="(toggle, index) in props.toggles" class="toggle-container">
                <button type="button" class="panel-button" :class="toggleStates[index] ? 'toggle-on' : 'toggle-off'"
                    :title="toggle.name" :aria-label="toggle.name" @click="handleToggleClick(index)">
                    {{ toggle.icon }}
                </button>
            </div>
        </div>
    </UserDialog>
</template>

<script lang="ts" setup>
import { UserDialog, UserDialogOpts } from "user-view";
import { onMounted, onUnmounted, ref } from "vue";

const PANEL_GAP = 10;
const VIEWPORT_PADDING = 12;

interface Toggle {
    icon: string;
    defaultValue?: boolean;
    name?: string;
    event?: ((now: boolean) => void);
}

export interface TogglePanelProps {
    toggles: Toggle[];
    anchorRect?: { top: number; bottom: number; left: number; right: number; width: number; height: number };
}

const props = defineProps<TogglePanelProps>();
const dialog = ref<InstanceType<typeof UserDialog>>();
const closeOnScroll = () => unload();
const toggleStates = ref(props.toggles.map(toggle => !!toggle.defaultValue));

function unload() {
    dialog.value?.unload();
}

function handleToggleClick(index: number) {
    const nextState = !toggleStates.value[index];
    toggleStates.value[index] = nextState;
    props.toggles[index]?.event?.(nextState);
}

defineExpose({ unload });

onMounted(() => {
    window.addEventListener("scroll", closeOnScroll, true);
    window.addEventListener("resize", closeOnScroll);
});

onUnmounted(() => {
    window.removeEventListener("scroll", closeOnScroll, true);
    window.removeEventListener("resize", closeOnScroll);
});

function getAnchorContainerStyle() {
    if (!props.anchorRect) return {};

    const maxLeft = Math.max(
        VIEWPORT_PADDING,
        window.innerWidth - props.anchorRect.width - VIEWPORT_PADDING,
    );

    return {
        position: "fixed",
        bottom: `${window.innerHeight - props.anchorRect.top + PANEL_GAP}px`,
        left: `${Math.min(Math.max(props.anchorRect.left, VIEWPORT_PADDING), maxLeft)}px`,
        margin: "0",
        padding: "0",
        background: "transparent",
        border: "none",
        borderRadius: "0",
        boxShadow: "none",
    };
}

const dialogOpts: UserDialogOpts = {
    animation: false,
    modal: false,
    lockScroll: false,
    modalStyle: {
        alignItems: "flex-end",
        justifyContent: "flex-start",
        background: "none",
    },
    containerStyle: getAnchorContainerStyle(),
    contentStyle: {
        maxWidth: "none",
        maxHeight: "calc(100vh - 24px)",
        padding: "0",
    },
};
</script>

<style lang="scss">
:is(.user-dialog-modal .user-dialog.default, .user-dialog-modal .user-dialog.default .dialog-content):has(.toggle-panel) {
    overflow: visible !important;
    padding: 0 !important;
    border: none !important;
    border-radius: 0 !important;
    background: transparent !important;
    box-shadow: none !important;
}

.toggle-panel {
    --float-button-size: 40px;
    --float-button-radius: 12px;
    --float-button-border: rgb(0 0 0 / 10%);
    --float-button-border-hover: rgb(0 0 0 / 16%);
    display: flex;
    flex-direction: column-reverse;
    gap: 8px;
    overflow: visible;

    .toggle-container {
        display: flex;
        width: var(--float-button-size);
        height: var(--float-button-size);

        .panel-button {
            @extend %icon;
            box-sizing: border-box;
            appearance: none;
            min-width: var(--float-button-size);
            min-height: var(--float-button-size);
            max-width: var(--float-button-size);
            max-height: var(--float-button-size);
            padding: 0;
            margin: 0;
            width: var(--float-button-size);
            height: var(--float-button-size);
            border: 1px solid var(--float-button-border) !important;
            border-radius: var(--float-button-radius) !important;
            background-color: var(--default-background) !important;
            background-image: none !important;
            box-shadow: none !important;
            outline: none !important;
            font-size: 24px;
            font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 40;
            display: flex;
            align-items: center;
            justify-content: center;
            flex: 0 0 var(--float-button-size);
            line-height: 1;
            text-align: center;
            vertical-align: middle;
            cursor: pointer;
            color: var(--minimal-fore);
            transition:
                border-color 0.18s ease,
                background-color 0.18s ease,
                color 0.18s ease,
                box-shadow 0.18s ease,
                transform 0.18s ease;

            &:hover {
                border-color: var(--float-button-border-hover) !important;
                background-color: var(--default-background) !important;
                color: var(--tieba-theme-color) !important;
                transform: translateY(-1px);
            }

            &:active {
                background-color: var(--default-background) !important;
                transform: translateY(0);
            }

            &:focus {
                box-shadow: 0 0 0 2px var(--tieba-theme-color) !important;
            }

            &::before,
            &::after {
                box-shadow: none !important;
            }

            &.toggle-off {
                color: var(--minimal-fore) !important;
            }

            &.toggle-on {
                @extend %filled-icon;
                border-color: var(--tieba-theme-color) !important;
                background-color: var(--tieba-theme-background) !important;
                color: var(--tieba-theme-color) !important;

                &:hover {
                    background-color: var(--tieba-theme-background) !important;
                    color: var(--tieba-theme-hover) !important;
                }

                &:active {
                    background-color: var(--tieba-theme-background) !important;
                    color: var(--tieba-theme-active) !important;
                }

                &:focus {
                    box-shadow: 0 0 0 1px var(--tieba-theme-color);
                }
            }
        }
    }
}
</style>
