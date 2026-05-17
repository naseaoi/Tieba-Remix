<template>
    <UserDialog ref="dialog" v-bind="dialogOpts">
        <div ref="imagesViewer" class="images-viewer" @click="clickModal">
            <div ref="imageContainer" class="image-container dialog-toggle">
                <div v-show="loading" class="image-loading-spinner"></div>
                <img ref="currImage" class="curr-image changing" :class="{ 'loading-img': loading }"
                    :src="imageArray[curr]" :style="parseCSSRule(imageStyle)">
            </div>

            <div class="control-panel head-controls" :class="{ 'hide': !showControls.top }">
                <UserButton class="zoom-in head-btn icon" title="缩小" @click="zoomImage(0.5)">
                    zoom_in
                </UserButton>
                <UserButton class="zoom-out head-btn icon" title="放大" @click="zoomImage(-0.5)">
                    zoom_out
                </UserButton>
                <span class="zoom-size">{{ Math.round(scale * 100) + "%" }}</span>
                <span class="head-sep">|</span>
                <UserButton class="turn-left head-btn icon" title="逆时针旋转" @click="rotateImage(-90)">
                    undo
                </UserButton>
                <UserButton class=" turn-right head-btn icon" title="顺时针旋转" @click="rotateImage(90)">
                    redo
                </UserButton>
                <span class="head-sep">|</span>
                <UserButton class="close head-btn icon" title="关闭" @click="unload">
                    close
                </UserButton>
            </div>

            <UserButton v-if="imageArray.length > 1" class="control-panel back icon"
                :class="{ 'hide': !showControls.left }" title="上一张" @click="listBack">
                chevron_left
            </UserButton>
            <UserButton v-if="imageArray.length > 1" class="control-panel forward icon"
                :class="{ 'hide': !showControls.right }" title="下一张" @click="listForward">
                chevron_right
            </UserButton>

            <div ref="bottomPanel"
                class="control-panel bottom-controls-wrapper"
                :class="{ 'hide': !showControls.bottom }">
                <div ref="bottomContainerRef" class="bottom-controls-container">
                    <div ref="thumbContainer" class="thumb-container">
                        <UserButton v-for="(thumb, index) in thumbArray" class="bottom-btn"
                            :class="{ 'selected': index === curr }" no-border="all">
                            <img class="image-list" alt="" :data-lazyload="thumb" @click="curr = index">
                        </UserButton>
                    </div>
                </div>
                <div ref="scrollBar" class="bottom-panel-scroll-bar"
                    :class="{ 'dragging': isScrollDragging }"
                    @mousedown="onScrollBarMouseDown"></div>
            </div>
        </div>
    </UserDialog>
</template>

<script setup lang="ts">
import { dom } from "@/lib/elemental";
import { EventProxy } from "@/lib/elemental/event-proxy";
import { CSSRule, parseCSSRule } from "@/lib/elemental/styles";
import { styleTheme } from "@/lib/user-values";
import _ from "@/lib/utils/_";
import { UserButton, UserDialog, UserDialogOpts } from "user-view";
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";

export interface ImagesViewerOpts {
    content: string | string[] | TiebaPost | ThreadPicture[];
    defaultIndex?: number;
}

interface ControlDirectionMap<T> {
    left: T;
    right: T;
    top: T;
    bottom: T;
}

interface ZoomAnchor {
    x: number;
    y: number;
}

const props = withDefaults(defineProps<ImagesViewerOpts>(), {
    defaultIndex: 0,
});

const imageArray: string[] = [];
const thumbArray: string[] = [];
if (typeof props.content === "string") {
    imageArray.push(props.content);
    thumbArray.push(props.content);
} else if (Array.isArray(props.content)) {
    if (typeof props.content[0] === "string") {
        imageArray.push(...props.content as string[]);
        thumbArray.push(...props.content as string[]);
    } else {
        (props.content as ThreadPicture[]).forEach((value) => {
            imageArray.push(value.original);
            thumbArray.push(value.thumbnail);
        });
    }
} else {
    ((props.content as TiebaPost).images).forEach((value) => {
        imageArray.push(value.original);
        thumbArray.push(value.thumb);
    });
}

