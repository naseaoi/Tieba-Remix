<template>
    <div v-if="topicList.length > 0" class="block-wrapper topic-container"
        :class="{ collapsed: topicCollapsed }">
        <div ref="header" class="block-controls topics sticky-header"
            :class="{ stuck: isStuck }">
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
</template>

<script setup lang="ts">
import BlockPanel from "@/components/block-panel.vue";
import { TopicList } from "@/lib/api/tieba";
import { indexTopicCollapsed } from "@/lib/user-values";
import _ from "@/lib/utils/_";
import { UserButton } from "user-view";
import { computed, inject, ref } from "vue";
import { ICON_TOPIC } from "../block-icons";
import { StickyHeadersKey } from "../use-sticky-headers";

const props = defineProps<{ topicList: TopicList[] }>();

const header = ref<HTMLDivElement>();
const register = inject(StickyHeadersKey);
const isStuck = register ? register(header) : ref(false);

const topicCollapsed = ref(indexTopicCollapsed.get());
const topicShowAll = ref(false);
const displayedTopics = computed(() =>
    topicShowAll.value ? props.topicList : props.topicList.slice(0, 10)
);

function toggleTopicCollapsed() {
    topicCollapsed.value = !topicCollapsed.value;
    indexTopicCollapsed.set(topicCollapsed.value);
}

function toggleTopicShowAll() {
    if (topicCollapsed.value) topicCollapsed.value = false;
    topicShowAll.value = !topicShowAll.value;
}
</script>

<style scoped lang="scss">
.topic-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.topic-list {
    display: grid;
    gap: 8px;
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
</style>
