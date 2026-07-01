<template>
    <section class="poll-display" :class="{ 'is-ended': isEnded, 'is-votable': canVote, 'is-multi': poll.is_multi }">
        <header class="poll-header">
            <span class="poll-badge">{{ poll.is_multi ? "多选投票" : "单选投票" }}</span>
            <h4 class="poll-title">{{ pollTitle }}</h4>
            <span class="poll-status">{{ statusText }}</span>
        </header>

        <ul class="poll-options">
            <li v-for="opt in sortedOptions" :key="opt.id" class="poll-option" :class="{ 'is-leading': opt.id === leadingId, 'is-selected': isSelected(opt.id), 'is-polled': polledSet.has(opt.id) }">
                <button class="option-button" type="button" :disabled="!canVote || submitting" @click="toggleOption(opt.id)">
                    <span class="option-choice" aria-hidden="true"></span>
                    <span class="option-main">
                        <span class="option-row">
                            <span class="option-text">{{ opt.text }}</span>
                            <span class="option-stats">
                                <span class="option-num">{{ opt.num }} 票</span>
                                <span class="option-percent">{{ percent(opt.num) }}</span>
                            </span>
                        </span>
                        <span class="option-bar">
                            <span class="option-bar-fill" :style="{ width: percent(opt.num) }"></span>
                        </span>
                    </span>
                </button>
            </li>
        </ul>

        <footer class="poll-footer">
            <span class="poll-total">共 {{ poll.total_num }} 人参与，{{ poll.total_poll }} 票</span>
            <span class="poll-message" :class="{ 'is-error': Boolean(errorText), 'is-success': Boolean(successText) }">{{ messageText }}</span>
            <button v-if="canVote" class="poll-submit" type="button" :disabled="submitDisabled" @click="submitVote">
                {{ submitting ? "提交中" : "提交投票" }}
            </button>
        </footer>
    </section>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { fetchPollInfo, submitPollVote, type PollInfo, type PollOption } from "./api";

const props = defineProps<{
    poll: PollInfo;
    threadId: number | string;
    forumId: number | string;
    threadTitle?: string;
    isLoggedIn?: boolean;
}>();

const poll = ref(props.poll);
const selectedIds = ref<number[]>([]);
const submitting = ref(false);
const errorText = ref("");
const successText = ref("");

watch(() => props.poll, value => {
    poll.value = value;
}, { deep: true });

watch(poll, value => {
    selectedIds.value = parsePolledValue(value.polled_value);
}, { immediate: true });

const pollTitle = computed(() => {
    const t = poll.value.title?.trim();
    if (t) return t;
    return props.threadTitle?.trim() || "投票";
});

const isEnded = computed(() => {
    const end = poll.value.end_time;
    if (end <= 0) return false;
    return end * 1000 < Date.now();
});

const isPolled = computed(() => poll.value.is_polled === 1);

const canVote = computed(() => {
    return Boolean(props.isLoggedIn) && !isEnded.value && !isPolled.value;
});

const statusText = computed(() => {
    if (isPolled.value) return "已投票";
    if (isEnded.value) return "已结束";
    const end = poll.value.end_time;
    if (end <= 0) return "进行中";
    return `截止 ${formatDate(end * 1000)}`;
});

const sortedOptions = computed<PollOption[]>(() => {
    return [...poll.value.options].sort((a, b) => b.num - a.num);
});

const leadingId = computed(() => sortedOptions.value[0]?.id);

const denom = computed(() => {
    const base = poll.value.is_multi ? poll.value.total_poll : poll.value.total_num;
    return base > 0 ? base : 1;
});

const selectedSet = computed(() => new Set(selectedIds.value));

const polledSet = computed(() => new Set(parsePolledValue(poll.value.polled_value)));

const submitDisabled = computed(() => {
    return submitting.value || selectedIds.value.length === 0;
});

const messageText = computed(() => {
    if (errorText.value) return errorText.value;
    if (successText.value) return successText.value;
    if (!props.isLoggedIn) return "登录后可参与投票";
    if (isPolled.value) return "你已参与投票";
    if (isEnded.value) return "投票已结束";
    return poll.value.is_multi ? "可选择多个选项" : "请选择一个选项";
});

function percent(num: number): string {
    const v = (num / denom.value) * 100;
    return `${v.toFixed(1)}%`;
}

function toggleOption(id: number): void {
    if (!canVote.value || submitting.value) return;
    errorText.value = "";
    successText.value = "";

    if (!poll.value.is_multi) {
        selectedIds.value = [id];
        return;
    }

    if (selectedSet.value.has(id)) {
        selectedIds.value = selectedIds.value.filter(item => item !== id);
        return;
    }
    selectedIds.value = [...selectedIds.value, id];
}

function isSelected(id: number): boolean {
    return selectedSet.value.has(id);
}

