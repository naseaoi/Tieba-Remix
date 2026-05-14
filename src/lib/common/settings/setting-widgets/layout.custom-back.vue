<template>
    <div class="layout-custom-back">
        <div class="head-row">
            <div class="head-text">
                <div class="head-title">自定义背景图</div>
                <div class="head-desc">上传图片作为页面背景图</div>
            </div>
            <div class="head-actions">
                <UserButton class="back-button" @click="clearImage">清除</UserButton>
                <UserButton class="back-button" @click="selectImageFile">上传图片</UserButton>
            </div>
        </div>
        <div v-show="imageData" class="preview-row">
            <img class="custom-image" :src="imageData ?? ''" title="自定义背景" alt="自定义背景"
                :style="`opacity: ${+alphaValue / 100}`">
        </div>
    </div>
</template>

<script lang="ts" setup>
import { customBackground } from "@/lib/user-values";
import { selectLocalFile } from "@/lib/utils";
import { UserButton } from "user-view";
import { onMounted, ref, watch } from "vue";

const imageData = ref<Maybe<string>>(customBackground.get());
const alphaValue = ref("100");

watch(imageData, newValue => {
    customBackground.set(newValue);
});

onMounted(async function () {
    imageData.value = customBackground.get();
});

async function clearImage() {
    imageData.value = undefined;
}

async function selectImageFile() {
    imageData.value = await selectLocalFile("base64") as Maybe<string>;
}
</script>

<style lang="scss" scoped>
.layout-custom-back {
    display: flex;
    width: 100%;
    box-sizing: border-box;
    flex-direction: column;
    padding: 14px 16px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background-color: var(--default-background);
    gap: 12px;
    transition: border-color 0.18s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
        border-color: var(--minimal-fore);
    }

    .head-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;

        .head-text {
            display: flex;
            min-width: 0;
            flex: 1;
            flex-direction: column;
            gap: 3px;

            .head-title {
                color: var(--highlight-fore);
                font-size: 14px;
                font-weight: var(--font-weight-bold);
                line-height: 1.35;
            }

            .head-desc {
                color: var(--light-fore);
                font-size: 12.5px;
                line-height: 1.5;
            }
        }

        .head-actions {
            display: flex;
            flex-shrink: 0;
            align-items: center;
            gap: 8px;

            .back-button {
                padding: 6px 12px;
                font-size: 13px;
            }
        }
    }

    .preview-row {
        display: flex;
        justify-content: center;

        .custom-image {
            max-width: 100%;
            max-height: 280px;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            object-fit: contain;
        }
    }
}
</style>
