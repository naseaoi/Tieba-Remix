<template>
    <UserDialog v-bind="dialogOpts">
        <div class="settings-wrapper remove-default">
            <!-- 左栏：标题 + 搜索 + 目录 -->
            <aside class="settings-sidebar">
                <header class="sidebar-header">
                    <h1 class="sidebar-title">设置</h1>
                    <UserTextbox v-model="searchText" class="sidebar-search" placeholder="搜索设置..."
                        @update:model-value="debSearchKey" />
                </header>

                <nav class="sidebar-nav">
                    <div v-for="main in userSettings" :key="main.name" class="nav-group">
                        <div class="nav-group-label">
                            <span class="material-symbols-outlined nav-group-icon">{{ main.icon }}</span>
                            <span class="nav-group-name">{{ main.name }}</span>
                        </div>
                        <ul class="nav-list">
                            <li v-for="sub in main.sub" :key="sub.name" class="nav-item"
                                :class="{ active: selectedSubKey?.name === sub.name && selectedKey?.name === main.name }"
                                @click="selectSubByPath(main, sub)">
                                {{ sub.name }}
                            </li>
                        </ul>
                    </div>
                </nav>
            </aside>

            <!-- 右栏：面包屑 + 大标题 + 滚动内容 -->
            <main class="settings-main">
                <header class="main-header" v-if="selectedSubKey">
                    <div class="breadcrumb">
                        <span class="crumb">{{ selectedKey?.name }}</span>
                        <span class="material-symbols-outlined crumb-sep">chevron_right</span>
                        <span class="crumb current">{{ selectedSubKey?.name }}</span>
                    </div>
                    <h2 class="main-title">{{ selectedSubKey?.name }}</h2>
                    <p class="main-desc" v-if="selectedSubKey?.description">{{ selectedSubKey.description }}</p>
                </header>

                <section class="main-body" v-if="selectedSubKey">
                    <template v-for="(content, key) in selectedSubKey.content" :key="key">
                        <!-- 纯组件页（about 项目信息 / 更新页等）：不包卡片 -->
                        <div v-if="content && isComponentOnly(content)" class="setting-component-wrap">
                            <component :is="content.widgets![0].component" @change-view="changeView" />
                        </div>

                        <!-- 简单行：title + 描述 在左，单一控件 在右 -->
                        <div v-else-if="content && isSimpleRow(content)" class="setting-row simple">
                            <div class="row-text">
                                <div v-if="content.title" class="row-title">{{ content.title }}</div>
                                <p v-for="(line, idx) in resolveSimpleDesc(content)" :key="idx" class="row-desc">{{ line }}</p>
                            </div>
                            <div class="row-control">
                                <SettingSwitch v-if="content.widgets![0].type === 'toggle'"
                                    :model-value="!!content.widgets![0].init?.()"
                                    @change="content.widgets![0].event?.($event)" />

                                <UserButton v-else-if="content.widgets![0].type === 'button'"
                                    class="row-button" @click="content.widgets![0].event">
                                    {{ content.widgets![0].content }}
                                </UserButton>

                                <SettingSelect v-else-if="content.widgets![0].type === 'select'"
                                    class="row-select"
                                    :data="content.widgets![0].content as UserSelectItem[]"
                                    :default-value="content.widgets![0].init?.()"
                                    @change="content.widgets![0].event" />
                            </div>
                        </div>

                        <!-- 复合行：顶部 title/描述，下方按序渲染 widgets -->
                        <div v-else-if="content" class="setting-row composite">
                            <div v-if="content.title || content.description" class="row-head">
                                <div v-if="content.title" class="row-title">{{ content.title }}</div>
                                <div v-if="content.description" class="row-desc">
                                    <p v-for="(line, idx) in splitLines(content.description)" :key="idx">{{ line }}</p>
                                </div>
                            </div>

                            <div v-if="content.widgets?.length" class="row-body">
                                <template v-for="(widget, widx) in content.widgets" :key="widx">
                                    <h4 v-if="widget.type === 'subTitle'" class="widget-subtitle">{{ widget.content }}</h4>

                                    <div v-else-if="widget.type === 'desc'" class="widget-desc">
                                        <p v-for="(line, idx) in splitLines(widget.content as string)" :key="idx">{{ line }}</p>
                                    </div>

                                    <!-- 复合内嵌 toggle：横向 标签 + 滑块 -->
                                    <div v-else-if="widget.type === 'toggle'" class="widget-toggle">
                                        <div class="toggle-label">{{ widget.content }}</div>
                                        <SettingSwitch :model-value="!!widget.init?.()" @change="widget.event?.($event)" />
                                    </div>

                                    <UserButton v-else-if="widget.type === 'button'" class="widget-button"
                                        @click="widget.event">{{ widget.content }}</UserButton>

                                    <SettingSelect v-else-if="widget.type === 'select' && Array.isArray(widget.content)"
                                        class="widget-select"
                                        :data="widget.content as UserSelectItem[]"
                                        :default-value="widget.init?.()" @change="widget.event" />

                                    <UserTextbox v-else-if="widget.type === 'textbox' || widget.type === 'textarea'"
                                        class="widget-textbox"
                                        :class="{ 'is-textarea': widget.type === 'textarea' }"
                                        :value="widget.init ? widget.init() : ''"
                                        :muti-lines="widget.type === 'textarea'"
                                        :placeholder="widget.placeHolder" @change="widget.event" />

                                    <div v-else-if="widget.type === 'icon'" class="widget-icon material-symbols-outlined">
                                        {{ widget.content }}
                                    </div>

                                    <img v-else-if="widget.type === 'image'" class="widget-image"
                                        :src="widget.content?.toString()" :alt="widget.altContent"
                                        :title="widget.altContent" @load="widget.init">

                                    <component v-else-if="widget.component" class="widget-component"
                                        :is="widget.component" @change-view="changeView" />
                                </template>
                            </div>
                        </div>
                    </template>
                </section>

                <!-- 默认空态 -->
                <section v-else class="main-empty">
                    <span class="material-symbols-outlined empty-icon">tune</span>
                    <p class="empty-tip">从左侧选择一项以开始配置</p>
                </section>

                <!-- 底部 desc 悬浮提示条（由 SettingSelect 等控件 hover 时填充） -->
                <transition name="desc-pop">
                    <div v-if="hoverDesc" class="main-desc-floater">{{ hoverDesc }}</div>
                </transition>
            </main>
        </div>
    </UserDialog>
