<template>
    <div v-if="followed" class="block-wrapper followed-container">
        <div ref="header" class="block-controls followed sticky-header"
            :class="{ stuck: isStuck }">
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
</template>

<script setup lang="ts">
import BlockPanel from "@/components/block-panel.vue";
import { levelToClass, tiebaAPI } from "@/lib/api/tieba";
import { UserButton } from "user-view";
import { inject, ref, watch } from "vue";
import { ICON_FOLLOWED } from "../block-icons";
import { useSignIn } from "../use-sign-in";
import { StickyHeadersKey } from "../use-sticky-headers";

const props = defineProps<{ loggedIn: boolean }>();

const header = ref<HTMLDivElement>();
const register = inject(StickyHeadersKey);
const isStuck = register ? register(header) : ref(false);

const { followed, signedForums, getFollowedInstance, oneKeySignInstance } = useSignIn();

watch(() => props.loggedIn, (v) => {
    if (v) getFollowedInstance();
}, { immediate: true });
</script>

<style scoped lang="scss">
.followed-container {
    display: flex;
    flex-direction: column;
    margin-top: -16px;
    gap: 8px;

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
</style>
