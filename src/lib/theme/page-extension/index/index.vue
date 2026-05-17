<template>
    <div class="index-wrapper" :style="{ '--sticky-top': stickyTopPx + 'px' }">
        <div class="grid-container">
            <div class="head-controls">
                <SearchControls />
            </div>

            <FollowedForums :logged-in="loggedIn" />

            <BangTopics :topic-list="topicList" />

            <div id="carousel_wrap"></div>
        </div>

        <div ref="masonryContainer" class="masonry-container">
            <div ref="feedsHeader" class="block-controls feeds sticky-header"
                :class="{ stuck: isFeedsHeaderStuck }">
                <p class="block-title">
                    <span class="block-title-icon icon-feeds" v-html="ICON_FEEDS"></span>
                    <span>推送</span>
                </p>

                <BlockPanel class="actions"
                    v-if="feedsMasonry && feedsMasonry.feeds && (feedsMasonry.feeds.length > 0 || feedsMasonry.isFetchingFeeds)">
                    <UserButton class="panel-button icon refresh" title="刷新推送"
                        unset-background @click="refreshFeeds" no-border>
                        refresh
                    </UserButton>
                </BlockPanel>
            </div>

            <FeedsMasonry ref="feedsMasonry" :init-feeds="initFeeds" show-progress></FeedsMasonry>

            <div v-if="initFeeds.length === 0" class="empty-container">
                <p class="no-feed-content">没有更多了</p>
            </div>
        </div>

        <Transition name="back-to-top">
            <UserButton v-if="isFeedsHeaderStuck" class="back-to-top-btn" title="回到「推送」顶部"
                @click="scrollToFeeds" no-border>
                <span class="icon">arrow_upward</span>
            </UserButton>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import BlockPanel from "@/components/block-panel.vue";
import FeedsMasonry from "@/components/feeds-masonry.vue";
import {
    TopicList,
    TopicListResponse,
    UserInfoResponse,
    tiebaAPI,
} from "@/lib/api/tieba";
import { errorMessage, requestInstance } from "@/lib/utils";
import { unreadFeeds } from "@/lib/user-values";
import { toast, UserButton } from "user-view";
import { computed, onMounted, provide, ref } from "vue";

import { ICON_FEEDS } from "./block-icons";
import BangTopics from "./components/bang-topics.vue";
import FollowedForums from "./components/followed-forums.vue";
import SearchControls from "./components/search-controls.vue";
import { StickyHeadersKey, useStickyHeaders } from "./use-sticky-headers";

const initFeeds = ref<TiebaPost[]>([]);
const userInfo = ref<UserInfoResponse["data"]>();
const loggedIn = computed(() => !!userInfo.value);
const topicList = ref<TopicList[]>([]);

const masonryContainer = ref<HTMLDivElement>();
const feedsHeader = ref<HTMLDivElement>();
const feedsMasonry = ref<InstanceType<typeof FeedsMasonry> | null>(null);

const stickyTopPx = computed(() => 8);

const { register } = useStickyHeaders(() => stickyTopPx.value);
provide(StickyHeadersKey, register);
const isFeedsHeaderStuck = register(feedsHeader);

initFeeds.value = unreadFeeds.get();

function scrollToFeeds() {
    if (!masonryContainer.value) return;
    window.scrollTo({
        top: masonryContainer.value.offsetTop - stickyTopPx.value,
        behavior: "smooth",
    });
}

function refreshFeeds() {
    scrollToFeeds();
    feedsMasonry.value?.refresh();
}

onMounted(() => {
    init();
});

async function init() {
    const [userInfoData, topicListResp] = await Promise.all([
        (async () => {
            try {
                const userInfoResp = (await (await tiebaAPI.userInfo()).json() as UserInfoResponse);
                if (userInfoResp) return userInfoResp.data;
            } catch (error) {
                toast({
                    message: errorMessage(error as Error),
                    type: "error",
                    duration: 6000,
                });
            }
        })(),
        requestInstance(tiebaAPI.topicList()) as Promise<TopicListResponse>,
    ]);

    userInfo.value = userInfoData;

    if (topicListResp) {
        topicList.value.push(...topicListResp.data.bang_topic.topic_list);
    }
}
</script>

<style scoped lang="scss">
a {
    color: unset;
    text-decoration: none;
}

.index-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;

    :deep(.block-controls) {
        display: flex;
        width: 100%;
        align-items: center;
        gap: 8px;

        .block-title {
            display: flex;
            align-items: center;
            margin: 0;
            font-size: 18px;
            font-weight: var(--font-weight-bold);
            gap: 8px;

            .block-title-icon {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 20px;
                height: 20px;

                svg {
                    width: 18px;
                    height: 18px;
                    stroke-width: 2;
                }

                &.icon-followed {
                    color: #ef4444;

                    svg {
                        fill: rgb(239 68 68 / 18%);
                    }
                }

                &.icon-topic {
                    color: #f97316;

                    svg {
                        fill: rgb(249 115 22 / 16%);
                    }
                }

                &.icon-feeds {
                    color: var(--tieba-theme-color);
                }
            }
        }
    }

    :deep(.block-panel) {
        margin-left: auto;

        &.left-align {
            margin-left: 0;
        }
    }

    :deep(.sticky-header) {
        position: sticky;
        top: var(--sticky-top, 0px);
        z-index: 5;
        box-sizing: border-box;
        padding: 8px 12px;
        border-radius: 12px;
        transition: background-color var(--default-duration),
            box-shadow var(--default-duration),
            backdrop-filter var(--default-duration);

        &.stuck {
            background-color: var(--surface-glass);
            @include blur-effect(12px);
            box-shadow: 0 2px 8px rgb(0 0 0 / 6%);

            html.dark-theme & {
                box-shadow: 0 2px 12px rgb(0 0 0 / 40%);
            }
        }
    }

    .grid-container {
        display: grid;
        max-width: var(--content-max);
        margin: 16px;
        gap: 36px;
        grid-template-rows: repeat(1, 1fr);

        .head-controls {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 24px;
            margin-top: 24px;
            gap: 24px;
        }
    }

    .masonry-container {
        display: flex;
        width: calc(100% - 32px);
        max-width: var(--content-max);
        box-sizing: border-box;
        flex-direction: column;
        align-items: center;
        gap: 8px;

        .empty-container {
            .no-feed-content {
                color: var(--minimal-fore);
                font-size: small;
                text-align: center;
            }
        }
    }

    .back-to-top-btn {
        position: fixed;
        z-index: 1100;
        right: max(20px, calc((100% - var(--content-max)) / 2 - 56px));
        bottom: 32px;
        display: flex;
        width: 44px;
        height: 44px;
        align-items: center;
        justify-content: center;
        padding: 0;
        border: 1px solid var(--border-color);
        border-radius: 12px;
        background-color: var(--surface-glass);
        @include blur-effect(12px);
        box-shadow: 0 4px 16px rgb(0 0 0 / 12%);
        color: var(--default-fore);

        .icon {
            font-size: 22px;
        }

        &:hover {
            background-color: var(--default-hover);
        }

        &:active {
            background-color: var(--default-active);
        }

        html.dark-theme & {
            box-shadow: 0 4px 16px rgb(0 0 0 / 40%);
        }
    }

    .back-to-top-enter-active,
    .back-to-top-leave-active {
        transition: opacity 0.2s ease, transform 0.2s ease;
    }

    .back-to-top-enter-from,
    .back-to-top-leave-to {
        opacity: 0;
        transform: translateY(12px);
    }
}
</style>
