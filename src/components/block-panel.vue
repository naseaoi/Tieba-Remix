<template>
    <div class="block-panel blur-if-custom-background">
        <slot></slot>
    </div>
</template>

<script lang="ts" setup></script>

<style lang="scss">
.block-panel {
    display: flex;
    min-width: 30px;
    height: 26px;
    align-items: center;
    justify-content: center;
    padding: 2px 8px;
    border-radius: 8px;
    background-color: var(--trans-light-background);
    font-size: 14px;
    text-align: center;

    .panel-button,
    .panel-btn {
        display: flex;
        width: 30px;
        height: 30px;
        align-items: center;
        justify-content: center;
        padding: 4px;
        border: none !important;
        border-radius: 6px;
        transition:
            background-color var(--fast-duration, 0.15s),
            color var(--fast-duration, 0.15s);

        svg {
            width: 18px;
            height: 18px;
            color: var(--light-fore);
            stroke-width: 1.75;
        }

        &:hover {
            background-color: var(--default-hover);
            color: var(--default-fore);
        }
    }

    &.left-align {
        margin-left: 0;
    }

    // 按钮组：透明背景，按钮单独显示为圆角矩形
    &.actions {
        padding: 0;
        background-color: transparent;
        gap: 10px;
    }
}
</style>
