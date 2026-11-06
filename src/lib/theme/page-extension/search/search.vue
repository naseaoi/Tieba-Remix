<template>
    <main class="trex-search-page">
        <form class="trex-search-box" role="search" @submit.prevent="submit">
            <Search class="trex-search-box-icon" :size="18" aria-hidden="true" />
            <span v-if="state.forumName" class="trex-search-scope">
                <img v-if="sidebar?.avatar" :src="sidebar.avatar" alt="">
                <span class="trex-search-scope-name">{{ state.forumName }}吧</span>
                <button type="button" title="搜索全站" aria-label="搜索全站" @click="searchGlobally">
                    <X :size="14" aria-hidden="true" />
                </button>
            </span>
            <input ref="input" v-model="draft" class="trex-search-box-input" type="search" name="qw" autocomplete="off"
                :placeholder="state.forumName ? '搜索本吧' : '搜索贴吧'" aria-label="搜索关键词">
            <button class="trex-search-box-submit" type="submit">搜索</button>
        </form>

        <div class="trex-search-toolbar">
            <div class="trex-search-segmented" role="tablist" aria-label="结果类型">
                <button v-for="option in TYPE_OPTIONS" :key="option.value" type="button" role="tab"
                    :class="{ active: state.type === option.value }" :aria-selected="state.type === option.value"
                    @click="update({ type: option.value })">{{ option.label }}</button>
            </div>
            <div class="trex-search-segmented" role="radiogroup" aria-label="排序">
                <button v-for="option in SORT_OPTIONS" :key="option.value" type="button" role="radio"
                    :class="{ active: state.sort === option.value }" :aria-checked="state.sort === option.value"
                    @click="update({ sort: option.value })">{{ option.label }}</button>
            </div>
            <div v-if="state.forumName" class="trex-search-forum-actions">
                <a class="trex-search-toolbar-button" :href="forumUrl">
                    <ArrowLeft :size="14" aria-hidden="true" />
                    <span>返回本吧</span>
                </a>
                <button v-if="sidebar" class="trex-search-toolbar-button" type="button" @click="drawer?.open()">
                    <Info :size="14" aria-hidden="true" />
                    <span>本吧详情</span>
                </button>
            </div>
        </div>

        <ul v-if="initialLoading" class="trex-search-list" aria-busy="true">
            <li v-for="index in SKELETON_COUNT" :key="index" class="trex-search-card trex-search-skeleton">
                <span class="trex-search-skeleton-author"></span>
                <span class="trex-search-skeleton-line"></span>
                <span class="trex-search-skeleton-line short"></span>
            </li>
        </ul>

        <ul v-else-if="posts.length > 0" class="trex-search-list">
            <li v-for="post in posts" :key="post.key">
                <SearchPostCard :post="post" :word="state.word" :show-forum="!state.forumName" />
            </li>
        </ul>

        <div v-else-if="status === 'done' && state.word" class="trex-search-empty">
            <SearchX :size="32" aria-hidden="true" />
            <span>没有找到相关内容</span>
        </div>

        <button v-if="posts.length > 0 || status === 'error'" ref="sentinel" class="trex-search-more" type="button"
            :disabled="status === 'loading' || status === 'done'" @click="retry">{{ moreLabel }}</button>

        <Transition name="trex-search-back-top">
            <button v-show="showBackTop" class="trex-search-back-top" type="button" title="回到顶部"
                aria-label="回到顶部" @click="scrollToTop">
                <ArrowUp :size="20" aria-hidden="true" />
            </button>
        </Transition>

        <Teleport :to="drawerContent">
            <ForumDetails v-if="sidebar" :sidebar="sidebar" />
        </Teleport>
    </main>
</template>

<script lang="ts" setup>
import { ArrowLeft, ArrowUp, Info, Search, SearchX, X } from "@lucide/vue";
import { fetchForumSidebar, tiebaAPI } from "@/lib/api/tieba";
import type { ForumSidebar, SearchPostType, SearchSort } from "@/lib/api/tieba-search";
import { createForumDrawer, type ForumDrawer } from "@/lib/tieba-components/forum-drawer";
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from "vue";
import ForumDetails from "./components/forum-details.vue";
import SearchPostCard from "./components/search-post-card.vue";
import { readSearchState, writeSearchState, type SearchPageState } from "./search-state";
import { useSearchResults } from "./use-search-results";

