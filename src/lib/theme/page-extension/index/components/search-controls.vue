<template>
    <div class="search-controls">
        <UserTextbox v-model="searchText" class="search-box" placeholder="搜索 贴吧" autocomplete="none"
            @focus="searchBoxFocus" @input="searchMatch">
        </UserTextbox>

        <UserButton class="search-button" :theme-style="true" no-border>搜索</UserButton>

        <div v-show="suggToggle && suggestions.length > 0" class="search-suggestions">
            <UserButton :is-anchor="true" class="search-elem" v-for="sugg in suggestions" :href="sugg.href"
                target="_blank" no-border>
                <img class="sugg-img" :src="sugg.image" alt="">
                <div class="sugg-content">
                    <p class="sugg-title">{{ sugg.title }}</p>
                    <p class="sugg-desc">{{ sugg.desc }}</p>
                </div>
            </UserButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import { UserButton, UserTextbox } from "user-view";
import { useSearchSuggestions } from "../use-search-suggestions";

const { searchText, suggToggle, suggestions, searchBoxFocus, searchMatch } = useSearchSuggestions();
</script>

<style scoped lang="scss">
.search-controls {
    position: relative;
    display: grid;
    width: 100%;
    max-width: 420px;
    justify-content: center;
    grid-template-columns: 1fr 72px;

    .search-box {
        width: 100%;
        padding: 8px;
        border-bottom-right-radius: 0;
        border-top-right-radius: 0;
        font-size: 16px;
    }

    .search-button.search-button {
        border: none;
        border-bottom-left-radius: 0;
        border-top-left-radius: 0;
        background-color: var(--tieba-theme-color);
        color: var(--default-background) !important;
        font-size: 16px;
        font-weight: var(--font-weight-bold);
        transition: background-color var(--default-duration);

        &:hover {
            background-color: var(--tieba-theme-hover, var(--tieba-theme-color));
        }

        &:active {
            background-color: var(--tieba-theme-active, var(--tieba-theme-color));
        }
    }

    .search-suggestions {
        position: absolute;
        z-index: 1;
        top: 100%;
        display: flex;
        overflow: hidden;
        width: 100%;
        box-sizing: border-box;
        flex-direction: column;
        border: 1px solid var(--border-color);
        border-radius: 6px;
        margin-top: 4px;
        background-color: var(--default-background);
        box-shadow: 0 0 20px rgb(0 0 0 / 20%);

        @include fade-in(0.2s);

        .search-elem {
            $img-size: 42px;
            $gap: 8px;
            display: flex;
            overflow: hidden;
            box-sizing: border-box;
            padding: $gap;
            border: none;
            border-radius: 0;

            @keyframes stretch {
                0% {
                    padding: calc($gap / 2) $gap;
                }

                100% {
                    padding: $gap;
                }
            }

            animation: stretch 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
            gap: $gap;
            text-align: justify;

            .sugg-img {
                width: $img-size;
                height: $img-size;
                border-radius: 8px;
            }

            .sugg-content {
                position: relative;
                display: flex;
                width: calc(100% - $img-size - $gap);
                flex-direction: column;
                justify-content: center;
                gap: 4px;

                .sugg-title {
                    overflow: hidden;
                    margin: 0;
                    font-size: 14px;
                    font-weight: var(--font-weight-bold);
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .sugg-desc {
                    overflow: hidden;
                    margin: 0;
                    color: var(--light-fore);
                    font-size: 12px;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            }
        }
    }
}
</style>
