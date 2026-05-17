<template>
    <UserDialog ref="dialog" v-bind="dialogOpts" @unload="handleUnload">
        <div class="update-notify-dialog-shell">
            <div class="update-notify-dialog">
                <header class="dialog-header">
                    <div class="dialog-icon" v-html="ICON_SPARK"></div>
                    <h3 class="dialog-title">{{ title }}</h3>
                </header>

                <div class="dialog-body markdown" v-html="bodyHtml"></div>

                <footer class="dialog-actions">
                    <component :is="action.href ? 'a' : 'button'" v-for="action in actions" :key="action.value"
                        :type="action.href ? undefined : 'button'" :href="action.href"
                        class="dialog-btn"
                        :class="`btn-${action.variant ?? 'default'}`"
                        @click="handleAction(action.value, action.href)">
                        {{ action.text }}
                    </component>
                </footer>
            </div>
        </div>
    </UserDialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { UserDialog, UserDialogOpts } from "user-view";

export interface UpdateNotifyAction {
    text: string;
    value: string;
    variant?: "primary" | "default";
    href?: string;
}

export interface UpdateNotifyDialogProps {
    title?: string;
    bodyHtml?: string;
    actions: UpdateNotifyAction[];
}

const props = defineProps<UpdateNotifyDialogProps & {
    onUnload?: (payload: string) => void;
}>();

const dialog = ref<InstanceType<typeof UserDialog>>();
const response = ref<string>("");

const ICON_SPARK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3M12 18v3M5.64 5.64l2.12 2.12M16.24 16.24l2.12 2.12M3 12h3M18 12h3M5.64 18.36l2.12-2.12M16.24 7.76l2.12-2.12"/></svg>`;

const dialogOpts: UserDialogOpts = {
    animation: false,
    force: false,
    clickModalToUnload: true,
    pressEscapeToUnload: true,
    uniqueName: "remixed-update-notify-dialog",
    shadowMode: true,
    containerStyle: {
        margin: "16px",
        padding: "0",
        border: "none",
        borderRadius: "0",
        background: "transparent",
        boxShadow: "none",
    },
    contentStyle: {
        padding: "0",
    },
};

function handleAction(value: string, href?: string) {
    response.value = value;

    if (href) {
        requestAnimationFrame(() => dialog.value?.unload(value));
        return;
    }

    dialog.value?.unload(value);
}

function handleUnload(payload?: string) {
    props.onUnload?.(payload ?? response.value);
}
</script>

<style lang="scss" scoped>
$radius-sm: 6px;
$radius-md: 8px;
$radius-lg: 12px;
$trans-fast: 0.12s;
$ease: cubic-bezier(0.4, 0, 0.2, 1);

.update-notify-dialog {
    display: flex;
    width: 560px;
    max-width: calc(100vw - 32px);
    max-height: calc(100vh - 64px);
    flex-direction: column;
    overflow: hidden;
    border: 1px solid var(--border-color);
    border-radius: $radius-lg;
    background-color: var(--default-background);
    color: var(--default-fore);
    font-family: var(--user-font, sans-serif);
    box-shadow: 0 16px 48px rgb(0 0 0 / 24%);
}

.update-notify-dialog-shell {
    display: flex;
    max-width: calc(100vw - 32px);
    max-height: calc(100vh - 64px);
    background: transparent;
}

.dialog-header {
    display: flex;
    align-items: center;
    padding: 20px 24px 0;
    gap: 12px;

    .dialog-icon {
        display: inline-flex;
        width: 36px;
        height: 36px;
        flex: 0 0 auto;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--tieba-theme-color);
        border-radius: 50%;
        color: var(--tieba-theme-color);

        :deep(svg) {
            width: 18px;
            height: 18px;
        }
    }

    .dialog-title {
        margin: 0;
        color: var(--default-fore);
        font-size: 16px;
        font-weight: var(--font-weight-bold);
        letter-spacing: -0.01em;
    }
}

.dialog-body {
    padding: 16px 24px 20px;
    overflow-y: auto;
    color: var(--light-fore);
    font-size: 14px;
    line-height: 1.6;

    :deep(h1), :deep(h2), :deep(h3) {
        margin-top: 12px;
        margin-bottom: 8px;
        color: var(--default-fore);
        font-size: 15px;
        font-weight: var(--font-weight-bold);
    }

    :deep(p) {
        margin: 6px 0;
    }

    :deep(ul), :deep(ol) {
        padding-left: 20px;
        margin: 6px 0;
    }

    :deep(li) {
        margin: 2px 0;
    }

    :deep(code) {
        padding: 1px 6px;
        border-radius: 4px;
        background-color: var(--deep-background);
        font-family: var(--code-monospace, monospace);
        font-size: 13px;
    }

    :deep(a) {
        color: var(--tieba-theme-color);
        text-decoration: none;

        &:hover {
            text-decoration: underline;
        }
    }
}

.dialog-actions {
    display: flex;
    padding: 12px 16px;
    border-top: 1px solid var(--border-color);
    background-color: var(--deep-background);
    gap: 8px;
    justify-content: flex-end;
}

.dialog-btn {
    display: inline-flex;
    box-sizing: border-box;
    min-width: 88px;
    height: 32px;
    align-items: center;
    justify-content: center;
    padding: 0 14px;
    border: 1px solid var(--border-color);
    border-radius: $radius-sm;
    appearance: none;
    background-color: var(--default-background);
    background-image: none;
    box-shadow: none;
    color: var(--default-fore);
    cursor: pointer;
    font-family: inherit;
    font-size: 13px;
    font-weight: var(--font-weight-bold);
    line-height: 1;
    outline: none;
    text-decoration: none;
    transition:
        background-color $trans-fast $ease,
        border-color $trans-fast $ease,
        color $trans-fast $ease,
        box-shadow $trans-fast $ease;

    &:hover {
        background-color: var(--default-hover);
    }

    &:focus-visible {
        box-shadow: 0 0 0 2px var(--tieba-theme-color, var(--default-fore));
    }

    &.btn-primary {
        border-color: var(--default-fore);
        background-color: var(--default-fore);
        color: var(--default-background);

        &:hover {
            opacity: 0.88;
            background-color: var(--default-fore);
        }
    }

    &.btn-default:hover {
        border-color: var(--light-fore);
    }
}

html:not(.style-vercel) {
    .update-notify-dialog {
        border-radius: 16px;
    }

    .dialog-btn {
        border-radius: 10px;

        &.btn-primary {
            border-color: var(--tieba-theme-color);
            background-color: var(--tieba-theme-color);
            color: var(--default-background);

            &:hover {
                background-color: var(--tieba-theme-color);
                opacity: 0.92;
            }
        }
    }
}
</style>

<style lang="scss">
.user-dialog-modal:has(.update-notify-dialog-shell) .user-dialog.shadow,
.user-dialog-modal:has(.update-notify-dialog-shell) .user-dialog.shadow .dialog-content {
    overflow: hidden !important;
    padding: 0 !important;
    border: none !important;
    border-radius: 0 !important;
    background: transparent !important;
    box-shadow: none !important;
    outline: none !important;
}
</style>