const SKELETON_COUNT = 4;
const AUTO_LOAD_MARGIN = "600px";

const TYPE_OPTIONS: { value: SearchPostType; label: string }[] = [
    { value: "thread", label: "主题" },
    { value: "comment", label: "评论" },
];
const SORT_OPTIONS: { value: SearchSort; label: string }[] = [
    { value: "time", label: "新帖在前" },
    { value: "relevance", label: "相关在前" },
];

const state = ref<SearchPageState>(readSearchState(new URL(location.href)));
const draft = ref(state.value.word);
const input = ref<HTMLInputElement>();
const sentinel = ref<HTMLButtonElement>();
const sidebar = shallowRef<ForumSidebar>();
const drawerContent = document.createElement("div");
let drawer: ForumDrawer | undefined;

const { posts, status, initialLoading, canAutoLoad, reset, loadMore, retry } = useSearchResults(state);

const forumUrl = computed(() => tiebaAPI.URL_forum(state.value.forumName));
const moreLabel = computed(() => {
    switch (status.value) {
        case "loading": return "加载中…";
        case "error": return "加载失败，点击重试";
        case "done": return "没有更多了";
        default: return "加载更多";
    }
});

function syncTitle() {
    const { word, forumName } = state.value;
    const scope = forumName ? `${forumName}吧` : "贴吧";
    document.title = word ? `${word}_${scope}搜索_百度贴吧` : `${scope}搜索_百度贴吧`;
}

function search(next: SearchPageState, mode: "push" | "replace") {
    state.value = next;
    const url = writeSearchState(next, new URL(location.href)).href;
    if (url !== location.href) history[mode === "push" ? "pushState" : "replaceState"](null, "", url);
    syncTitle();
    reset();
    void loadMore();
}

function submit() {
    const word = draft.value.trim();
    if (!word) {
        input.value?.focus();
        return;
    }
    search({ ...state.value, word }, word === state.value.word ? "replace" : "push");
}

function update(patch: Partial<SearchPageState>) {
    const next = { ...state.value, ...patch };
    if (next.type === state.value.type && next.sort === state.value.sort) return;
    search(next, "replace");
}

function searchGlobally() {
    search({ ...state.value, forumName: "", word: draft.value.trim() || state.value.word }, "push");
}

function onPopState() {
    state.value = readSearchState(new URL(location.href));
    draft.value = state.value.word;
    syncTitle();
    reset();
    void loadMore();
}

let sidebarToken = 0;
watch(() => state.value.forumName, async forumName => {
    const current = ++sidebarToken;
    sidebar.value = undefined;
    if (!forumName) return;
    try {
        const result = await fetchForumSidebar(forumName);
        if (current === sidebarToken) sidebar.value = result;
    } catch (error) {
        console.warn("[Tieba Remix] 获取吧信息失败", error);
    }
}, { immediate: true });

const showBackTop = ref(false);
let backTopFrame = 0;
function syncBackTop() {
    backTopFrame = 0;
    showBackTop.value = window.scrollY > window.innerHeight / 2;
}
function onScroll() {
    if (!backTopFrame) backTopFrame = requestAnimationFrame(syncBackTop);
}
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}

let sentinelVisible = false;
const observer = new IntersectionObserver(entries => {
    sentinelVisible = entries.some(entry => entry.isIntersecting);
    if (sentinelVisible && canAutoLoad.value) void loadMore();
}, { rootMargin: AUTO_LOAD_MARGIN });

watch(sentinel, (element, previous) => {
    if (previous) observer.unobserve(previous);
    if (element) observer.observe(element);
});

// 一页结果撑不满视口时哨兵持续可见，IntersectionObserver 不会再次回调
watch(canAutoLoad, value => {
    if (value && sentinelVisible) void loadMore();
});

onMounted(() => {
    drawer = createForumDrawer(drawerContent);
    window.addEventListener("popstate", onPopState);
    window.addEventListener("scroll", onScroll, { passive: true });
    syncTitle();
    reset();
    if (state.value.word) {
        void loadMore();
    } else {
        input.value?.focus();
    }
});

onBeforeUnmount(() => {
    observer.disconnect();
    window.removeEventListener("popstate", onPopState);
    window.removeEventListener("scroll", onScroll);
    cancelAnimationFrame(backTopFrame);
});
</script>
