<template>
    <UserDialog ref="dialog" v-bind="dialogOpts" @unload="returnEditor">
        <div id="thread-editor">
            <div id="thread-editor-actions">
                <button type="button" aria-label="发表" id="thread-editor-submit" class="user-button editor-action"
                    @pointerdown.capture="stopActionEvent" @click.capture="submitFromAction">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
                </button>
                <button type="button" aria-label="关闭" id="thread-editor-exit" class="user-button editor-action"
                    @pointerdown.capture="stopActionEvent" @click.capture="closeFromAction">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
                </button>
            </div>
            <UserTextbox v-if="type === 'thread'" class="title-editor" placeholder="输入标题" lodash-style></UserTextbox>

            <div ref="editorSlot" id="thread-editor-slot"></div>
        </div>
    </UserDialog>
</template>

<script lang="tsx" setup>
import { imagesViewer } from "@/components/images-viewer";
import { asyncdom } from "@/lib/elemental";
import { UEDITOR_READY_TIMEOUT, useUEditor } from "@/lib/utils/use-ueditor";
import { UserDialog, UserDialogOpts, UserTextbox } from "user-view";
import { nextTick, onMounted, ref } from "vue";

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
const editorSlot = ref<HTMLDivElement>();

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
    const toolbar = await asyncdom(".edui-toolbar", editorSlot.value, UEDITOR_READY_TIMEOUT);
    const editorBody = await asyncdom(".edui-editor-body", editorSlot.value, UEDITOR_READY_TIMEOUT);
    if (!toolbar || !editorBody) {
        unload();
        return;
    }
    if (toolbar.compareDocumentPosition(editorBody) & Node.DOCUMENT_POSITION_FOLLOWING) {
        toolbar.parentNode?.insertBefore(editorBody, toolbar);
    }

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

function returnEditor() {
    const scrollY = window.scrollY;
    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
    }
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
    align-items: center;
    margin: auto auto 0;
    background-color: var(--default-background);
    font-size: 12px;
    gap: 8px;
    transition: 0.4s;

    #thread-editor-actions {
        display: flex;
        width: 100%;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;

        .editor-action {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 6px;
            line-height: 1;

            svg {
                width: 18px;
                height: 18px;
                fill: currentColor;
            }
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

    h1 {
        margin-right: auto;
    }


    #thread-editor-slot {
        width: 100%;
        flex-shrink: 2;
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

.user-dialog-modal:has(#thread-editor) .user-dialog {
    pointer-events: auto;
}

#thread-editor {
    .j-placeholder-pay-member {
        display: none !important;
    }

    #ueditor_replace {
        font-size: 16px;
    }

    .edui-container {
        width: 100% !important;

        .edui-toolbar {
            height: auto;
            align-items: center;
            background-color: transparent;

            .edui-btn-toolbar {
                display: flex;
                background-color: transparent;
                gap: 8px;

                .edui-btn {
                    padding: 1px;
                    border-radius: 4px;
                    margin-right: 0;
                    background: none;
                    background-color: var(--light-background);
                    box-shadow: 0 0 0 1px var(--border-color);
                    cursor: pointer;
                    transition: 0.4s;

                    .edui-icon {
                        display: flex;
                        width: max-content;
                        align-items: center;
                        padding: 2px 4px;
                        background: none;
                        gap: 4px;

                        &::before {
                            @extend %icon;
                            font-size: 16px;
                        }
                    }
                }
            }

            .edui-dialog-container .edui-dropdown-menu {
                overflow: hidden;
                width: max-content;
                padding: 0;
                border: 2px solid var(--border-color);
                border-radius: 6px;
                background: none;

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

        .edui-editor-body {
            border: none;
            border-radius: 0;
            border-bottom: 3px solid var(--tieba-theme-color);
            transition: 0.4s;

            &:hover {
                border-color: var(--light-background);
            }

            &:focus {
                border-color: var(--tieba-theme-color);
            }
        }

        .edui-body-container {
            min-height: 18px !important;
            max-height: 50vh;
            padding: 0;
            border-radius: 0;
            background-color: transparent;

            img {
                max-width: 100%;
                height: auto;
            }

            img.BDE_Image {
                zoom: 0.3;
                cursor: zoom-in;
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
                content: "diamond";
            }

            &::after {
                content: "特权";
            }
        }

        &.edui-icon-image {
            &::before {
                content: "photo";
            }

            &::after {
                content: "插入图片";
            }
        }

        &.edui-icon-video {
            &::before {
                content: "video_file";
            }

            &::after {
                content: "插入视频";
            }
        }

        &.edui-icon-emotion {
            &::before {
                content: "face";
            }

            &::after {
                content: "插入表情";
            }
        }

        &.edui-icon-scrawl {
            &::before {
                content: "format_paint";
            }

            &::after {
                content: "涂鸦";
            }
        }

        &.edui-icon-topic {
            &::before {
                content: "grid_3x3";
            }

            &::after {
                content: "话题";
            }
        }

        &.edui-icon-quick-reply {
            &::before {
                content: "rocket_launch";
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
                    @extend %icon;
                    font-size: 16px;
                }
            }
        }
    }
}

.layer_medal_list {
    li {
        &.post_bubble a {
            &::before {
                content: "bubble_chart";
            }

            &::after {
                content: "发帖气泡";
            }
        }

        &.colorful_font a {
            &::before {
                content: "format_color_text";
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
                content: "upload_file";
            }

            &::after {
                content: "上传文件";
            }
        }

        &.from_web a {
            &::before {
                content: "web";
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
                    @extend %icon;
                    font-size: 10px;
                }
            }

            .s_prev::before {
                content: "arrow_back_ios";
            }

            .s_next::before {
                content: "arrow_forward_ios";
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