const dialog = ref<InstanceType<typeof UserDialog>>();
const imagesViewer = ref<HTMLDivElement>();
const imageContainer = ref<HTMLDivElement>();
const currImage = ref<HTMLImageElement>();
const bottomPanel = ref<HTMLDivElement>();
const bottomContainerRef = ref<HTMLDivElement>();
const thumbContainer = ref<HTMLDivElement>();
const scrollBar = ref<HTMLDivElement>();
const curr = ref(props.defaultIndex);
const scale = ref(1.0);
const deg = ref(0);
const imageLeft = ref<Maybe<number>>(undefined);
const imageTop = ref<Maybe<number>>(undefined);
// 用 width/height 替代 transform:scale，避开合成层缩放导致的模糊
const naturalSize = ref({ width: 0, height: 0 });
const showControls = ref<ControlDirectionMap<boolean>>({
    left: false,
    right: false,
    top: false,
    bottom: false,
});
const lockControls = ref<ControlDirectionMap<boolean>>({
    left: false,
    right: false,
    top: false,
    bottom: false,
});
const loading = ref(true);
const disableImageTransition = ref(false);
const isScrollDragging = ref(false);

const imageStyle = computed<CSSRule>(() => {
    const w = naturalSize.value.width * scale.value;
    const h = naturalSize.value.height * scale.value;
    return {
        width: w ? `${w}px` : undefined,
        height: h ? `${h}px` : undefined,
        transform: `rotate(${deg.value}deg)`,
        left: imageLeft.value === undefined ? undefined : `${imageLeft.value}px`,
        top: imageTop.value === undefined ? undefined : `${imageTop.value}px`,
        transition: disableImageTransition.value
            ? "none"
            : "width 0.4s ease, height 0.4s ease, transform 0.4s ease, left 0s, top 0s",
    };
});

const dialogOpts: UserDialogOpts = {
    blurEffect: false,
    shadowMode: true,
    contentStyle: {
        width: "100%",
        height: "100%",
        padding: "0",
    },
    // 透明化 user-dialog 容器，去除其默认白底/边框/圆角，避免出现"圆角矩形白底"
    containerStyle: {
        background: "transparent",
        border: "none",
        boxShadow: "none",
        margin: "0",
        borderRadius: "0",
        padding: "0",
    },
    // Vercel 主题：接管 modal mask 颜色 + 渐暗动画
    ...(styleTheme.get() === "vercel" ? {
        modalStyle: {
            backgroundColor: "rgb(0 0 0 / 92%)",
            animation: "kf-viewer-mask-fade 0.25s ease both",
        },
    } : {}),
    renderAnimation: "kf-fade-in var(--fast-duration)",
    unloadAnimation: "kf-fade-out var(--fast-duration)",
    uniqueName: "images-viewer",
};

// 状态
const MIN_SIZE = 0.1 as const;
const MAX_SIZE = 8.0 as const;
const DEFAULT_HIDE_CONTROLS_DELAY = 3000 as const;
const SHOW_CONTROLS_THRESHOLD_X = 180 as const;
const SHOW_CONTROLS_THRESHOLD_Y = 140 as const;
// 看图 UI 占用空间预留（顶部控件 + 底部缩略图 / 两侧翻页）
const UI_RESERVED_HEIGHT = 160 as const;
const UI_RESERVED_WIDTH = 200 as const;

const evproxy = new EventProxy();
let lastMousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let lastControlTimeout: ControlDirectionMap<number> = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
};
let thumbLazyloadObserver: IntersectionObserver;

