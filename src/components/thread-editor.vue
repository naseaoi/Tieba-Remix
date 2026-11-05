<template>
    <UserDialog ref="dialog" v-bind="dialogOpts" @unload="returnEditor">
        <div id="thread-editor">
            <div id="thread-editor-header">
                <span class="editor-title">{{ type === "thread" ? "发表新帖" : "回复帖子" }}</span>
                <button type="button" aria-label="关闭" title="关闭" id="thread-editor-exit" class="editor-action"
                    @pointerdown.capture="stopActionEvent" @click.capture="closeFromAction">
                    <X aria-hidden="true" />
                </button>
            </div>
            <UserTextbox v-if="type === 'thread'" class="title-editor" placeholder="输入标题" lodash-style></UserTextbox>

            <div ref="composer" class="editor-composer">
                <div ref="editorSlot" id="thread-editor-slot"></div>
                <!-- 挂载后移入原生工具栏行尾，卸载前收回 -->
                <button ref="submitButton" type="button" id="thread-editor-submit" class="editor-submit"
                    @pointerdown.capture="stopActionEvent" @click.capture="submitFromAction">
                    <span>发表</span>
                    <Send aria-hidden="true" />
                </button>
            </div>
        </div>
    </UserDialog>
</template>

<script lang="tsx" setup>
import { Send, X } from "@lucide/vue";
import { imagesViewer } from "@/components/images-viewer";
import { asyncdom } from "@/lib/elemental";
import { UEDITOR_READY_TIMEOUT, useUEditor } from "@/lib/utils/use-ueditor";
import { UserDialog, UserDialogOpts, UserTextbox } from "user-view";
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";

export interface ThreadEditorOpts {
    ueditor: Element;
    type?: "thread" | "reply";
    editableSelector?: string;
    submitSelector?: string;
}

const props = withDefaults(defineProps<ThreadEditorOpts>(), {
    type: "thread",
    editableSelector: "#ueditor_replace",
    submitSelector: ".j_submit",
});

const dialogOpts: UserDialogOpts = {
    modal: true,
    force: false,
    blurEffect: false,
    animation: true,
    lockScroll: false,
    clickModalToUnload: false,
    modalStyle: {
        background: "none",
    },
    containerStyle: {
        position: "fixed",
        width: "100%",
        maxWidth: "var(--content-max)",
        bottom: "0",
        marginBottom: "0",
        borderBottomLeftRadius: "0",
        borderBottomRightRadius: "0",
        boxShadow: "0 0 24px var(--tieba-theme-color)",
    },
    renderAnimation: "kf-editor-in 0.28s cubic-bezier(0.22, 0.61, 0.36, 1)",
    unloadAnimation: "kf-editor-out 0.28s cubic-bezier(0.22, 0.61, 0.36, 1)",
};

const dialog = ref<InstanceType<typeof UserDialog>>();
const composer = ref<HTMLDivElement>();
const editorSlot = ref<HTMLDivElement>();
const submitButton = ref<HTMLButtonElement>();
let toolbarElement: HTMLElement | undefined;
let popupOwner: HTMLElement | undefined;

// 先于 useUEditor 注册，保证原生编辑器归还前已收回发表按钮并解除工具栏监听
onBeforeUnmount(releaseToolbar);

const editor = useUEditor(editorSlot, {
    ueditor: props.ueditor,
    editable: props.editableSelector,
    submit: props.submitSelector,
});

