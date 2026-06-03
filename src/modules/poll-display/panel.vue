<template>
    <section class="poll-display" :class="{ 'is-ended': isEnded }">
        <header class="poll-header">
            <span class="poll-badge">{{ props.poll.is_multi ? "多选投票" : "单选投票" }}</span>
            <h4 class="poll-title">{{ pollTitle }}</h4>
            <span class="poll-status">{{ statusText }}</span>
        </header>

        <ul class="poll-options">
            <li v-for="opt in sortedOptions" :key="opt.id" class="poll-option" :class="{ 'is-leading': opt.id === leadingId }">
                <div class="option-row">
                    <span class="option-text">{{ opt.text }}</span>
                    <span class="option-stats">
                        <span class="option-num">{{ opt.num }} 票</span>
                        <span class="option-percent">{{ percent(opt.num) }}</span>
                    </span>
                </div>
                <div class="option-bar">
                    <div class="option-bar-fill" :style="{ width: percent(opt.num) }"></div>
                </div>
            </li>
        </ul>

        <footer class="poll-footer">
            <span class="poll-total">共 {{ props.poll.total_num }} 人参与，{{ props.poll.total_poll }} 票</span>
            <span class="poll-readonly-hint">网页端仅展示数据，投票请在贴吧 App 内进行</span>
        </footer>
    </section>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import type { PollInfo, PollOption } from "./api";

const props = defineProps<{ poll: PollInfo; threadTitle?: string }>();

const pollTitle = computed(() => {
    const t = props.poll.title?.trim();
    if (t) return t;
    return props.threadTitle?.trim() || "投票";
});

const isEnded = computed(() => {
    const end = props.poll.end_time;
    if (end <= 0) return false;
    return end * 1000 < Date.now();
});

const statusText = computed(() => {
    if (isEnded.value) return "已结束";
    const end = props.poll.end_time;
    if (end <= 0) return "进行中";
    return `截止 ${formatDate(end * 1000)}`;
});

const sortedOptions = computed<PollOption[]>(() => {
    return [...props.poll.options].sort((a, b) => b.num - a.num);
});

const leadingId = computed(() => sortedOptions.value[0]?.id);

const denom = computed(() => {
    const base = props.poll.is_multi ? props.poll.total_poll : props.poll.total_num;
    return base > 0 ? base : 1;
});

function percent(num: number): string {
    const v = (num / denom.value) * 100;
    return `${v.toFixed(1)}%`;
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
    border-radius: 12px;
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
    height: 6px;
    border-radius: 3px;
    background: var(--minimal-fore-4, rgb(0 0 0 / 5%));
    overflow: hidden;
}

.option-bar-fill {
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
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 8px;
    margin-top: 14px;
    padding-top: 10px;
    border-top: 1px dashed var(--minimal-fore-3, rgb(0 0 0 / 8%));
    color: var(--minimal-fore-2, #888);
    font-size: 12px;
}

.poll-readonly-hint {
    color: var(--minimal-fore-2, #aaa);
}
</style>