onMounted(async () => {
    await nextTick();

    const currentBottom = dom(".bottom-btn", thumbContainer.value!, [])[props.defaultIndex];
    currentBottom?.scrollIntoView({
        inline: "center",
    });

    let offsetX = 0, offsetY = 0;

    evproxy.on(window, "mousemove", _.throttle(function (e: MouseEvent) {
        const { clientX, clientY } = e;
        lastMousePos = { x: clientX, y: clientY };
        showControls.value = verifyPos();
    }, 100, { leading: true }));

    lockControlsTemporarily("all", DEFAULT_HIDE_CONTROLS_DELAY);

    evproxy.on(imagesViewer.value, "wheel", imageWheel, { passive: true });

    evproxy.on(currImage.value, "mousedown", (e: MouseEvent) => {
        if (!currImage.value) return;
        e.preventDefault();

        offsetX = e.clientX - currImage.value.offsetLeft;
        offsetY = e.clientY - currImage.value.offsetTop;
        document.addEventListener("mousemove", moveHandler);
    });

    evproxy.on(document, "mouseup", (e: MouseEvent) => {
        e.preventDefault();
        document.removeEventListener("mousemove", moveHandler);
    });

    evproxy.on(currImage.value, "load", function () {
        if (!currImage.value) return;

        naturalSize.value = {
            width: currImage.value.naturalWidth,
            height: currImage.value.naturalHeight,
        };

        (() => {
            const availableW = window.innerWidth - UI_RESERVED_WIDTH;
            const availableH = window.innerHeight - UI_RESERVED_HEIGHT;

            if (currImage.value.naturalHeight < availableH &&
                currImage.value.naturalWidth < availableW) {
                scale.value = 1;
                return;
            }

            scale.value = Math.min(
                availableW / currImage.value.naturalWidth,
                availableH / currImage.value.naturalHeight,
            );
        })();

        syncImagePosition();

        loading.value = false;
        // 下一帧再启用过渡，避免首次加载时 width/height 从 0 动画放大
        nextTick(() => {
            currImage.value?.classList.remove("changing");
        });
    });

    evproxy.on(currImage.value, "transitionend", function () {
        if (Math.abs(deg.value) >= 360) {
            currImage.value?.classList.add("changing");
            deg.value = Math.abs(deg.value) % 360;
            currImage.value?.offsetHeight; // force reflow
            currImage.value?.classList.remove("changing");
        }
    });

    thumbLazyloadObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                (entry.target as HTMLImageElement).src = (entry.target as HTMLImageElement).dataset.lazyload ?? "";
                thumbLazyloadObserver.unobserve(entry.target);
            }
        });
    });

    if (bottomPanel.value) {
        dom("img", bottomPanel.value, []).forEach((img) => {
            thumbLazyloadObserver.observe(img);
        });
    }

    syncScrollBar();

    evproxy.on(bottomContainerRef.value, "scroll", syncScrollBar, { passive: true });

    evproxy.on(bottomPanel.value, "wheel", (e: WheelEvent) => {
        e.stopPropagation();
        if (!bottomContainerRef.value) return;

        if (e.deltaX === 0 && e.deltaY !== 0) {
            bottomContainerRef.value.scrollBy({
                left: e.deltaY,
            });
        } else if (e.deltaX !== 0 && e.deltaY === 0) {
            bottomContainerRef.value.scrollBy({
                left: e.deltaX,
            });
        }
    }, { passive: false });

    function moveHandler(e: MouseEvent) {
        if (!currImage.value) return;
        imageLeft.value = e.clientX - offsetX;
        imageTop.value = e.clientY - offsetY;
    }

    // 兜底：首张图若已在缓存中，load 事件可能早于监听绑定触发，主动同步一次
    if (currImage.value?.complete && currImage.value.naturalHeight > 0) {
        currImage.value.dispatchEvent(new Event("load"));
    }
});