</template>

<script lang="tsx" setup>
import SettingSelect from "@/components/setting-select.vue";
import SettingSwitch from "@/components/setting-switch.vue";
import { SupportedComponent } from "@/ex";
import { getUserSettings } from "@/lib/common/settings";
import _ from "lodash";
import { UserButton, UserDialog, UserDialogOpts, UserSelectItem, UserTextbox } from "user-view";
import { onMounted, provide, ref } from "vue";

export interface UserSettings {
    [props: string]: MainSettingKey;
}

export interface SettingKey {
    name: string;
    icon?: string;
    description?: string;
}

export interface MainSettingKey extends SettingKey {
    sub: {
        [props: string]: SubSettingKey;
    }
}

export interface SubSettingKey extends SettingKey {
    content: {
        [props: string]: SettingContent | undefined;
    }
}

export interface SettingContent {
    title?: string;
    description?: string;
    widgets?: {
        type: "toggle" | "icon" | "button" | "select" | "subTitle" | "desc" | "textbox" | "textarea" | "image" | "component";
        init?: (() => any);
        event?: ((e: any) => any);
        content?: string | LiteralObject | Array<unknown>;
        component?: SupportedComponent;
        placeHolder?: string;
        altContent?: string;
    }[]
}

const userSettings = getUserSettings();