onMounted(async function () {
    await nextTick();
    const scrollY = window.scrollY;
    if (!(await editor.adopt())) {
        unload();
        return;
    }

    if (!editorSlot.value) return;
    editorSlot.value.addEventListener("click", onImageClick, true);
    const toolbar = await asyncdom<"div">(".edui-toolbar", editorSlot.value, UEDITOR_READY_TIMEOUT);
    const editorBody = await asyncdom(".edui-editor-body", editorSlot.value, UEDITOR_READY_TIMEOUT);
    if (!toolbar || !editorBody) {
        unload();
        return;
    }
    if (toolbar.compareDocumentPosition(editorBody) & Node.DOCUMENT_POSITION_FOLLOWING) {
        toolbar.parentNode?.insertBefore(editorBody, toolbar);
    }
    if (submitButton.value) {
        toolbar.insertBefore(submitButton.value, toolbar.querySelector(":scope > .edui-dialog-container"));
    }
    toolbar.addEventListener("click", onToolbarClick, true);
    toolbarElement = toolbar;

    await editor.focus();
    window.scrollTo({ top: scrollY });
});

async function submit() {
    await editor.submit();
    unload();
}

function stopActionEvent(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
}

async function submitFromAction(event: Event) {
    stopActionEvent(event);
    await submit();
}

function closeFromAction(event: Event) {
    stopActionEvent(event);
    unload();
}

function onImageClick(event: MouseEvent) {
    const target = event.target;
    if (!(target instanceof HTMLImageElement) || !target.classList.contains("BDE_Image")) return;
    event.preventDefault();
    event.stopPropagation();
    void imagesViewer({ content: target.getAttribute("src") ?? target.src });
}

function unload() {
    dialog.value?.unload();
}

function releaseToolbar() {
    if (submitButton.value && composer.value && submitButton.value.parentElement !== composer.value) {
        composer.value.appendChild(submitButton.value);
    }
    toolbarElement?.removeEventListener("click", onToolbarClick, true);
    toolbarElement?.style.removeProperty("--tbr-popup-left");
    popupOwner?.classList.remove("tbr-popup-owner");
    toolbarElement = popupOwner = undefined;
}

function visiblePopup() {
    return Array.from(toolbarElement?.querySelectorAll<HTMLElement>(":scope > .edui-dialog-container > .edui-popup") ?? [])
        .find(popup => popup.style.display !== "none");
}

// 原生弹层不会因再次点击按钮而收起，借用其点击外部即关闭的行为实现切换
function onToolbarClick(event: MouseEvent) {
    const button = (event.target as Element).closest<HTMLElement>(".edui-btn");
    if (!button || !toolbarElement) return;
    if (button === popupOwner && visiblePopup()) {
        stopActionEvent(event);
        document.body.click();
        return;
    }
    popupOwner?.classList.remove("tbr-popup-owner");
    popupOwner = button;
    button.classList.add("tbr-popup-owner");
    requestAnimationFrame(() => placePopup(button));
}

function placePopup(button: HTMLElement) {
    const popup = visiblePopup();
    if (!popup || !toolbarElement) return;
    const offset = button.getBoundingClientRect().left - toolbarElement.getBoundingClientRect().left;
    const left = Math.max(0, Math.min(offset, toolbarElement.clientWidth - popup.offsetWidth));
    toolbarElement.style.setProperty("--tbr-popup-left", `${left}px`);
}

function returnEditor() {
    const scrollY = window.scrollY;
    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
    }
    releaseToolbar();
    editor.restore();
    window.scrollTo({ top: scrollY });
}

defineExpose({ unload });
</script>