onUnmounted(function () {
    evproxy.release();
    thumbLazyloadObserver.disconnect();
    if (imageTransitionTimer) {
        clearTimeout(imageTransitionTimer);
    }
});

watch(curr, function () {
    loading.value = true;
    currImage.value?.classList.add("changing");
    deg.value = 0;
    disableImageTransition.value = false;
    imageLeft.value = undefined;
    imageTop.value = undefined;
    naturalSize.value = { width: 0, height: 0 };
});

/** 卸载组件 */
function unload() {
    dialog.value?.unload();
}

/** 上一张照片 */
function listBack() {
    if (curr.value > 0) curr.value--;
}

/** 下一张照片 */
function listForward() {
    if (curr.value < imageArray.length - 1) curr.value++;
}

/** 缩放图片 */
function zoomImage(delta: number, anchor = getDefaultZoomAnchor()) {
    if (!currImage.value || !imageContainer.value) return;

    suspendImageTransition();

    const nextScale = Math.min(MAX_SIZE, Math.max(MIN_SIZE, scale.value + delta));
    if (nextScale === scale.value) return;

    const currentMetrics = getImageMetrics();
    if (!anchor) {
        scale.value = nextScale;
        const centeredMetrics = getImageMetrics(nextScale);
        imageLeft.value = centeredMetrics.left;
        imageTop.value = centeredMetrics.top;
        return;
    }

    const containerRect = imageContainer.value.getBoundingClientRect();
    if (!currentMetrics.width || !currentMetrics.height) {
        scale.value = nextScale;
        return;
    }

    const imageLeftPx = containerRect.left + currentMetrics.left;
    const imageTopPx = containerRect.top + currentMetrics.top;
    const anchorX = Math.min(imageLeftPx + currentMetrics.width, Math.max(imageLeftPx, anchor.x));
    const anchorY = Math.min(imageTopPx + currentMetrics.height, Math.max(imageTopPx, anchor.y));
    const zoomRatioX = Math.min(1, Math.max(0, (anchorX - imageLeftPx) / currentMetrics.width));
    const zoomRatioY = Math.min(1, Math.max(0, (anchorY - imageTopPx) / currentMetrics.height));
    const nextWidth = naturalSize.value.width * nextScale;
    const nextHeight = naturalSize.value.height * nextScale;

    scale.value = nextScale;
    imageLeft.value = currentMetrics.left - (nextWidth - currentMetrics.width) * zoomRatioX;
    imageTop.value = currentMetrics.top - (nextHeight - currentMetrics.height) * zoomRatioY;
}

/** 旋转图片 */
function rotateImage(delta: number) {
    deg.value += delta;
}

/** 鼠标滚轮事件 */
function imageWheel(e: WheelEvent) {
    if (!currImage.value) return;
    zoomImage(-e.deltaY / 1000, { x: e.clientX, y: e.clientY });
}

function getDefaultZoomAnchor(): Maybe<ZoomAnchor> {
    const containerRect = imageContainer.value?.getBoundingClientRect();
    if (!containerRect) return undefined;

    const metrics = getImageMetrics();

    return {
        x: containerRect.left + metrics.left + metrics.width / 2,
        y: containerRect.top + metrics.top + metrics.height / 2,
    };
}

function getImageMetrics(scaleOverride = scale.value) {
    const containerRect = imageContainer.value?.getBoundingClientRect();
    const width = naturalSize.value.width * scaleOverride;
    const height = naturalSize.value.height * scaleOverride;
    const centeredLeft = containerRect ? (containerRect.width - width) / 2 : 0;
    const centeredTop = containerRect ? (containerRect.height - height) / 2 : 0;

    return {
        width,
        height,
        left: imageLeft.value ?? centeredLeft,
        top: imageTop.value ?? centeredTop,
    };
}

function syncImagePosition() {
    if (!imageContainer.value) return;

    const metrics = getImageMetrics();
    imageLeft.value = metrics.left;
    imageTop.value = metrics.top;
}

