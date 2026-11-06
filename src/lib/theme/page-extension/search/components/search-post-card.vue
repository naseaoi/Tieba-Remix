<template>
    <article ref="card" class="trex-search-card" :data-type="post.type">
        <div class="thread-modern-author-row">
            <span class="thread-modern-author">
                <a class="thread-modern-avatar-link" :href="homeUrl" target="_blank" rel="noopener">
                    <img class="thread-modern-avatar" :src="post.author.avatar || undefined" alt="" loading="lazy">
                </a>
                <span class="thread-modern-author-details">
                    <a class="thread-modern-author-name" :href="homeUrl" target="_blank" rel="noopener">{{ authorName }}</a>
                    <span class="trex-search-card-meta">
                        <time class="thread-modern-time" :data-age="time.age" :datetime="datetime">{{ time.text }}</time>
                        <a v-if="showForum && post.forum.name" class="trex-search-card-forum" :href="forumUrl" target="_blank"
                            rel="noopener">{{ post.forum.name }}吧</a>
                    </span>
                </span>
            </span>
            <span v-if="post.type === 'thread'" ref="actions" class="trex-search-card-actions"></span>
        </div>

        <div class="trex-search-card-text">
            <a v-if="post.title" class="trex-search-card-title" :href="post.url" target="_blank" rel="noopener">
                <SearchHighlight :text="post.title" :word="word" />
            </a>
            <a v-if="post.content" class="trex-search-card-abs" :href="post.url" target="_blank" rel="noopener">
                <SearchHighlight :text="post.content" :word="word" />
            </a>
            <a v-if="post.quote" class="trex-search-card-quote" :href="post.quote.url || post.url" target="_blank"
                rel="noopener">
                <img v-if="post.quote.image" class="trex-search-card-quote-image" :src="post.quote.image" alt=""
                    loading="lazy">
                <span class="trex-search-card-quote-text">
                    <span v-if="post.quote.author" class="trex-search-card-quote-author">{{ post.quote.author }}：</span>
                    <SearchHighlight :text="post.quote.content" :word="word" />
                </span>
            </a>
        </div>

        <ul v-if="thumbs.length > 0 || post.video" class="trex-search-card-media">
            <li v-if="post.video" class="trex-search-card-video">
                <a :href="post.url" target="_blank" rel="noopener" aria-label="播放视频">
                    <img :src="post.video.cover" alt="" loading="lazy">
                    <Play class="trex-search-card-play" aria-hidden="true" />
                </a>
            </li>
            <li v-for="(image, index) in thumbs" :key="image.full"
                :data-trex-more="index === thumbs.length - 1 && moreCount > 0 ? `+${moreCount}` : undefined">
                <button type="button" aria-label="查看图片" @click="openImages(index)">
                    <img :src="image.thumb" alt="" loading="lazy">
                </button>
            </li>
        </ul>
    </article>
</template>

<script lang="ts" setup>
import { Play } from "@lucide/vue";
import { imagesViewer } from "@/components/images-viewer/viewer";
import { getTbs, tiebaAPI } from "@/lib/api/tieba";
import type { SearchPost } from "@/lib/api/tieba-search";
import { createThreadActions, createThreadMoreButton, releaseThreadActions } from "@/lib/tieba-components/thread-card-actions";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { searchTimeLabel } from "../search-state";
import SearchHighlight from "./search-highlight.vue";

const MAX_THUMBS = 3;

const props = defineProps<{
    post: SearchPost;
    word: string;
    // 全站搜索时结果来自不同的吧，卡片上标出吧名
    showForum: boolean;
}>();

const card = ref<HTMLElement>();
const actions = ref<HTMLElement>();

const authorName = computed(() => props.post.author.displayName || props.post.author.name);
const homeUrl = computed(() => props.post.author.portrait ? tiebaAPI.URL_userHome(props.post.author.portrait) : undefined);
const forumUrl = computed(() => tiebaAPI.URL_forum(props.post.forum.name));
const time = computed(() => searchTimeLabel(props.post.time));
const datetime = computed(() => props.post.time ? new Date(props.post.time).toISOString() : undefined);
const thumbs = computed(() => props.post.images.slice(0, props.post.video ? MAX_THUMBS - 1 : MAX_THUMBS));
const moreCount = computed(() => props.post.images.length - thumbs.value.length);

function openImages(index: number) {
    void imagesViewer({ content: props.post.images.map(image => image.full), defaultIndex: index });
}

onMounted(() => {
    if (!card.value || !actions.value) return;
    const { tid, forum, author, replyCount, agreeCount, url } = props.post;
    const context = { fid: forum.id, tbs: getTbs };
    actions.value.append(
        createThreadActions({ tid, href: url, replyCount: String(replyCount), card: card.value, context, agreeCount }),
        createThreadMoreButton({ tid, names: [author.name, author.displayName], context }),
    );
});

onBeforeUnmount(() => {
    if (card.value) releaseThreadActions(card.value);
});
</script>