const dialogOpts: UserDialogOpts = {
    uniqueName: "settings",
    animation: true,
    modal: true,
    lockScroll: true,
    modalStyle: {
        alignItems: "center",
        justifyContent: "center",
    },
    containerStyle: {
        display: "flex",
        flexDirection: "row",
        width: "min(960px, 92vw)",
        height: "min(640px, 86vh)",
        maxWidth: "92vw",
        maxHeight: "86vh",
        padding: "0",
        overflow: "hidden",
    },
};

const searchText = ref("");
const selectedKey = ref<MainSettingKey>();
const selectedSubKey = ref<SubSettingKey>();

// 底部 desc 悬浮提示：由 SettingSelect 等子控件通过 inject 写入
const hoverDesc = ref("");
provide("settingHoverDesc", {
    set: (text: string) => { hoverDesc.value = text || ""; },
    clear: () => { hoverDesc.value = ""; },
});

function selectSubByPath(main: MainSettingKey, sub: SubSettingKey) {
    selectedKey.value = main;
    selectedSubKey.value = sub;
}

function changeView(key: string, sub: string) {
    selectedKey.value = userSettings[key];
    selectedSubKey.value = userSettings[key].sub[sub];
}

function clearSelections() {
    selectedKey.value = undefined;
    selectedSubKey.value = undefined;
}

function searchKey() {
    if (searchText.value.length <= 0) return;

    if (!_.find(userSettings, (mainKey) => {
        return !!_.find(mainKey.sub, (subKey) => {
            if (subKey.name.toLowerCase().includes(searchText.value.toLowerCase())) {
                selectedKey.value = mainKey;
                selectedSubKey.value = subKey;
                return true;
            }
            return false;
        });
    })) clearSelections();
}

const debSearchKey = _.debounce(searchKey, 300);

// 渲染辅助
const SIMPLE_TYPES = new Set(["toggle", "button", "select"]);

function isSimpleRow(content: SettingContent): boolean {
    const widgets = content.widgets ?? [];
    if (widgets.length !== 1) return false;
    return SIMPLE_TYPES.has(widgets[0].type);
}

function isComponentOnly(content: SettingContent): boolean {
    if (content.title || content.description) return false;
    const widgets = content.widgets ?? [];
    if (widgets.length !== 1) return false;
    return widgets[0].type === "component" && !!widgets[0].component;
}

function splitLines(text?: string): string[] {
    if (!text) return [];
    return text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
}

function resolveSimpleDesc(content: SettingContent): string[] {
    if (content.description) return splitLines(content.description);
    const w = content.widgets?.[0];
    // toggle 的 widget.content 通常是描述文字
    if (w?.type === "toggle" && typeof w.content === "string") return splitLines(w.content);
    return [];
}

// 首次打开默认选中第一个分类的第一个子分类
onMounted(() => {
    const firstMain = _.values(userSettings)[0];
    if (firstMain) {
        const firstSub = _.values(firstMain.sub)[0];
        if (firstSub) {
            selectedKey.value = firstMain;
            selectedSubKey.value = firstSub;
        }
    }
});

defineExpose({
    dialogOpts,
});
</script>

<style lang="scss" scoped>
// ---------- 设计令牌（本组件内私有）----------
$radius-sm: 6px;
$radius-md: 8px;
$radius-lg: 12px;
$gap-row: 12px;
$pad-row: 14px 16px;
$sidebar-width: 240px;
$ease: cubic-bezier(0.4, 0, 0.2, 1);
$dur: 0.18s;

// ---------- 整体容器 ----------
.settings-wrapper {
    display: flex;
    overflow: hidden;
    width: 100%;
    height: 100%;
    background-color: var(--default-background);
    font-size: 14px;
}