async function submitVote(): Promise<void> {
    if (submitDisabled.value || !canVote.value) return;

    submitting.value = true;
    errorText.value = "";
    successText.value = "";

    try {
        await submitPollVote({
            threadId: props.threadId,
            forumId: props.forumId,
            optionIds: selectedIds.value,
        });
        const fresh = await fetchPollInfo(props.threadId);
        if (fresh) poll.value = fresh;
        successText.value = "投票成功";
    } catch (err) {
        errorText.value = err instanceof Error ? err.message : String(err);
    } finally {
        submitting.value = false;
    }
}

function parsePolledValue(value: string): number[] {
    return value
        .split(",")
        .map(item => Number(item.trim()))
        .filter(item => Number.isInteger(item) && item > 0);
}

function formatDate(ms: number): string {
    const d = new Date(ms);
    const pad = (n: number) => `${n}`.padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
</script>

<style lang="scss" scoped>
.poll-display {
    margin: 16px 0 8px;
    padding: 16px 18px;
    border: 1px solid var(--minimal-fore-3, rgb(0 0 0 / 8%));
    border-radius: 8px;
    background: var(--default-background, #fff);
    color: var(--minimal-fore, #333);
    font-size: 14px;
    line-height: 1.5;

    &.is-ended {
        opacity: 0.85;
    }
}

.poll-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
}

.poll-badge {
    flex: none;
    padding: 2px 8px;
    border-radius: 6px;
    background: var(--tieba-theme-background, rgb(88 154 254 / 12%));
    color: var(--tieba-theme-color, #589afe);
    font-size: 12px;
    font-weight: 500;
}

.poll-title {
    flex: 1;
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--minimal-fore, #333);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.poll-status {
    flex: none;
    color: var(--minimal-fore-2, #888);
    font-size: 12px;
}

.poll-options {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.poll-option {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.option-button {
    display: flex;
    align-items: flex-start;
    width: 100%;
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: left;
}

.is-votable .option-button {
    cursor: pointer;
}

.option-button:disabled {
    cursor: default;
}

.option-choice {
    flex: none;
    width: 16px;
    height: 16px;
    margin: 2px 8px 0 0;
    border: 1px solid var(--minimal-fore-3, rgb(0 0 0 / 18%));
    border-radius: 50%;
    background: var(--default-background, #fff);
}

.poll-display.is-multi .option-choice {
    border-radius: 4px;
}

.poll-option.is-selected .option-choice,
.poll-option.is-polled .option-choice {
    border-color: var(--tieba-theme-color, #589afe);
    background: var(--tieba-theme-color, #589afe);
    box-shadow: inset 0 0 0 4px var(--default-background, #fff);
}

.option-main {
    flex: 1;
    min-width: 0;
}

.option-row {
    display: flex;
    align-items: baseline;
    gap: 12px;
}

.option-text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--minimal-fore, #333);
}

.option-stats {
    flex: none;
    display: inline-flex;
    align-items: baseline;
    gap: 8px;
    color: var(--minimal-fore-2, #888);
    font-size: 13px;
    font-variant-numeric: tabular-nums;
}

.option-percent {
    min-width: 3.5em;
    text-align: right;
    color: var(--minimal-fore, #333);
    font-weight: 500;
}

.option-bar {
    display: block;
    height: 6px;
    margin-top: 4px;
    border-radius: 3px;
    background: var(--minimal-fore-4, rgb(0 0 0 / 5%));
    overflow: hidden;
}

.option-bar-fill {
    display: block;
    height: 100%;
    background: var(--tieba-theme-color, #589afe);
    border-radius: 3px;
    transition: width 0.36s cubic-bezier(0.4, 0, 0.2, 1);
}

.poll-option.is-leading .option-bar-fill {
    background: linear-gradient(
        90deg,
        var(--tieba-theme-color, #589afe),
        var(--tieba-theme-hover, #7eb4ff)
    );
}

.poll-footer {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    align-items: center;
    gap: 8px;
    margin-top: 14px;
    padding-top: 10px;
    border-top: 1px dashed var(--minimal-fore-3, rgb(0 0 0 / 8%));
    color: var(--minimal-fore-2, #888);
    font-size: 12px;
}

.poll-total,
.poll-message {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.poll-message {
    color: var(--minimal-fore-2, #aaa);
}

.poll-message.is-error {
    color: #d93025;
}

.poll-message.is-success {
    color: #16833a;
}

.poll-submit {
    min-width: 76px;
    height: 28px;
    padding: 0 12px;
    border: 0;
    border-radius: 6px;
    background: var(--tieba-theme-color, #589afe);
    color: #fff;
    font-size: 12px;
    cursor: pointer;
}

.poll-submit:disabled {
    opacity: 0.55;
    cursor: default;
}

@media (max-width: 560px) {
    .poll-footer {
        grid-template-columns: 1fr;
    }

    .poll-submit {
        width: 100%;
    }
}
</style>
