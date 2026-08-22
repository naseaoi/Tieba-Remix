<template>
    <UserDialog ref="dialog" v-bind="dialogOpts">
        <LoaderCircle class="loading-svg" aria-hidden="true" />
    </UserDialog>
</template>

<script setup lang="ts">
import { LoaderCircle } from "@lucide/vue";
import { styleTheme } from "@/lib/user-values";
import { waitUntil } from "@/lib/utils";
import { UserDialog, UserDialogOpts } from "user-view";
import { onMounted, ref } from "vue";

export interface AwaitDialogOpts {
    unloadPred?: () => boolean;
    timeout?: number;
    unloadAfterTimeout?: boolean;
    /** 透明化容器（去白底/边框/圆角），用于嵌入式加载场景（如看图器入口） */
    transparent?: boolean;
}

const props = withDefaults(defineProps<AwaitDialogOpts>(), {
    force: true,
    unloadPred: () => false,
    timeout: Infinity,
    unloadAfterTimeout: true,
    transparent: false,
});

const emit = defineEmits<{
    (e: "timeout"): void;
}>();

const dialogOpts: UserDialogOpts = {
    animation: false,
    force: true,
    uniqueName: "await-dialog",
    ...(props.transparent ? {
        shadowMode: true,
        containerStyle: {
            background: "transparent",
            border: "none",
            boxShadow: "none",
            margin: "0",
            borderRadius: "0",
            padding: "0",
        },
        ...(styleTheme.get() === "vercel" ? {
            modalStyle: {
                backgroundColor: "rgb(0 0 0 / 92%)",
                animation: "kf-viewer-mask-fade 0.25s ease both",
            },
        } : {}),
    } : {}),
};

const dialog = ref<InstanceType<typeof UserDialog>>();

onMounted(() => {
    if (props.unloadPred) {
        waitUntil(props.unloadPred, props.timeout)
            .then(() => {
                dialog.value?.unload();
            })
            .catch(() => {
                emit("timeout");
                if (props.unloadAfterTimeout) {
                    dialog.value?.unload();
                }
            });
    }
});
</script>

<style lang="scss">
// 全局 keyframes（与 images-viewer 共用），定义在非 scoped block 以保留原名
@keyframes kf-viewer-mask-fade {
    from { background-color: transparent; }
}
</style>

<style scoped lang="scss">
@keyframes rotate {
    100% {
        transform: rotate(360deg);
    }
}

.loading-svg {
    width: 64px;
    height: 64px;
    animation: rotate 1s linear infinite;
    color: var(--tieba-theme-color);
    stroke-width: 1.75;
    transform-origin: center;
}
</style>