// ---------- 左栏侧边目录 ----------
.settings-sidebar {
    display: flex;
    overflow: hidden;
    width: $sidebar-width;
    min-width: $sidebar-width;
    flex-direction: column;
    background-color: var(--deep-background);
    border-right: 1px solid var(--border-color);

    .sidebar-header {
        display: flex;
        flex-direction: column;
        padding: 16px 16px 12px;
        gap: 10px;

        .sidebar-title {
            margin: 0;
            color: var(--highlight-fore);
            font-size: 18px;
            font-weight: var(--font-weight-bold);
            line-height: 1.2;
        }

        .sidebar-search {
            box-sizing: border-box;
            width: 100%;
            padding: 6px 10px;
            font-size: 13px;
        }
    }

    .sidebar-nav {
        display: flex;
        overflow-y: auto;
        flex: 1;
        flex-direction: column;
        padding: 4px 8px 16px;
        gap: 4px;

        // 细滚动条（无 track 背景）
        scrollbar-width: thin;
        scrollbar-color: var(--border-color) transparent;

        &::-webkit-scrollbar {
            width: 6px;
        }

        &::-webkit-scrollbar-track {
            background: transparent;
        }

        &::-webkit-scrollbar-thumb {
            border-radius: 3px;
            background-color: var(--border-color);
            transition: background-color 0.2s ease;
        }

        &::-webkit-scrollbar-thumb:hover {
            background-color: var(--minimal-fore);
        }

        .nav-group {
            display: flex;
            flex-direction: column;
            padding: 8px 0 4px;
        }

        .nav-group-label {
            display: flex;
            align-items: center;
            padding: 4px 8px;
            color: var(--minimal-fore);
            font-size: 11px;
            font-weight: var(--font-weight-bold);
            letter-spacing: 0.04em;
            text-transform: uppercase;
            gap: 6px;
            user-select: none;

            .nav-group-icon {
                font-size: 14px;
                font-variation-settings: "FILL" 0, "wght" 400;
            }
        }

        .nav-list {
            display: flex;
            flex-direction: column;
            padding: 0;
            margin: 2px 0 0;
            list-style: none;
            gap: 1px;
        }

        .nav-item {
            padding: 7px 10px 7px 28px;
            border-radius: $radius-sm;
            color: var(--default-fore);
            cursor: pointer;
            font-size: 13px;
            transition:
                background-color $dur $ease,
                color $dur $ease;

            &:hover:not(.active) {
                background-color: var(--default-hover);
            }

            &.active {
                background-color: var(--default-hover);
                color: var(--highlight-fore);
                font-weight: var(--font-weight-bold);
            }
        }
    }
}

// ---------- 右栏主区 ----------
.settings-main {
    position: relative;
    display: flex;
    overflow: hidden;
    flex: 1;
    flex-direction: column;
    background-color: var(--default-background);

    .main-header {
        display: flex;
        flex-direction: column;
        padding: 18px 24px 14px;
        border-bottom: 1px solid var(--border-color);
        background-color: var(--default-background);
        gap: 6px;

        .breadcrumb {
            display: flex;
            align-items: center;
            color: var(--minimal-fore);
            font-size: 12px;
            gap: 4px;

            .crumb-sep {
                font-size: 14px;
            }

            .crumb.current {
                color: var(--default-fore);
            }
        }

        .main-title {
            margin: 0;
            color: var(--highlight-fore);
            font-size: 20px;
            font-weight: var(--font-weight-bold);
            line-height: 1.3;
        }

        .main-desc {
            margin: 0;
            color: var(--light-fore);
            font-size: 13px;
        }
    }

    .main-body {
        display: flex;
        overflow-y: auto;
        flex: 1;
        flex-direction: column;
        padding: 16px 24px 24px;
        gap: $gap-row;

        // 细滚动条（无 track 背景）
        scrollbar-width: thin;
        scrollbar-color: var(--border-color) transparent;

        &::-webkit-scrollbar {
            width: 6px;
        }

        &::-webkit-scrollbar-track {
            background: transparent;
        }

        &::-webkit-scrollbar-thumb {
            border-radius: 3px;
            background-color: var(--border-color);
            transition: background-color 0.2s ease;
        }

        &::-webkit-scrollbar-thumb:hover {
            background-color: var(--minimal-fore);
        }
    }

    .main-empty {
        display: flex;
        flex: 1;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: var(--minimal-fore);
        gap: 12px;

        .empty-icon {
            font-size: 56px;
            font-variation-settings: "FILL" 0, "wght" 300;
        }

        .empty-tip {
            margin: 0;
            font-size: 13px;
        }
    }

    // 底部 desc 悬浮提示条：位于 settings-main 右下，跨 main-body 滚动区，从下方滑入
    .main-desc-floater {
        position: absolute;
        z-index: 30;
        right: 16px;
        bottom: 14px;
        left: 16px;
        max-width: 720px;
        padding: 10px 14px;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        margin: 0 auto;
        background-color: var(--default-background);
        box-shadow: 0 6px 18px rgb(0 0 0 / 12%);
        color: var(--light-fore);
        font-size: 12.5px;
        line-height: 1.5;
        pointer-events: none;
    }
}