let imageTransitionTimer = 0;
function suspendImageTransition(timeout = 80) {
    disableImageTransition.value = true;
    if (imageTransitionTimer) {
        clearTimeout(imageTransitionTimer);
    }
    imageTransitionTimer = window.setTimeout(() => {
        disableImageTransition.value = false;
    }, timeout);
}

function clickModal(e: MouseEvent) {
    if (e.target === imageContainer.value) {
        unload();
    }
}

/** 同步底部缩略图区域滚动条的宽度与位置（按比例） */
function syncScrollBar() {
    const container = bottomContainerRef.value;
    const bar = scrollBar.value;
    if (!container || !bar) return;

    const ratio = container.clientWidth / container.scrollWidth;
    if (ratio >= 1) {
        bar.style.display = "none";
        return;
    }

    bar.style.display = "";
    bar.style.width = `${ratio * 100}%`;
    const maxScroll = container.scrollWidth - container.clientWidth;
    const progress = maxScroll === 0 ? 0 : container.scrollLeft / maxScroll;
    bar.style.left = `${progress * (100 - ratio * 100)}%`;
}

function onScrollBarMouseDown(e: MouseEvent) {
    const container = bottomContainerRef.value;
    const bar = scrollBar.value;
    const wrapper = bottomPanel.value;
    if (!container || !bar || !wrapper) return;

    e.preventDefault();
    e.stopPropagation();
    isScrollDragging.value = true;
    lockControls.value.bottom = true;

    const wrapperRect = wrapper.getBoundingClientRect();
    const barRect = bar.getBoundingClientRect();
    // 抓取点相对于滚动条左侧的偏移；点击空白处时居中跳到点击位置
    const grabOffset = (e.clientX >= barRect.left && e.clientX <= barRect.right)
        ? e.clientX - barRect.left
        : barRect.width / 2;

    function setScrollFromClientX(clientX: number) {
        if (!container || !bar) return;
        const trackWidth = wrapperRect.width - bar.offsetWidth;
        if (trackWidth <= 0) return;
        const x = Math.min(trackWidth, Math.max(0, clientX - wrapperRect.left - grabOffset));
        const progress = x / trackWidth;
        const maxScroll = container.scrollWidth - container.clientWidth;
        container.scrollLeft = progress * maxScroll;
    }

    setScrollFromClientX(e.clientX);

    const onMove = (ev: MouseEvent) => setScrollFromClientX(ev.clientX);
    const onUp = () => {
        isScrollDragging.value = false;
        lockControls.value.bottom = false;
        showControls.value = verifyPos();
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
}

/**
 * 暂时锁定某个方向的控件，支持直接锁定全部控件
 * @param direction 方向
 * @param timeout 超时时间
 */
function lockControlsTemporarily(
    direction: keyof ControlDirectionMap<any> | "all",
    timeout: number
) {
    if (direction !== "all") {
        lock(direction);
    } else {
        lock("left");
        lock("right");
        lock("top");
        lock("bottom");
    }

    function lock(direction: keyof ControlDirectionMap<any>) {
        lockControls.value[direction] = true;
        if (lastControlTimeout[direction]) {
            clearTimeout(lastControlTimeout[direction]);
        }
        showControls.value[direction] = true;
        lastControlTimeout[direction] = setTimeout(() => {
            lockControls.value[direction] = false;
            showControls.value = verifyPos();
        }, timeout);
    }
}

/**
 * 验证光标位置，返回控件显示状态
 * @param pos 光标位置
 */
function verifyPos(pos = lastMousePos) {
    const distanceToLeft = pos.x;
    const distanceToRight = window.innerWidth - pos.x;
    const distanceToTop = pos.y;
    const distanceToBottom = window.innerHeight - pos.y;
    const calcValue: ControlDirectionMap<boolean> = {
        left: false,
        right: false,
        top: false,
        bottom: false,
    };

    distanceToLeft <= SHOW_CONTROLS_THRESHOLD_X || lockControls.value.left
        ? calcValue.left = true
        : calcValue.left = false;
    distanceToRight <= SHOW_CONTROLS_THRESHOLD_X || lockControls.value.right
        ? calcValue.right = true
        : calcValue.right = false;
    distanceToTop <= SHOW_CONTROLS_THRESHOLD_Y || lockControls.value.top
        ? calcValue.top = true
        : calcValue.top = false;
    distanceToBottom <= SHOW_CONTROLS_THRESHOLD_Y || lockControls.value.bottom
        ? calcValue.bottom = true
        : calcValue.bottom = false;

    return calcValue;
}
</script>

<style lang="scss">
// 全局 keyframes：由 modalStyle 的 animation 引用，必须在 scoped 之外（scoped 会加 hash）
@keyframes kf-viewer-mask-fade {
    from { background-color: transparent; }
}
</style>

<style scoped lang="scss">
$panel-margin: 12px;
$panel-radius: 10px;
$panel-padding: 6px;
$thumb-width: 64px;
$thumb-height: 48px;
$scroll-bar-height: 6px;

.images-viewer {
    position: fixed;
    display: flex;
    width: 100%;
    height: 100%;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    inset: 0;
    transition: var(--default-duration);

    .icon {
        color: var(--light-fore);
    }

    .control-panel {
        @include blur-effect;
        position: absolute;
        display: flex;
        align-items: center;
        padding: $panel-padding;
        border: 1px solid var(--light-border-color);
        border-radius: $panel-radius + 4;
        background-color: var(--trans-default-background);
        box-shadow: 0 0 24px rgb(0 0 0 / 35%);
    }

    .head-controls {
        top: $panel-margin;
        margin-bottom: auto;
        transition: var(--default-duration);

        &.hide {
            box-shadow: none;
            transform: translateY(calc(-100% - $panel-margin)) scale(0.85);
        }

        .head-btn {
            width: 30px;
            height: 30px;
            padding: 0;
            border-radius: $panel-radius - 2;
            background-color: unset;
            box-shadow: none;
            font-size: 15px;

            &:hover {
                background-color: var(--default-background);
                color: var(--tieba-theme-color);
            }
        }

        .close:hover {
            color: var(--error-color);
        }

        .head-sep {
            color: var(--minimal-fore);
            font-family: var(--code-monospace);
            margin: 0 2px;
        }

        .zoom-size {
            padding: 0 8px;
            color: var(--light-fore);
            font-family: var(--code-monospace);
            font-size: 13px;
        }
    }

    .back,
    .forward {
        width: min-content;
        height: 56px;
        box-shadow: 0 0 20px rgb(0 0 0 / 10%);
        font-size: large;
    }

    .back {
        left: $panel-margin * 2;

        &.hide {
            box-shadow: none;
            transform: translateX(calc(-100% - #{$panel-margin * 2})) scale(0.85);
        }
    }

    .forward {
        right: $panel-margin * 2;

        &.hide {
            box-shadow: none;
            transform: translateX(calc(100% + #{$panel-margin * 2})) scale(0.85);
        }
    }

    .back:hover,
    .forward:hover {
        background-color: var(--default-background);
    }

    .back:focus,
    .forward:focus {
        box-shadow: 0 0 0 2px var(--tieba-theme-color);
    }

    .image-container {
        position: relative;
        display: flex;
        width: 100%;
        height: 100%;
        align-items: center;
        justify-content: center;

        .curr-image {
            position: absolute;
            object-fit: contain;
            transition: opacity 0.2s ease;

            &.loading-img {
                opacity: 0;
            }

            &.changing {
                transition: none !important;
            }
        }

        .image-loading-spinner {
            position: absolute;
            width: 48px;
            height: 48px;
            border: 3px solid rgb(255 255 255 / 15%);
            border-top-color: rgb(255 255 255 / 90%);
            border-radius: 50%;
            animation: kf-spin 0.8s linear infinite;
            pointer-events: none;
        }
    }

    @keyframes kf-spin {
        to { transform: rotate(360deg); }
    }

    .bottom-controls-wrapper {
        bottom: $panel-margin;
        max-width: calc(100% - #{$panel-margin * 3});
        padding: 0;
        margin-top: auto;
        overflow-x: hidden;
        transition: var(--default-duration);

        &.hide {
            box-shadow: none;
            transform: translateY(calc(100% + $panel-margin)) scale(0.85);
        }

        &:hover,
        &:focus-within {
            .bottom-panel-scroll-bar {
                opacity: 0.9;
            }
        }

        .bottom-controls-container {
            display: flex;
            overflow: hidden;
            padding: $panel-padding $panel-padding ($panel-padding + $scroll-bar-height + 2);

            img[src=""],
            img:not([src]) {
                opacity: 0;
            }

            .thumb-container {
                display: flex;
                gap: 4px;

                .bottom-btn {
                    overflow: hidden;
                    width: $thumb-width;
                    height: $thumb-height;
                    padding: 0;
                    border: none;
                    border-radius: $panel-radius - 4;
                    background-color: var(--trans-default-background);
                    transition: linear var(--xfast-duration);

                    .image-list {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }
                }

                .bottom-btn.selected {
                    outline: 2px solid var(--tieba-theme-color);
                    outline-offset: -2px;
                }
            }
        }

        .bottom-panel-scroll-bar {
            position: absolute;
            bottom: 3px;
            left: 0;
            width: 100%;
            height: $scroll-bar-height;
            border-radius: $scroll-bar-height * 0.5;
            background-color: var(--light-fore);
            opacity: 0.35;
            cursor: grab;
            transition: opacity var(--default-duration);

            &:hover {
                opacity: 0.9;
            }

            &.dragging {
                cursor: grabbing;
                opacity: 1;
            }
        }
    }
}

// Vercel 主题：去除磨砂，强制深色界面，1px 边框
html.style-vercel .images-viewer {
    --viewer-bg: #0A0A0A;
    --viewer-bg-hover: #1F1F1F;
    --viewer-border: #2A2A2A;
    --viewer-fore: #EDEDED;
    --viewer-light-fore: #A1A1A1;
    --viewer-accent: #FFFFFF;

    .icon {
        color: var(--viewer-light-fore);
    }

    .control-panel {
        backdrop-filter: none;
        border: 1px solid var(--viewer-border);
        background-color: var(--viewer-bg);
        box-shadow: none;
    }

    .head-controls {
        border-radius: 8px;

        &.hide {
            box-shadow: none;
        }

        .head-sep,
        .zoom-size {
            color: var(--viewer-light-fore);
        }

        .head-btn {
            border-radius: 6px;
            color: var(--viewer-light-fore);

            &:hover {
                background-color: var(--viewer-bg-hover);
                color: var(--viewer-fore);
            }
        }

        .close:hover {
            color: var(--error-color);
        }
    }

    .back,
    .forward {
        border-radius: 8px;
        box-shadow: none;
        color: var(--viewer-light-fore);

        &:hover {
            background-color: var(--viewer-bg-hover);
            color: var(--viewer-fore);
        }

        &:focus {
            box-shadow: 0 0 0 1px var(--viewer-accent);
        }
    }

    .bottom-controls-wrapper {
        border-radius: 8px;

        .bottom-controls-container .thumb-container .bottom-btn {
            border-radius: 4px;
            background-color: var(--viewer-bg-hover);
        }

        .bottom-controls-container .thumb-container .bottom-btn.selected {
            outline: 2px solid var(--viewer-accent);
        }

        .bottom-panel-scroll-bar {
            background-color: var(--viewer-light-fore);
        }
    }
}
</style>
