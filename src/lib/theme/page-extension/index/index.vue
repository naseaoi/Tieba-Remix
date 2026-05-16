<template>
    <div class="index-wrapper" :style="{ '--sticky-top': stickyTopPx + 'px' }">
        <div class="grid-container">
            <div class="head-controls">
                <!-- <div class="main-title">
                    <img :src="getResource('assets/images/main/icon.png')" alt="icon" class="main-icon">
                    <div class="title">贴吧</div>
                </div> -->

                <!-- 用户按钮 -->
                <!-- <div class="profile-menu-container" @click="profileToggle = !profileToggle">
                    <UserButton class="curr-user">
                        <img :src="userInfo ? tiebaAPI.URL_profile(userInfo.user_portrait) : tiebaAPI.URL_profile('un')"
                            alt="用户头像" class="user-profile">
                    </UserButton>

                    <DropdownMenu v-if="profileToggle" :menu-items="profileMenu!" class="profile-menu" :blur-effect="true"
                        @request-close="profileToggle = false">
                    </DropdownMenu>
                </div> -->

                <!-- 配置按钮 -->
                <!-- <div class="config-menu-container" @click="configToggle = !configToggle">
                    <UserButton class="config-menu-btn icon" :unset-background="true">menu</UserButton>

                    <DropdownMenu v-if="configToggle" :menu-items="configMenu!" class="config-menu" :blur-effect="true"
                        @request-close="configToggle = false">
                    </DropdownMenu>
                </div> -->

                <!-- 搜索组件 -->
                <div class="search-controls">
                    <UserTextbox v-model="searchText" class="search-box" placeholder="搜索 贴吧" autocomplete="none"
                        @focus="searchBoxFocus" @input="searchMatch">
                    </UserTextbox>

                    <UserButton class="search-button" :theme-style="true" no-border>搜索</UserButton>

                    <!-- 搜索建议组件 -->
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
            </div>

            <!-- 关注的吧 -->
            <div v-if="followed" class="block-wrapper followed-container">
                <div ref="followedHeader" class="block-controls followed sticky-header"
                    :class="{ stuck: isFollowedHeaderStuck }">
                    <p class="block-title">
                        <span class="block-title-icon icon-followed" v-html="ICON_FOLLOWED"></span>
                        <span>关注的吧</span>
                    </p>
                    <BlockPanel class="signed-count left-align">{{ signedForums }} /
                        {{ followed?.like_forum.length }}
                    </BlockPanel>

                    <BlockPanel class="followed actions">
                        <UserButton class="panel-btn icon sign-btn" title="一键签到"
                            @click="oneKeySignInstance" unset-background no-border>
                            task_alt
                        </UserButton>
                    </BlockPanel>
                </div>

                <div class="followed-list">
                    <UserButton v-for="forum in followed.like_forum" :is-anchor="true" class="followed-btn"
                        :shadow-border="true" :href="tiebaAPI.URL_forum(forum.forum_name)" target="_blank" no-border>
                        <div v-if="forum.is_sign === 1" class="icon signed">check</div>
                        <div class="forum-title">{{ forum.forum_name }}</div>
                        <div class="forum-level" :class="'level-' + levelToClass(forum.user_level)">
                            {{ forum.user_level }}
                        </div>
                    </UserButton>
                </div>
            </div>

            <!-- 贴吧热议 -->
            <div v-if="topicList.length > 0" class="block-wrapper topic-container"
                :class="{ collapsed: topicCollapsed }">
                <div ref="topicHeader" class="block-controls topics sticky-header"
                    :class="{ stuck: isTopicHeaderStuck }">
                    <p class="block-title">
                        <span class="block-title-icon icon-topic" v-html="ICON_TOPIC"></span>
                        <span>贴吧热议</span>
                    </p>

                    <BlockPanel class="topics actions">
                        <UserButton class="panel-btn icon toggle-collapse"
                            :title="topicCollapsed ? '展开列表' : '收起列表'"
                            @click="toggleTopicCollapsed" :unset-background="true" no-border>
                            {{ topicCollapsed ? 'expand_more' : 'expand_less' }}
                        </UserButton>
                        <UserButton class="panel-btn icon more"
                            :title="topicShowAll ? '只看前 10 条' : '查看更多'"
                            @click="toggleTopicShowAll" :unset-background="true" no-border>
                            more_horiz
                        </UserButton>
                    </BlockPanel>
                </div>

                <div v-show="!topicCollapsed" class="topic-list">
                    <UserButton v-for="topic in displayedTopics" :is-anchor="true" class="topic-btn"
                        :shadow-border="true" :href="topic.topic_url" target="_blank">
                        <img class="topic-img" :src="topic.topic_pic">
                        <div class="topic-content">
                            <div class="topic-title">
                                <div :class="'topic-rank-' + topic.idx_num">{{ topic.idx_num }}</div>
                                <div class="topic-name">{{ _.unescape(topic.topic_name) }}</div>
                            </div>
                            <div class="topic-desc">{{ _.unescape(topic.topic_desc) }}</div>
                        </div>
                    </UserButton>
                </div>
            </div>

            <div id="carousel_wrap"></div>
        </div>

        <div ref="masonryContainer" class="masonry-container">
            <!-- 推送 -->
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
import {
    TopicList,
    TopicListResponse,
    UserInfoResponse,
    levelToClass,
    tiebaAPI,
} from "@/lib/api/tieba";

