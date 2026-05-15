<template>
    <div class="index-wrapper">
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
                <div class="block-controls followed">
                    <p class="block-title">关注的吧</p>
                    <BlockPanel class="signed-count left-align">{{ signedForums }} /
                        {{ followed?.like_forum.length }}
                    </BlockPanel>

                    <BlockPanel class="followed">
                        <UserButton class="panel-btn icon sign-btn" @click="oneKeySignInstance" unset-background
                            no-border>
                            task_alt</UserButton>
                        <UserButton class="panel-btn icon settings" unset-background no-border>settings</UserButton>
                    </BlockPanel>
                </div>

                <div class="block-container followed-list">
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
            <div v-if="topicList.length > 0" class="block-wrapper topic-container">
                <div class="block-controls topics">
                    <p class="block-title">贴吧热议</p>

                    <BlockPanel class="topics">
                        <UserButton class="panel-btn icon switch" :unset-background="true" no-border>tune</UserButton>
                        <UserButton class="panel-btn icon more" :unset-background="true" no-border>more_horiz
                        </UserButton>
                        <UserButton class="panel-btn icon settings" :unset-background="true" no-border>settings
                        </UserButton>
                    </BlockPanel>
                </div>

                <div class="block-container topic-list">
                    <UserButton v-for="topic in _.take(topicList, 10)" :is-anchor="true" class="topic-btn"
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
            <div class="block-controls feeds">
                <p class="block-title">推送</p>

                <BlockPanel
                    v-if="feedsMasonry && feedsMasonry.feeds && (feedsMasonry.feeds.length > 0 || feedsMasonry.isFetchingFeeds)">
                    <UserButton class="panel-button icon refresh" unset-background @click="feedsMasonry.refreshAndMove"
                        no-border>refresh
                    </UserButton>

                    <UserButton
                        class="panel-button icon settings"
                        unset-background
                        no-border>settings</UserButton>
                </BlockPanel>
            </div>

            <FeedsMasonry ref="feedsMasonry" :init-feeds="initFeeds" show-progress></FeedsMasonry>

            <div v-if="initFeeds.length === 0" class="empty-container">
                <p class="no-feed-content">没有更多了</p>
            </div>
        </div>
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
import { onMounted, ref } from "vue";

import { renderDialog } from "@/lib/render";
import { errorMessage, requestInstance } from "@/lib/utils";
import { toast } from "user-view";

import BlockPanel from "@/components/block-panel.vue";
import FeedsMasonry from "@/components/feeds-masonry.vue";
import Settings from "@/components/settings.vue";
import { BaiduPassport, GiteeRepo, GithubRepo, unreadFeeds } from "@/lib/user-values";
import { UserButton, UserTextbox } from "user-view";
import { useSearchSuggestions } from "./use-search-suggestions";
import { useSignIn } from "./use-sign-in";

const initFeeds = ref<TiebaPost[]>([]);
const userInfo = ref<UserInfoResponse["data"]>();

const masonryContainer = ref<HTMLDivElement>();
const feedsContainer = ref<HTMLAnchorElement>();
const configToggle = ref(false);
const configMenu = ref<DropdownMenu[]>();
const profileToggle = ref(false);
const profileMenu = ref<DropdownMenu[]>();
const topicList = ref<TopicList[]>([]);
const feedsIntersecting = ref(false);
const feedsMasonry = ref<InstanceType<typeof FeedsMasonry>>({} as any);

const { searchText, suggToggle, suggestions, searchBoxFocus, searchMatch } = useSearchSuggestions();
const { followed, signedForums, getFollowedInstance, oneKeySignInstance } = useSignIn();

initFeeds.value = unreadFeeds.get();

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
        margin: 0;
        font-size: 24px;
        font-weight: var(--font-weight-bold);
    }
}

.block-container {
    padding: 8px;
    border-radius: 12px;
    background-color: var(--trans-light-background);

    @include blur-if-custom-background;
}

.block-panel {
    display: flex;
    min-width: 30px;
    height: 26px;
    align-items: center;
    justify-content: center;
    padding: 2px 8px;
    border-radius: 24px;
    margin-left: auto;
    background-color: var(--trans-light-background);
    font-size: 14px;
    text-align: center;

    .icon {
        color: var(--light-fore);
        font-size: 18px;
    }

    .panel-btn {
        width: 30px;
        height: 30px;
        padding: 4px;
        border: none;
        border-radius: 48px;
    }

    &.left-align {
        margin-left: 0;
    }
}

.index-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;

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

                .search-button {
                    border: none;
                    border-bottom-left-radius: 0;
                    border-top-left-radius: 0;
                    font-size: 16px;
                    font-weight: var(--font-weight-bold);
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
                padding: 8px;
                border-radius: 12px;
                background-color: var(--trans-light-background);
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
}
</style>
