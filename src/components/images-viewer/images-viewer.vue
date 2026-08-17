<template>
    <UserDialog ref="dialog" v-bind="dialogOpts">
        <div ref="imagesViewer" class="images-viewer" @click="clickModal">
            <div ref="imageContainer" class="image-container dialog-toggle">
                <div v-show="loading" class="image-loading-indicator" role="status" aria-label="图片加载中">
                    <LoaderCircle class="image-loading-spinner" aria-hidden="true" />
                </div>
                <img ref="currImage" class="curr-image"
                    :class="{ 'failed-img': imageFailed, 'loading-img': loading, 'rotating': imageRotationAnimating }"
                    :src="imageArray[curr]" fetchpriority="high" decoding="async"
                    :style="parseCSSRule(imageStyle)">
                <div v-if="imageFailed" class="image-error-state">
                    <ImageOff class="image-error-icon" aria-hidden="true" />
                    <span>图片加载失败</span>
                </div>
            </div>

            <div class="control-panel head-controls"
                :class="{ 'hide': !controlsPinned && !showControls.top }">
                <UserButton class="zoom-in head-btn" title="放大" @click="zoomImage(0.5)">
                    <ZoomIn class="head-control-icon" aria-hidden="true" />
                </UserButton>
                <UserButton class="zoom-out head-btn" title="缩小" @click="zoomImage(-0.5)">
                    <ZoomOut class="head-control-icon" aria-hidden="true" />
                </UserButton>
                <span class="zoom-size">{{ Math.round(scale * 100) + "%" }}</span>
                <span class="head-sep">|</span>
                <UserButton class="turn-left head-btn" title="逆时针旋转" @click="rotateImage(-90)">
                    <RotateCcw class="head-control-icon" aria-hidden="true" />
                </UserButton>
                <UserButton class="turn-right head-btn" title="顺时针旋转" @click="rotateImage(90)">
                    <RotateCw class="head-control-icon" aria-hidden="true" />
                </UserButton>
                <span class="head-sep">|</span>
                <UserButton class="controls-pin head-btn"
                    :class="{ 'controls-pinned': controlsPinned }"
                    :title="controlsPinTitle" :aria-label="controlsPinTitle"
                    :aria-pressed="controlsPinned" @click="toggleControlsPinned">
                    <PanelTop class="head-control-icon" aria-hidden="true" />
                </UserButton>
                <UserButton class="close head-btn" title="关闭" @click="unload">
                    <X class="head-control-icon" aria-hidden="true" />
                </UserButton>
            </div>

            <UserButton v-if="imageArray.length > 1" class="control-panel back"
                :class="{ 'hide': !controlsPinned && !showControls.left }" title="上一张" @click="listBack">
                <ChevronLeft class="side-control-icon" aria-hidden="true" />
            </UserButton>
            <UserButton v-if="imageArray.length > 1" class="control-panel forward"
                :class="{ 'hide': !controlsPinned && !showControls.right }" title="下一张" @click="listForward">
                <ChevronRight class="side-control-icon" aria-hidden="true" />
            </UserButton>

            <div ref="bottomPanel"
                class="control-panel bottom-controls-wrapper"
                :class="{ 'hide': !controlsPinned && !showControls.bottom }">
                <div ref="bottomContainerRef" class="bottom-controls-container">
                    <div ref="thumbContainer" class="thumb-container">
                        <UserButton v-for="(thumb, index) in thumbArray" class="bottom-btn"
                            :class="{ 'selected': index === curr }" no-border="all">
                            <img class="image-list" alt="" :data-lazyload="thumb" @click="selectImage(index)">
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
import {
    ChevronLeft,
    ChevronRight,
    ImageOff,
    LoaderCircle,
    PanelTop,
    RotateCcw,
    RotateCw,
    X,
    ZoomIn,
    ZoomOut,
} from "@lucide/vue";
import { dom } from "@/lib/elemental";
import { EventProxy } from "@/lib/elemental/event-proxy";
import { CSSRule, parseCSSRule } from "@/lib/elemental/styles";
import { imageViewerControlsPinned, styleTheme } from "@/lib/user-values";
import _ from "@/lib/utils/_";
import { UserButton, UserDialog, UserDialogOpts } from "user-view";
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { notifyImageViewerFailure } from "./image-feedback";
import { ensureImageReady, preloadUpcomingImages } from "./image-preloader";

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
const imageFailed = ref(false);
const imageRotationAnimating = ref(false);
const isScrollDragging = ref(false);
const controlsPinned = ref(imageViewerControlsPinned.get());
const controlsPinTitle = computed(() => controlsPinned.value ? "关闭界面常驻" : "开启界面常驻");