import _ from "lodash";
import { computed, onMounted, onUnmounted, ref } from "vue";

import { renderDialog } from "@/lib/render";
import { errorMessage, requestInstance } from "@/lib/utils";
import { toast } from "user-view";

import BlockPanel from "@/components/block-panel.vue";
import FeedsMasonry from "@/components/feeds-masonry.vue";
import Settings from "@/components/settings.vue";
import type { NavBarHideMode } from "@/components/nav-bar.vue";
import { BaiduPassport, GiteeRepo, GithubRepo, indexTopicCollapsed, navBarHideMode, unreadFeeds } from "@/lib/user-values";
import { UserButton, UserTextbox } from "user-view";
import { useSearchSuggestions } from "./use-search-suggestions";
import { useSignIn } from "./use-sign-in";

const initFeeds = ref<TiebaPost[]>([]);
const userInfo = ref<UserInfoResponse["data"]>();

const masonryContainer = ref<HTMLDivElement>();
const feedsContainer = ref<HTMLAnchorElement>();
const followedHeader = ref<HTMLDivElement>();
const feedsHeader = ref<HTMLDivElement>();
const topicHeader = ref<HTMLDivElement>();
const isFollowedHeaderStuck = ref(false);
const isFeedsHeaderStuck = ref(false);
const isTopicHeaderStuck = ref(false);
const navHideMode = ref<NavBarHideMode>(navBarHideMode.get());
navBarHideMode.on("setter", (v) => { navHideMode.value = v; });
// 「常显」模式下让出 nav-bar（top:8 + height:48 + 间隙）；其它模式下留 16px 顶部呼吸距离
const stickyTopPx = computed(() => navHideMode.value === "never" ? 64 : 16);
const configToggle = ref(false);
const configMenu = ref<DropdownMenu[]>();
const profileToggle = ref(false);
const profileMenu = ref<DropdownMenu[]>();
const topicList = ref<TopicList[]>([]);
const feedsIntersecting = ref(false);
const feedsMasonry = ref<InstanceType<typeof FeedsMasonry>>({} as any);

// 贴吧热议视图状态
const topicCollapsed = ref(indexTopicCollapsed.get());
const topicShowAll = ref(false);
const displayedTopics = computed(() =>
    topicShowAll.value ? topicList.value : _.take(topicList.value, 10)
);