<style lang="scss" scoped>
#thread-editor {
    display: flex;
    width: 100%;
    max-width: var(--content-max);
    max-height: 100vh;
    box-sizing: border-box;
    flex-direction: column;
    margin: auto auto 0;
    background-color: var(--default-background);
    font-size: 12px;
    gap: 10px;
    transition: 0.4s;

    #thread-editor-header {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .editor-title {
            color: var(--default-fore);
            font-size: 15px;
            font-weight: var(--font-weight-bold);
        }
    }

    .editor-action {
        display: inline-flex;
        width: 28px;
        height: 28px;
        align-items: center;
        justify-content: center;
        padding: 0;
        border: none;
        border-radius: 8px;
        background: none;
        color: var(--light-fore);
        cursor: pointer;
        transition:
            background-color var(--fast-duration) ease,
            color var(--fast-duration) ease;

        &:hover,
        &:focus-visible {
            background-color: var(--default-hover);
            color: var(--default-fore);
        }

        svg {
            width: 18px;
            height: 18px;
        }
    }

    .title-editor {
        width: 100%;
        flex-grow: 1;
        border-width: 3px;
        background-color: transparent;
        font-size: 24px;
        font-weight: var(--font-weight-bold);
    }

    .editor-composer {
        box-sizing: border-box;
        width: 100%;
        flex-shrink: 2;
        border: 1px solid var(--border-color);
        border-radius: 12px;
        background-color: var(--default-background);
        transition:
            border-color var(--fast-duration) ease,
            box-shadow var(--fast-duration) ease;

        &:focus-within {
            border-color: var(--tieba-theme-color);
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--tieba-theme-color) 16%, transparent);
        }

        // 尚未移入工具栏时不显示
        > .editor-submit {
            display: none;
        }
    }

    #thread-editor-slot {
        width: 100%;
    }

    .editor-submit {
        display: inline-flex;
        height: 30px;
        flex-shrink: 0;
        align-items: center;
        padding: 0 14px;
        border: none;
        border-radius: 8px;
        margin-left: auto;
        // 原生工具栏会给按钮加渐变 background-image
        background: var(--tieba-theme-color);
        color: #fff;
        cursor: pointer;
        font-size: 13px;
        font-weight: var(--font-weight-bold);
        gap: 6px;
        transition:
            filter var(--fast-duration) ease,
            transform var(--fast-duration) ease;

        &:hover,
        &:focus-visible {
            filter: brightness(1.08);
        }

        &:active {
            transform: scale(0.97);
        }

        svg {
            width: 15px;
            height: 15px;
        }
    }
}
</style>

<style lang="scss">
@keyframes kf-editor-in {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
}

@keyframes kf-editor-out {
    from { transform: translateY(0); }
    to { transform: translateY(100%); }
}

.user-dialog-modal:has(#thread-editor) {
    pointer-events: none;
}

@keyframes kf-editor-popup-in {
    from {
        opacity: 0;
        transform: translateY(4px);
    }
}

.user-dialog-modal:has(#thread-editor) .user-dialog {
    pointer-events: auto;

    // 工具栏弹层向上浮出弹窗，不能被裁切
    .dialog-content {
        overflow: visible;
    }
}

