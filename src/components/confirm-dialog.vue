<template>
    <UserDialog ref="dialog" v-bind="dialogOpts" @unload="handleUnload">
        <div class="confirm-dialog" :class="[`variant-${variant}`, { 'is-danger': danger }]">
            <header v-if="title || resolvedIcon" class="confirm-header">
                <div v-if="resolvedIcon" class="confirm-icon" v-html="resolvedIcon"></div>
                <h3 v-if="title" class="confirm-title">{{ title }}</h3>
            </header>

            <div class="confirm-body">
                <p class="confirm-content">{{ content }}</p>
            </div>

            <footer class="confirm-actions">
                <button v-if="showCancelButton" type="button" class="confirm-btn negative"
                    @click="handleAction('negative')">
                    {{ negativeText }}
                </button>
                <button ref="positiveRef" type="button" class="confirm-btn positive"
                    :class="{ 'is-danger': danger }" @click="handleAction('positive')">
                    {{ positiveText }}
                </button>
            </footer>
        </div>
    </UserDialog>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from "vue";
import { UserDialog, UserDialogOpts } from "user-view";

export type ConfirmDialogType = "okOnly" | "okCancel" | "forceTrueFalse";
export type ConfirmDialogResponse = "positive" | "negative" | "cancel";
export type ConfirmDialogVariant = "info" | "warning" | "danger" | "success";

export interface ConfirmDialogProps {
    title?: string;
    content?: string;
    type?: ConfirmDialogType;
    variant?: ConfirmDialogVariant;
    /** 危险动作（红色确认按钮） */
    danger?: boolean;
    /** 自定义图标（HTML 字符串，例如内联 SVG）。传空字符串可隐藏图标 */
    icon?: string;
    positiveText?: string;
    negativeText?: string;
}

const props = withDefaults(defineProps<ConfirmDialogProps & {
    onUnload?: (payload: ConfirmDialogResponse) => void;
}>(), {
    type: "okCancel",
    variant: "info",
    danger: false,
    positiveText: "确定",
    negativeText: "取消",
});

const dialog = ref<InstanceType<typeof UserDialog>>();
const positiveRef = ref<HTMLButtonElement>();
const response = ref<ConfirmDialogResponse>("cancel");

const showCancelButton = computed(() => props.type !== "okOnly");

const ICON_PRESETS: Record<ConfirmDialogVariant, string> = {
    info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
    warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    danger: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
};

const resolvedIcon = computed(() => {
    if (props.icon !== undefined) return props.icon;
    return ICON_PRESETS[props.variant];
});

const dialogOpts: UserDialogOpts = {
    animation: false,
    force: props.type === "forceTrueFalse",
    clickModalToUnload: props.type !== "forceTrueFalse",
    pressEscapeToUnload: props.type !== "forceTrueFalse",
    uniqueName: "remixed-confirm-dialog",
    // shadowMode 让 UserDialog 容器不应用 .default 的边框/圆角/背景，
    // 视觉完全交给 .confirm-dialog 自身，避免双层圆角不重合的缝隙。
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

onMounted(() => {
    nextTick(() => positiveRef.value?.focus());
});

function handleAction(action: ConfirmDialogResponse) {
    response.value = action;
    dialog.value?.unload(action);
}

function handleUnload(payload?: ConfirmDialogResponse) {
    props.onUnload?.(payload ?? response.value);
}
</script>

<style lang="scss" scoped>
$radius-sm: 6px;
$radius-md: 8px;
$radius-lg: 12px;
$trans-fast: 0.12s;
$ease: cubic-bezier(0.4, 0, 0.2, 1);

.confirm-dialog {
    display: flex;
    width: 440px;
    max-width: calc(100vw - 32px);
    flex-direction: column;
    overflow: hidden;
    border: 1px solid var(--border-color);
    border-radius: $radius-lg;
    background-color: var(--default-background);
    color: var(--default-fore);
    font-family: var(--user-font, sans-serif);
    box-shadow: 0 16px 48px rgb(0 0 0 / 24%);
}

.confirm-header {
    display: flex;
    align-items: center;
    padding: 20px 24px 0;
    gap: 12px;

    .confirm-icon {
        display: inline-flex;
        width: 36px;
        height: 36px;
        flex: 0 0 auto;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--border-color);
        border-radius: 50%;
        color: var(--default-fore);

        :deep(svg) {
            width: 18px;
            height: 18px;
        }
    }

    .confirm-title {
        margin: 0;
        color: var(--default-fore);
        font-size: 16px;
        font-weight: var(--font-weight-bold);
        letter-spacing: -0.01em;
    }
}

.confirm-dialog.variant-danger .confirm-icon,
.confirm-dialog.is-danger .confirm-icon {
    border-color: var(--error-color);
    color: var(--error-color);
}

.confirm-dialog.variant-warning .confirm-icon {
    border-color: var(--warning-color);
    color: var(--warning-color);
}

.confirm-dialog.variant-success .confirm-icon {
    border-color: var(--check-color);
    color: var(--check-color);
}

.confirm-body {
    padding: 16px 24px 20px;
    color: var(--light-fore);
    font-size: 14px;
    line-height: 1.55;

    .confirm-content {
        margin: 0;
        white-space: pre-wrap;
        word-break: break-word;
    }
}

.confirm-actions {
    display: flex;
    padding: 12px 16px;
    border-top: 1px solid var(--border-color);
    background-color: var(--deep-background);
    gap: 8px;
    justify-content: flex-end;
}

.confirm-btn {
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

    &.positive {
        border-color: var(--default-fore);
        background-color: var(--default-fore);
        color: var(--default-background);

        &:hover {
            opacity: 0.88;
            background-color: var(--default-fore);
        }

        &.is-danger {
            border-color: var(--error-color);
            background-color: var(--error-color);
            color: #fff;

            &:hover {
                background-color: var(--error-color);
            }
        }
    }

    &.negative:hover {
        border-color: var(--light-fore);
    }
}

// Remixed 主题：圆角更大、主按钮使用主题色
html:not(.style-vercel) {
    .confirm-dialog {
        border-radius: 16px;
    }

    .confirm-btn {
        border-radius: 10px;

        &.positive {
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
:is(.user-dialog-modal .user-dialog.default, .user-dialog-modal .user-dialog.default .dialog-content):has(.confirm-dialog) {
    overflow: hidden !important;
    padding: 0 !important;
    border: none !important;
    border-radius: 0 !important;
    background: transparent !important;
    box-shadow: none !important;
}
</style>
