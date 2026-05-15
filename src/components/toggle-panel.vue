<template>
    <UserDialog v-bind="dialogOpts">
        <div class="toggle-panel">
            <div v-for="toggle in props.toggles" class="toggle-container">
                <UserToggle class="panel-button" :model-value="toggle.defaultValue ?? false" icon-type shadow-border
                    @click="toggle.event">{{ toggle.icon }}
                </UserToggle>
                <div class="toggle-name">{{ toggle.name }}</div>
            </div>
        </div>
    </UserDialog>
</template>

<script lang="ts" setup>
import { UserDialog, UserDialogOpts, UserToggle } from "user-view";

interface Toggle {
    icon: string;
    defaultValue?: boolean;
    name?: string;
    event?: ((now: boolean) => void);
}

export interface TogglePanelProps {
    toggles: Toggle[];
    anchorRect?: { bottom: number; left: number; width: number };
}

const props = defineProps<TogglePanelProps>();

const dialogOpts: UserDialogOpts = {
    animation: false,
    modal: true,
    modalStyle: {
        alignItems: "flex-end",
        justifyContent: "flex-start",
        background: "none",
    },
    containerStyle: props.anchorRect ? {
        position: "fixed",
        bottom: `${window.innerHeight - props.anchorRect.bottom + props.anchorRect.width - 12}px`,
        left: `${props.anchorRect.left}px`,
        margin: "0",
    } : {},
    contentStyle: {
        maxWidth: "none",
        maxHeight: "60vh",
    },
};
</script>

<style lang="scss" scoped>
.toggle-panel {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .toggle-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;

        .panel-button {
            width: 36px;
            height: 36px;
            border-radius: 8px;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;

            &:focus {
                box-shadow: 0 0 0 2px var(--tieba-theme-color) !important;
            }

            &.toggle-off {
                @extend %icon;
                color: var(--minimal-fore);
            }

            &.toggle-on {
                @extend %filled-icon;
                background-color: var(--tieba-theme-color);
                color: var(--default-background);

                &:hover {
                    background-color: var(--tieba-theme-hover);
                }

                &:focus {
                    box-shadow: 0 0 0 1px var(--tieba-theme-color);
                }
            }
        }

        .toggle-name {
            color: var(--light-fore);
            font-size: 12px;
        }
    }
}
</style>
