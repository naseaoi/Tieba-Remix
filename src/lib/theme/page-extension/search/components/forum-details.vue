<template>
    <div class="trex-forum-details">
        <a class="trex-forum-details-head" :href="forumUrl" target="_blank" rel="noopener">
            <img v-if="sidebar.avatar" class="trex-forum-details-avatar" :src="sidebar.avatar" alt="">
            <span class="trex-forum-details-title">
                <span class="trex-forum-details-name">{{ sidebar.name }}吧</span>
                <span v-if="sidebar.followed" class="trex-forum-details-followed">已关注</span>
            </span>
            <ChevronRight class="trex-forum-details-enter" :size="16" aria-hidden="true" />
        </a>

        <p v-if="sidebar.intro" class="trex-forum-details-intro">{{ sidebar.intro }}</p>

        <dl class="trex-forum-details-stats">
            <div v-for="stat in stats" :key="stat.label">
                <dt>{{ stat.label }}</dt>
                <dd>{{ stat.value }}</dd>
            </div>
        </dl>

        <section v-if="sidebar.level" class="trex-forum-details-level trex-forum-level">
            <div class="trex-forum-level-head">
                <span class="trex-forum-level-index">Lv.{{ sidebar.level.index }}</span>
                <span class="trex-forum-level-name">{{ sidebar.level.name }}</span>
            </div>
            <span class="trex-forum-level-bar"><span :style="{ width: levelPercent }"></span></span>
            <span class="trex-forum-level-exp">经验 {{ sidebar.level.exp }}/{{ sidebar.level.expMax }}</span>
        </section>

        <section v-if="sidebar.tags.length > 0" class="trex-forum-details-section">
            <h3>标签</h3>
            <ul class="trex-forum-details-tags">
                <li v-for="tag in sidebar.tags" :key="tag">{{ tag }}</li>
            </ul>
        </section>

        <section v-for="group in managerGroups" :key="group.role" class="trex-forum-details-section">
            <h3>{{ group.role }}</h3>
            <ul class="trex-forum-details-managers">
                <li v-for="manager in group.managers" :key="manager.name">
                    <a :href="manager.homeUrl || undefined" target="_blank" rel="noopener" :title="manager.name">
                        <img :src="manager.avatar || undefined" alt="" loading="lazy">
                        <span>{{ manager.name }}</span>
                    </a>
                </li>
            </ul>
        </section>
    </div>
</template>

<script lang="ts" setup>
import { ChevronRight } from "@lucide/vue";
import { tiebaAPI } from "@/lib/api/tieba";
import type { ForumSidebar } from "@/lib/api/tieba-search";
import { computed } from "vue";

const props = defineProps<{
    sidebar: ForumSidebar;
}>();

type Manager = ForumSidebar["managers"][number];

const forumUrl = computed(() => tiebaAPI.URL_forum(props.sidebar.name));

const stats = computed(() => [
    { label: "成员", value: props.sidebar.memberCount },
    { label: "帖子", value: props.sidebar.postCount },
    { label: "建吧", value: props.sidebar.createdAt },
].filter(stat => stat.value));

const levelPercent = computed(() => {
    const level = props.sidebar.level;
    if (!level || level.expMax <= 0) return "0%";
    return `${Math.min(100, (level.exp / level.expMax) * 100)}%`;
});

const managerGroups = computed(() => {
    const groups = new Map<string, Manager[]>();
    props.sidebar.managers.forEach(manager => {
        groups.set(manager.role, [...groups.get(manager.role) ?? [], manager]);
    });
    return [...groups].map(([role, managers]) => ({ role, managers }));
});
</script>