#thread-editor {
    .j-placeholder-pay-member {
        display: none !important;
    }

    .edui-container {
        width: 100% !important;

        .edui-editor-body {
            overflow: visible !important;
            height: auto !important;
            padding: 0 !important;
            border: none !important;
            border-radius: 0 !important;
            background: none !important;
            box-shadow: none !important;
        }

        .edui-body-container {
            min-height: 72px !important;
            max-height: 50vh;
            box-sizing: border-box;
            padding: 12px 14px 8px !important;
            border: none !important;
            border-radius: 0 !important;
            background: none !important;
            font-size: 15px;
            line-height: 1.6;
            outline: none;
            overflow-y: auto !important;
            scrollbar-width: thin;

            img {
                max-width: 100%;
                height: auto;
            }

            img.BDE_Image {
                zoom: 0.3;
                cursor: zoom-in;
            }
        }

        .edui-toolbar {
            position: relative;
            display: flex;
            height: auto;
            flex-wrap: wrap;
            align-items: center;
            padding: 0 6px 6px 8px;
            border: none !important;
            margin: 0;
            background: none;
            column-gap: 8px;

            .edui-btn-toolbar {
                display: flex;
                flex: 1;
                flex-wrap: wrap;
                padding: 0;
                margin: 0;
                background: none;
                gap: 2px;

                .edui-btn {
                    position: relative;
                    width: 30px;
                    height: 30px;
                    padding: 0;
                    border: none;
                    border-radius: 8px;
                    margin: 0;
                    background: none;
                    box-shadow: none;
                    color: var(--light-fore);
                    cursor: pointer;
                    transition:
                        background-color var(--fast-duration) ease,
                        color var(--fast-duration) ease;

                    &:hover {
                        background-color: var(--default-hover);
                        color: var(--default-fore);
                    }

                    .edui-icon {
                        display: flex;
                        width: 100%;
                        height: 100%;
                        align-items: center;
                        justify-content: center;
                        padding: 0;
                        background: none;

                        &::before {
                            width: 18px;
                            height: 18px;
                            flex: 0 0 18px;
                        }

                        // 按钮名称以 tooltip 呈现
                        &::after {
                            position: absolute;
                            z-index: 2;
                            bottom: calc(100% + 6px);
                            left: 50%;
                            padding: 3px 8px;
                            border-radius: 6px;
                            background-color: var(--default-fore);
                            color: var(--default-background);
                            font-size: 12px;
                            line-height: 18px;
                            opacity: 0;
                            pointer-events: none;
                            transform: translate(-50%, 2px);
                            transition:
                                opacity var(--fast-duration) ease,
                                transform var(--fast-duration) ease;
                            white-space: nowrap;
                        }
                    }

                    &:hover .edui-icon::after {
                        opacity: 1;
                        transform: translate(-50%, 0);
                    }
                }
            }

            &:has(> .edui-dialog-container > .edui-popup[style*="display: block"]) {
                .edui-btn.tbr-popup-owner {
                    background-color: color-mix(in srgb, var(--tieba-theme-color) 12%, transparent);
                    color: var(--tieba-theme-color);
                }

                // 弹层打开时 tooltip 会与之重叠
                .edui-icon::after {
                    display: none;
                }
            }

            // 弹层浮于工具栏上方，--tbr-popup-left 由组件按触发按钮位置计算
            .edui-dialog-container {
                position: absolute;
                z-index: 3;
                inset: 0;
                pointer-events: none;

                > .edui-popup {
                    position: absolute !important;
                    top: auto !important;
                    bottom: calc(100% + 8px);
                    left: var(--tbr-popup-left, 0) !important;
                    overflow: hidden;
                    width: max-content;
                    max-width: 100%;
                    box-sizing: border-box;
                    padding: 0;
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    margin: 0;
                    background: none;
                    box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
                    pointer-events: auto;
                    animation: kf-editor-popup-in var(--fast-duration) ease;

                    html.dark-theme & {
                        box-shadow: 0 8px 24px rgb(0 0 0 / 40%);
                    }

                    .edui-popup-body {
                        padding: 0;
                        border: none;
                        background-color: var(--default-background);
                    }

                    // 三角
                    .edui-popup-caret {
                        display: none;
                    }
                }
            }
        }
    }
}
</style>

<style lang="scss">
.edui-btn-topic {
    display: none !important;
}

#thread-editor {
    .edui-btn-toolbar .edui-icon {
        &.edui-icon-medal {
            &::before {
                @include lucide-mask-icon($lucide-diamond);
            }

            &::after {
                content: "特权";
            }
        }

        &.edui-icon-image {
            &::before {
                @include lucide-mask-icon($lucide-image);
            }

            &::after {
                content: "插入图片";
            }
        }

        &.edui-icon-video {
            &::before {
                @include lucide-mask-icon($lucide-video);
            }

            &::after {
                content: "插入视频";
            }
        }

        &.edui-icon-emotion {
            &::before {
                @include lucide-mask-icon($lucide-smile);
            }

            &::after {
                content: "插入表情";
            }
        }

        &.edui-icon-scrawl {
            &::before {
                @include lucide-mask-icon($lucide-brush);
            }

            &::after {
                content: "涂鸦";
            }
        }

        &.edui-icon-topic {
            &::before {
                @include lucide-mask-icon($lucide-hash);
            }

            &::after {
                content: "话题";
            }
        }

        &.edui-icon-quick-reply {
            &::before {
                @include lucide-mask-icon($lucide-rocket);
            }

            &::after {
                content: "快速回帖";
            }
        }
    }
}
</style>