// 悬浮条进入/退出动画
.desc-pop-enter-active,
.desc-pop-leave-active {
    transition:
        opacity 0.18s $ease,
        transform 0.18s $ease;
}

.desc-pop-enter-from,
.desc-pop-leave-to {
    opacity: 0;
    transform: translateY(8px);
}

// ---------- 设置行 ----------
.setting-row {
    box-sizing: border-box;
    border: 1px solid var(--border-color);
    border-radius: $radius-md;
    background-color: var(--default-background);
    transition: border-color $dur $ease;

    &:hover {
        border-color: var(--minimal-fore);
    }

    // 简单行：左标题右控件
    &.simple {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: $pad-row;
        gap: 16px;

        .row-text {
            display: flex;
            min-width: 0;
            flex: 1;
            flex-direction: column;
            gap: 3px;
        }

        .row-control {
            display: flex;
            flex-shrink: 0;
            align-items: center;
        }
    }

    // 复合行：上下堆叠
    &.composite {
        display: flex;
        flex-direction: column;
        padding: $pad-row;
        gap: 12px;

        .row-head {
            display: flex;
            flex-direction: column;
            gap: 3px;
        }

        .row-body {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
    }

    .row-title {
        color: var(--highlight-fore);
        font-size: 14px;
        font-weight: var(--font-weight-bold);
        line-height: 1.35;
    }

    .row-desc {
        margin: 0;
        color: var(--light-fore);
        font-size: 12.5px;
        line-height: 1.5;
    }
}

// ---------- 行内控件样式 ----------
.row-button,
.widget-button {
    min-width: 72px;
    padding: 6px 14px;
    font-size: 13px;
}

.row-select,
.widget-select {
    width: min(100%, 240px);
}

.widget-subtitle {
    margin: 6px 0 0;
    color: var(--default-fore);
    font-size: 13px;
    font-weight: var(--font-weight-bold);
}

.widget-desc {
    color: var(--light-fore);
    font-size: 12.5px;
    line-height: 1.5;

    p {
        margin: 0;
    }
}

.widget-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;
    border-top: 1px solid var(--light-border-color);
    gap: 16px;

    &:first-child {
        padding-top: 0;
        border-top: none;
    }

    .toggle-label {
        flex: 1;
        color: var(--default-fore);
        font-size: 13px;
        line-height: 1.5;
    }
}

.widget-textbox {
    box-sizing: border-box;
    width: 100%;
    padding: 6px 10px;
    font-size: 13px;

    &.is-textarea {
        min-height: 7em;
        font-family: var(--code-monospace);
        resize: vertical;
    }
}

.widget-icon {
    margin: 4px auto;
    color: var(--minimal-fore);
    font-size: 52px;
    font-variation-settings: "FILL" 1;
    text-align: center;
}

.widget-image {
    max-width: 100%;
    max-height: 280px;
    border: 1px solid var(--border-color);
    border-radius: $radius-md;
    margin: 0 auto;
    object-fit: contain;
}

.widget-component {
    display: block;
}

// 纯组件页容器（不包卡片）：撑满 main-body 让内部组件自行控制居中
.setting-component-wrap {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
}
</style>
