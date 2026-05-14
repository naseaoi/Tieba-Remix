<template>
    <div class="about-wrapper">
        <div class="main-title">
            <div class="title">{{ MainTitle }}</div>
        </div>

        <div class="script-info">
            <div class="author-info">
                <div class="version">v{{ scriptInfo.script.version }}</div>
                <div class="author">@{{ Owner }}</div>
            </div>

            <div class="about-desc">
                <div v-for="line in `本开源项目使用 MIT 协议`.split('\n')" class="line">{{ line }}</div>
            </div>
        </div>

        <div class="about-controls">
            <UserButton class="about-button github" :is-anchor="true" :href="GithubRepo" :shadow-border="true"
                target="_blank">开放源代码
            </UserButton>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { GM_info } from "$";
import { GithubRepo, MainTitle, Owner } from "@/lib/user-values";
import { UserButton } from "user-view";

const scriptInfo = GM_info;
</script>

<style lang="scss" scoped>
.about-wrapper {
    display: flex;
    width: 100%;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px 8px;
    margin: auto;
    gap: 16px;

    .main-title {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 14px;
        line-height: 1;

        .title {
            display: flex;
            align-items: center;
            color: var(--highlight-fore);
            font-size: 26px;
            font-style: normal;
            font-weight: var(--font-weight-bold);
            letter-spacing: -0.01em;
            line-height: 1;
        }
    }

    .script-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        color: var(--minimal-fore);
        gap: 6px;

        .author-info {
            display: flex;
            align-items: baseline;
            font-family: var(--code-monospace);
            font-size: 12px;
            gap: 8px;
        }

        .about-desc {
            font-size: 12px;
        }
    }

    .about-controls {
        display: flex;
        width: 100%;
        align-items: center;
        justify-content: center;
        margin-top: 8px;
        gap: 8px;

        .about-button {
            padding: 6px 14px;
            border-radius: 6px;
            font-size: 13px;
        }
    }
}
</style>