const imageStyle = computed<CSSRule>(() => {
    const w = naturalSize.value.width * scale.value;
    const h = naturalSize.value.height * scale.value;
    return {
        width: w ? `${w}px` : undefined,
        height: h ? `${h}px` : undefined,
        transform: `rotate(${deg.value}deg)`,
        left: imageLeft.value === undefined ? undefined : `${imageLeft.value}px`,
        top: imageTop.value === undefined ? undefined : `${imageTop.value}px`,
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
let thumbLazyloadObserver: IntersectionObserver | undefined;
let imageMoveHandler: ((event: MouseEvent) => void) | undefined;
let scrollDragCleanup: (() => void) | undefined;
let navigationRequestId = 0;
let viewerActive = true;

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
        if (imageMoveHandler) document.addEventListener("mousemove", imageMoveHandler);
    });

    evproxy.on(document, "mouseup", (e: MouseEvent) => {
        e.preventDefault();
        stopImageDragging();
    });

    evproxy.on(currImage.value, "load", handleCurrentImageLoad);

    evproxy.on(currImage.value, "error", handleCurrentImageError);

    evproxy.on(currImage.value, "transitionend", function (event: TransitionEvent) {
        if (event.propertyName !== "transform") return;
        imageRotationAnimating.value = false;
        if (Math.abs(deg.value) >= 360) {
            deg.value = Math.abs(deg.value) % 360;
        }
    });

    thumbLazyloadObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                (entry.target as HTMLImageElement).src = (entry.target as HTMLImageElement).dataset.lazyload ?? "";
                thumbLazyloadObserver?.unobserve(entry.target);
            }
        });
    });

    if (bottomPanel.value) {
        dom("img", bottomPanel.value, []).forEach((img) => {
            thumbLazyloadObserver?.observe(img);
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

    imageMoveHandler = (e: MouseEvent) => {
        if (!currImage.value) return;
        imageLeft.value = e.clientX - offsetX;
        imageTop.value = e.clientY - offsetY;
    };

    // 兜底：首张图若已在缓存中，load 事件可能早于监听绑定触发，主动同步一次
    if (currImage.value?.complete && currImage.value.naturalHeight > 0) {
        handleCurrentImageLoad();
    }
});

onUnmounted(function () {
    viewerActive = false;
    navigationRequestId++;
    evproxy.release();
    thumbLazyloadObserver?.disconnect();
    stopImageDragging();
    scrollDragCleanup?.();
    Object.values(lastControlTimeout).forEach(timer => clearTimeout(timer));
});

function stopImageDragging() {
    if (imageMoveHandler) document.removeEventListener("mousemove", imageMoveHandler);
}

watch(curr, async function () {
    loading.value = true;
    imageFailed.value = false;
    imageRotationAnimating.value = false;

    await nextTick();
    if (currImage.value?.complete && currImage.value.naturalHeight > 0) handleCurrentImageLoad();
});

/** 卸载组件 */
function unload() {
    dialog.value?.unload();
}

/** 上一张照片 */
function listBack() {
    if (curr.value > 0) void selectImage(curr.value - 1);
}

/** 下一张照片 */
function listForward() {
    if (curr.value < imageArray.length - 1) void selectImage(curr.value + 1);
}

async function selectImage(index: number): Promise<void> {
    if (!Number.isInteger(index) || index < 0 || index >= imageArray.length || index === curr.value) return;

    const requestId = ++navigationRequestId;
    loading.value = true;
    imageFailed.value = false;

    try {
        const ready = await ensureImageReady(imageArray[index], "high");
        if (!ready || ready.width <= 0 || ready.height <= 0) throw new Error("invalid image dimensions");

        if (!viewerActive || requestId !== navigationRequestId) return;
        applyInitialImageLayout(ready.width, ready.height);
    } catch {
        if (viewerActive && requestId === navigationRequestId) {
            loading.value = false;
            notifyImageViewerFailure("resource");
        }
        return;
    }

    if (!viewerActive || requestId !== navigationRequestId) return;
    curr.value = index;
}

function handleCurrentImageLoad(): void {
    const image = currImage.value;
    if (!image || image.getAttribute("src") !== imageArray[curr.value]) return;

    imageFailed.value = false;
    applyInitialImageLayout(image.naturalWidth, image.naturalHeight);
    loading.value = false;
    preloadUpcomingImages(imageArray, curr.value);
}

function handleCurrentImageError(): void {
    const image = currImage.value;
    if (!image || image.getAttribute("src") !== imageArray[curr.value]) return;

    loading.value = false;
    imageFailed.value = true;
    imageRotationAnimating.value = false;
    naturalSize.value = { width: 0, height: 0 };
    notifyImageViewerFailure("resource");
}

function applyInitialImageLayout(width: number, height: number): void {
    imageRotationAnimating.value = false;
    deg.value = 0;
    imageLeft.value = undefined;
    imageTop.value = undefined;
    naturalSize.value = { width, height };

    const availableW = window.innerWidth - UI_RESERVED_WIDTH;
    const availableH = window.innerHeight - UI_RESERVED_HEIGHT;
    scale.value = height < availableH && width < availableW
        ? 1
        : Math.min(availableW / width, availableH / height);
    syncImagePosition();
}

/** 缩放图片 */
function zoomImage(delta: number, anchor = getDefaultZoomAnchor()) {
    if (!currImage.value || !imageContainer.value) return;

    imageRotationAnimating.value = false;

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
    imageRotationAnimating.value = true;
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

function clickModal(e: MouseEvent) {
    if (e.target === imageContainer.value) {
        unload();
    }
}

function toggleControlsPinned() {
    controlsPinned.value = !controlsPinned.value;
    imageViewerControlsPinned.set(controlsPinned.value);
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
    scrollDragCleanup?.();
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
        scrollDragCleanup?.();
        isScrollDragging.value = false;
        lockControls.value.bottom = false;
        showControls.value = verifyPos();
    };
    scrollDragCleanup = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        scrollDragCleanup = undefined;
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
    direction: keyof ControlDirectionMap<unknown> | "all",
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

    function lock(direction: keyof ControlDirectionMap<unknown>) {
        lockControls.value[direction] = true;
        if (lastControlTimeout[direction]) {
            clearTimeout(lastControlTimeout[direction]);
        }
        showControls.value[direction] = true;
        lastControlTimeout[direction] = window.setTimeout(() => {
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
            display: flex;
            width: 30px;
            height: 30px;
            align-items: center;
            justify-content: center;
            padding: 0;
            border-radius: $panel-radius - 2;
            background-color: unset;
            box-shadow: none;
            color: var(--light-fore);

            &:hover {
                background-color: var(--default-background);
                color: var(--tieba-theme-color);
            }
        }

        .head-control-icon {
            width: 15px;
            height: 15px;
            stroke-width: 1.75;
        }

        .controls-pin.controls-pinned {
            color: var(--tieba-theme-color);
        }

        .close:hover {
            color: var(--error-color);
        }

        .head-sep {
            margin: 0 2px;
            color: var(--minimal-fore);
            font-family: var(--code-monospace);
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
        display: flex;
        width: min-content;
        height: 56px;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 20px rgb(0 0 0 / 10%);
        color: var(--light-fore);

        .side-control-icon {
            width: 20px;
            height: 20px;
            stroke-width: 1.75;
        }
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
            transition: none;

            &.rotating {
                transition: transform 0.4s ease;
            }

            &.failed-img {
                opacity: 0;
            }

            &.loading-img {
                visibility: hidden;
            }
        }

        .image-loading-indicator {
            position: absolute;
            z-index: 2;
            display: flex;
            width: 56px;
            height: 56px;
            align-items: center;
            justify-content: center;
            border: 1px solid rgb(255 255 255 / 28%);
            border-radius: 8px;
            background-color: rgb(0 0 0 / 76%);
            box-shadow:
                0 0 0 1px rgb(0 0 0 / 40%),
                0 8px 24px rgb(0 0 0 / 45%);
            color: #fff;
            opacity: 0;
            animation: kf-viewer-spinner-appear 0.15s ease 0.2s forwards;
            backdrop-filter: blur(6px);
            pointer-events: none;

            .image-loading-spinner {
                width: 28px;
                height: 28px;
                animation: kf-spin 0.8s linear infinite;
                stroke-width: 1.75;
            }
        }

        .image-error-state {
            position: absolute;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: var(--light-fore);
            font-size: 14px;
            gap: 8px;
            pointer-events: none;

            .image-error-icon {
                width: 42px;
                height: 42px;
                stroke-width: 1.5;
            }
        }
    }

    @keyframes kf-spin {
        to { transform: rotate(360deg); }
    }

    @keyframes kf-viewer-spinner-appear {
        to { opacity: 1; }
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
            cursor: grab;
            opacity: 0.35;
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
    --viewer-accent: #FFF;

    .control-panel {
        border: 1px solid var(--viewer-border);
        backdrop-filter: none;
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

        .controls-pin.controls-pinned,
        .controls-pin.controls-pinned:hover {
            color: var(--tieba-theme-color);
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