// 标题图标（线框 stroke 风格，颜色由 .block-title-icon 的语义类指定）
const ICON_FOLLOWED = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/></svg>`;
const ICON_TOPIC = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5Z"/></svg>`;
const ICON_FEEDS = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>`;

const { searchText, suggToggle, suggestions, searchBoxFocus, searchMatch } = useSearchSuggestions();
const { followed, signedForums, getFollowedInstance, oneKeySignInstance } = useSignIn();

initFeeds.value = unreadFeeds.get();

function toggleTopicCollapsed() {
    topicCollapsed.value = !topicCollapsed.value;
    indexTopicCollapsed.set(topicCollapsed.value);
}

function toggleTopicShowAll() {
    if (topicCollapsed.value) topicCollapsed.value = false;
    topicShowAll.value = !topicShowAll.value;
}

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

// 标题吸附状态：当 header.top ≈ stickyTop 时视为吸附
const updateStuck = _.throttle(() => {
    const top = stickyTopPx.value;
    const isStuck = (el: HTMLElement | undefined) => {
        if (!el) return false;
        const r = el.getBoundingClientRect();
        return r.top <= top + 0.5 && r.top >= top - 0.5;
    };
    isFollowedHeaderStuck.value = isStuck(followedHeader.value);
    isFeedsHeaderStuck.value = isStuck(feedsHeader.value);
    isTopicHeaderStuck.value = isStuck(topicHeader.value);
}, 80);

// 初始化
onMounted(async () => {
    init().then(() => {
        // 监控
        if (masonryContainer.value) {
            const iObs = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    feedsIntersecting.value = true;
                } else {
                    feedsIntersecting.value = false;
                }
            });
            iObs.observe(masonryContainer.value);
        }
    });

    window.addEventListener("scroll", updateStuck, { passive: true });
    window.addEventListener("resize", updateStuck);
    updateStuck();
});

onUnmounted(() => {
    window.removeEventListener("scroll", updateStuck);
    window.removeEventListener("resize", updateStuck);
});

async function init() {
    // 用户信息 & 贴吧热议 并行请求
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

    // 配置菜单
    configMenu.value = [
        {
            title: "设置",
            click() {
                renderDialog(Settings);
            },
        },
        "separator",
        {
            title: "源代码 (GitHub)",
            href: GithubRepo,
        },
        {
            title: "源代码 (Gitee)",
            href: GiteeRepo,
        },
    ];

    // 用户菜单
    profileMenu.value = [
        {
            title: "登录",
            icon: "login",
            href: BaiduPassport,
        },
    ];

    if (userInfo.value) {
        profileMenu.value = [
            {
                title: "我的收藏",
                icon: "star",
            },
            "separator",
            {
                title: "主页",
                icon: "home",
                href: tiebaAPI.URL_userHome(userInfo.value.user_portrait),
            },
            {
                title: "修改",
                icon: "settings",
            },
            "separator",
            {
                title: "退出登录",
                icon: "logout",
            },
        ];
    }

    // 获取关注的吧
    if (userInfo.value) {
        getFollowedInstance();
    }

    // 页面
    if (!feedsContainer.value) return;
}
</script>

<style scoped lang="scss">
$menu-margin: 24px;
$menu-button-size: 32px;

a {
    color: unset;
    text-decoration: none;
}

.block-wrapper {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.block-controls {
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

            :deep(svg) {
                width: 18px;
                height: 18px;
                stroke-width: 2;
            }

            &.icon-followed {
                // 心形 → 红色
                color: #ef4444;

                :deep(svg) {
                    fill: rgb(239 68 68 / 18%);
                }
            }

            &.icon-topic {
                // 火焰 → 橙色
                color: #f97316;

                :deep(svg) {
                    fill: rgb(249 115 22 / 16%);
                }
            }

            &.icon-feeds {
                // RSS / 推送 → 主题色
                color: var(--tieba-theme-color);
            }
        }
    }
}

.block-container {
    padding: 8px;
    border-radius: 12px;
    background-color: var(--trans-light-background);

    @include blur-if-custom-background;
}

// 让 BlockPanel 靠右对齐（block-panel.vue 内部不带 margin-left，由父组件决定布局位置）
.block-panel {
    margin-left: auto;

    &.left-align {
        margin-left: 0;
    }
}

.index-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;

    // 标题吸附顶部：「关注的吧」、「推送」、「贴吧热议」共用
    .sticky-header {
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

            .main-title {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;

                .main-icon {
                    height: 64px;
                }

                .title {
                    font-size: 36px;
                    font-style: italic;
                    font-weight: var(--font-weight-bold);
                }
            }

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

                // user-view 的 .theme-style.user-button 对 color 用了 !important，需同样手段覆盖
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
                        padding: 0;
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
        }

        .profile-menu-container {
            position: absolute;
            z-index: 1;

            .curr-user {
                position: fixed;
                top: $menu-margin;
                left: $menu-margin;
                overflow: hidden;
                width: 36px;
                height: 36px;
                padding: 0;
                border: 3px solid var(--border-color);
                border-radius: 36px;

                .user-profile {
                    @extend %avatar-fit;

                    width: 100%;
                }
            }

            .profile-menu {
                top: 64px;
                left: 24px;
            }
        }

        .config-menu-container {
            position: absolute;
            z-index: 1;
            display: flex;

            .config-menu-btn {
                position: fixed;
                top: $menu-margin;
                right: $menu-margin;
                height: 32px;
                border: none;
                border-radius: 36px;
                background-color: var(--page-background);
                font-size: 24px;
            }

            .config-menu-btn:hover {
                background-color: var(--default-background);
            }

            .config-menu-btn:active {
                background-color: var(--default-hover);
            }

            .config-menu {
                top: 64px;
                right: 24px;
                opacity: 1;
            }
        }

        .signed-count {
            font-weight: var(--font-weight-bold);
        }

        .block-panel.followed {
            margin-left: auto;
        }

        .followed-container {
            margin-top: -16px;

            .followed-list {
                display: flex;
                flex-wrap: wrap;
                gap: 4px;

                .followed-btn {
                    display: flex;
                    align-items: center;
                    padding: 6px 8px;
                    border-radius: 12px;
                    font-size: 14px;
                    gap: 6px;

                    .signed {
                        color: green;
                        font-weight: var(--font-weight-bold);
                    }

                    .forum-level {
                        min-width: 24px;
                        padding: 0 2px;
                        border-radius: 24px;
                        font-weight: var(--font-weight-bold);
                        text-align: center;
                    }
                }
            }
        }

        .topic-list {
            display: grid;
            gap: 4px;
            grid-auto-rows: max-content;
            grid-template-columns: repeat(2, 1fr);

            .topic-btn {
                display: flex;
                width: 100%;
                height: 100%;
                align-items: center;
                padding: 12px;
                border-radius: 12px;
                gap: 8px;

                .topic-img {
                    width: 72px;
                    border-radius: 12px;
                }

                .topic-content {
                    display: flex;
                    flex-flow: column wrap;
                    gap: 4px;
                    text-align: justify;

                    .topic-title {
                        display: flex;
                        align-items: center;
                        gap: 6px;

                        [class^="topic-rank"] {
                            padding: 0 4px;
                            border-radius: 4px;
                            background-color: orange;
                            color: var(--default-background);
                            font-weight: var(--font-weight-bold);
                            text-align: center;
                        }

                        .topic-name {
                            font-size: 16px;
                            font-weight: var(--font-weight-bold);
                        }
                    }

                    .topic-desc {
                        color: var(--light-fore);
                        font-size: 14px;
                    }
                }
            }
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

        .feeds-container {
            width: 100%;
            margin: auto;

            @keyframes feeds-in {
                0% {
                    transform: scale(0.72);
                }

                100% {
                    transform: scale(1);
                }
            }

            @keyframes refresh-btn-in {
                0% {
                    padding: 0 18px;
                    opacity: 0;
                }

                100% {
                    padding: 8px 18px;
                    opacity: 1;
                }
            }

            .feeds-refresh-btn {
                position: fixed;
                z-index: 1;
                bottom: 24px;
                left: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 8px 18px;
                border-width: 2px;
                border-radius: 16px;
                animation: refresh-btn-in 0.4s ease;
                box-shadow: 0 6px 20px rgb(0 0 0 / 30%);
                font-size: 14px;
                font-weight: var(--font-weight-bold);
                gap: 6px;
                transform: translateX(-50%);

                .icon {
                    font-size: 18px;
                }
            }
        }

        .post-elem {
            animation: feeds-in 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.2);
        }

        .post-elem:not(:hover, :active, :focus) {
            box-shadow: none;
        }

        .empty-container {
            .no-feed-content {
                color: var(--minimal-fore);
                font-size: small;
                text-align: center;
            }
        }
    }

    // 回顶按钮：仅当「推送」吸附顶部时显示，靠近 .masonry-container 右侧；窄屏退化为靠右 20px
    .back-to-top-btn {
        position: fixed;
        z-index: 1100;
        // 56px ≈ 按钮宽度(44) + 与容器间距(12)；让按钮整体落在容器右边沿外侧
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