<style lang="scss">
@use "@/stylesheets/components/user-button" as *;

.edui-dialog-container {
    .edui-popup {
        position: static !important;
    }

    .upload_container {
        padding: 0 20px 20px 0;

        .slide_item_img {
            overflow: hidden;
            border-color: var(--tieba-theme-color) !important;
        }

        .watermark_options {
            position: static;
            margin-left: 20px;
        }

        .next_step {
            @extend %user-button;
            position: static;
            width: max-content;
            height: max-content;
            padding: 4px 8px;
            margin-left: auto;
            line-height: normal;
        }
    }
}

.edui-popup-body {
    position: static;

    .layer_medal_list,
    .layer_btn_list {
        width: max-content;
        height: max-content;

        li {
            display: flex;
            overflow: hidden;
            align-items: center;
            padding: 0;
            background: none;

            a {
                @extend %user-button;
                display: flex;
                width: max-content;
                height: max-content;
                align-items: center;
                padding: 4px 8px;
                border-radius: 0;
                box-shadow: none;
                gap: 4px;

                &::before {
                    width: 16px;
                    height: 16px;
                    flex: 0 0 16px;
                }
            }
        }
    }
}

.layer_medal_list {
    li {
        &.post_bubble a {
            &::before {
                @include lucide-mask-icon($lucide-message-circle);
            }

            &::after {
                content: "发帖气泡";
            }
        }

        &.colorful_font a {
            &::before {
                @include lucide-mask-icon($lucide-type);
            }

            &::after {
                content: "彩色字体";
            }
        }
    }
}

.layer_btn_list {
    padding: 0 !important;

    li {
        border: none !important;

        &.from_upload a {
            &::before {
                @include lucide-mask-icon($lucide-upload);
            }

            &::after {
                content: "上传文件";
            }
        }

        &.from_web a {
            &::before {
                @include lucide-mask-icon($lucide-globe);
            }

            &::after {
                content: "网络图片";
            }
        }
    }
}
</style>

<style lang="scss">
@use "@/stylesheets/components/user-button" as *;

#thread-editor {
    .emotion_container {
        .tbui_scroll_panel {
            overflow: hidden;
            border-radius: 4px 4px 0 0;
        }

        html.dark-theme & td,
        html.dark-theme & .emotion_preview {
            filter: brightness(0.8);
        }

        .emotion_preview {
            border: 1px solid var(--border-color);
            border-radius: 6px;

            @include main-box-shadow;
        }

        .ueditor_emotion_tab {
            display: flex;
            align-items: center;
            justify-content: space-evenly;
            border-top: 2px solid var(--border-color);
            background: none;
            background-color: var(--default-background);
            color: var(--default-fore);

            .s_prev,
            .s_next {
                @extend %user-button;
                position: static;
                width: max-content !important;
                height: max-content !important;
                padding: 0 2px;
                background: none;
                box-shadow: none;

                &::before {
                    width: 10px;
                    height: 10px;
                }
            }

            .s_prev::before {
                @include lucide-mask-icon($lucide-chevron-left);
            }

            .s_next::before {
                @include lucide-mask-icon($lucide-chevron-right);
            }

            .s_tab_con_wrapper {
                position: static;

                .s_tab_btn {
                    border-radius: 4px;
                    background: none;
                    background-color: var(--default-background);

                    .s_tab_btnbg {
                        border-radius: 4px;
                        background: none;
                        transition: var(--default-duration);
                    }
                }

                .s_hover {
                    filter: brightness(1.2);

                    .s_tab_btnbg {
                        filter: brightness(1.4);
                    }
                }

                .selected {
                    background: none;

                    .s_tab_btnbg {
                        background-color: var(--tieba-theme-color);
                        color: var(--default-background);
                        font-weight: var(--font-weight-bold);
                    }
                }
            }
        }
    }
}
</style>
