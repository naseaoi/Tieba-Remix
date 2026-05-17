<template>
    <div v-if="release" class="update-wrapper">
        <div v-if="isLatest !== undefined" class="latest-info" :class="{ 'is-latest': isLatest }">
            <div class="icon">{{ isLatest ? 'check' : 'warning' }}</div>
            <div class="content">{{ isLatest ? '当前是最新版本' : '检测到新版本' }}</div>
        </div>

        <template v-if="!isLatest">
            <div class="title-container">
                <h2 class="title">{{ release?.name }}</h2>
                <div v-if="release?.prerelease" class="is-pre-release">预览版</div>
            </div>

            <div class="release-body markdown" v-html="releaseHtml"></div>

            <div class="update-controls">
                <UserButton class="up-button download-button" shadow-border theme-style is-anchor
                    :href="installUrl">安装更新
                </UserButton>
            </div>
        </template>
    </div>

    <div v-else-if="loading" class="status-wrapper">
        <div class="icon">sync</div>
        <div class="status-text">正在检查更新...</div>
    </div>

    <div v-else class="status-wrapper">
        <div class="icon">{{ errorIcon }}</div>
        <div class="status-text">{{ errorText }}</div>
        <UserButton v-if="canRetry" class="retry-button" shadow-border @click="loadRelease">重新检查</UserButton>
    </div>
</template>

<script lang="ts" setup>
import { GM_info } from "$";
import { ReleaseFetchErrorKind, getLatestReleaseFromGitee, resolveReleaseInstallUrl } from "@/lib/api/remixed";
import { GiteeRelease } from "@/lib/user-values";
import { renderMarkdown } from "@/lib/utils/markdown";
import { UserButton } from "user-view";
import { computed, onMounted, ref } from "vue";

const release = ref<GiteeRelease>();
const releaseHtml = ref("");
const isLatest = ref<boolean>();
const loading = ref(true);
const errorKind = ref<ReleaseFetchErrorKind>();
const errorText = ref("");

const scriptInfo = GM_info;

const errorIcon = computed(() => {
    switch (errorKind.value) {
        case "disabled": return "do_not_disturb_on";
        case "ratelimit": return "hourglass_top";
        case "network": return "wifi_off";
        case "notfound": return "inventory_2";
        default: return "warning";
    }
});

const installUrl = computed(() => release.value ? resolveReleaseInstallUrl(release.value) : undefined);

const canRetry = computed(() => errorKind.value !== "disabled");

async function loadRelease() {
    loading.value = true;
    errorKind.value = undefined;
    errorText.value = "";
    release.value = undefined;
    releaseHtml.value = "";
    isLatest.value = undefined;

    // 强制刷新跳过缓存
    const outcome = await getLatestReleaseFromGitee(true);

    loading.value = false;

    if (outcome.release) {
        release.value = outcome.release;
        isLatest.value = `v${scriptInfo.script.version}` >= outcome.release.tag_name;
        if (!isLatest.value && outcome.release.body) {
            releaseHtml.value = await renderMarkdown(outcome.release.body);
        }
    } else {
        errorKind.value = outcome.errorKind;
        errorText.value = outcome.errorMessage ?? "未知错误";
    }
}

onMounted(loadRelease);
</script>

<style lang="scss" scoped>
.update-wrapper {
    display: flex;
    max-width: 100%;
    flex-direction: column;
    gap: 8px;

    .latest-info {
        display: flex;
        align-items: center;
        padding: 2px 8px;
        border-radius: 16px;
        margin: auto;
        margin-bottom: 12px;
        background-color: var(--level-blue-background);
        color: var(--level-blue-fore);
        gap: 6px;
    }

    .latest-info.is-latest {
        background-color: var(--level-green-background);
        color: var(--level-green-fore);
    }

    .title-container {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;

        .title {
            flex-shrink: 1;
            font-size: 20px;
            font-weight: var(--font-weight-bold);
        }

        .is-pre-release {
            min-width: max-content;
            padding: 2px 8px;
            border-radius: 16px;
            background-color: var(--level-orange-background);
            color: var(--level-orange-fore);
            font-size: 14px;
        }
    }

    .update-controls {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 8px;
        gap: 8px;

        .up-button {
            padding: 4px 8px;
            border-radius: 10px;
            font-size: 15px;
            font-weight: var(--font-weight-bold);
        }
    }
}

.status-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 160px;
    padding: 24px 12px;
    gap: 10px;
    color: var(--light-fore);
    text-align: center;

    .icon {
        font-family: var(--symbol-font, "Material Symbols Outlined");
        font-size: 56px;
        color: var(--minimal-fore);
        line-height: 1;
    }

    .status-text {
        font-size: 13px;
        line-height: 1.5;
        max-width: 360px;
    }

    .retry-button {
        margin-top: 4px;
        padding: 6px 14px;
        font-size: 13px;
        border-radius: 6px;
    }
}
</style>
