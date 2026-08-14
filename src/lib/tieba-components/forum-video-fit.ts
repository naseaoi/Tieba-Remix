import { currentPageType } from "@/lib/api/remixed";
import { forumThreadsObserver } from "@/lib/observers";
import { constrainForumVideoPreviewSize } from "./forum-video-layout";

let installed = false;
let playObserver: Maybe<IntersectionObserver>;

const BOX_SELECTOR = ".threadlist_video";
const VIDEO_SELECTOR = ".threadlist_video video";
const BOUND_FLAG = "trexVideoFitBound";
const HOVER_BOUND_FLAG = "trexVideoHoverBound";
const OWN_FLAG = "trexVideoOwn";
const HOVERED_ATTR = "data-trex-hovered";
const IN_BAND_ATTR = "data-trex-in-band";
const SIZE_LOCKED_ATTR = "data-trex-video-size-locked";
const READY_ATTR = "data-trex-video-ready";
const PAUSED_CLASS = "trex-video-paused";
const VIEWPORT_BAND = "-40% 0px -40% 0px";

function getPlayObserver(): IntersectionObserver {
    if (playObserver) return playObserver;
    playObserver = new IntersectionObserver(entries => {
        for (const entry of entries) {
            const box = (entry.target as HTMLElement).closest<HTMLElement>(BOX_SELECTOR);
            if (!box) continue;
            box.toggleAttribute(IN_BAND_ATTR, entry.isIntersecting);
            syncPlayback(box);
        }
    }, { rootMargin: VIEWPORT_BAND, threshold: 0 });
    return playObserver;
}

function syncPlayback(box: HTMLElement): void {
    const video = box.querySelector("video");
    if (!video) return;

    const shouldPlay = box.hasAttribute(HOVERED_ATTR) || box.hasAttribute(IN_BAND_ATTR);
    if (shouldPlay) {
        const playing = video.play();
        if (playing && typeof playing.catch === "function") playing.catch(() => undefined);
    } else {
        video.pause();
    }
    box.classList.toggle(PAUSED_CLASS, !shouldPlay);
}

function resolvePreviewSize(box: HTMLElement) {
    const rect = box.getBoundingClientRect();
    const renderedSize = constrainForumVideoPreviewSize(rect.width, rect.height);
    if (renderedSize) return renderedSize;

    const image = box.querySelector<HTMLImageElement>("img");
    return constrainForumVideoPreviewSize(image?.naturalWidth ?? 0, image?.naturalHeight ?? 0);
}

function lockPreviewSize(box: HTMLElement): void {
    if (box.hasAttribute(SIZE_LOCKED_ATTR)) return;

    const size = resolvePreviewSize(box);
    if (!size) return;

    box.style.setProperty("width", `${size.width}px`, "important");
    box.style.setProperty("height", `${size.height}px`, "important");
    box.style.setProperty("flex", "0 0 auto", "important");
    box.toggleAttribute(SIZE_LOCKED_ATTR, true);
}

function syncVideoReady(video: HTMLVideoElement): void {
    const box = video.closest<HTMLElement>(BOX_SELECTOR);
    if (!box) return;
    box.toggleAttribute(READY_ATTR, video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA);
}

function bindVideo(video: HTMLVideoElement): void {
    if (video.dataset[BOUND_FLAG] === "1") return;
    video.dataset[BOUND_FLAG] = "1";

    video.muted = true;
    const box = video.closest<HTMLElement>(BOX_SELECTOR);
    if (box) lockPreviewSize(box);

    syncVideoReady(video);
    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        video.addEventListener("loadeddata", () => syncVideoReady(video), { once: true });
    }

    getPlayObserver().observe(video);
}

function syncCover(box: HTMLElement): void {
    const hasVideo = box.querySelector("video") != null;
    const img = box.querySelector<HTMLElement>("img");
    const anchor = box.querySelector<HTMLElement>("a");

    for (const el of [img, anchor]) {
        if (!el) continue;
        el.style.removeProperty("display");
        el.style.removeProperty("opacity");
    }

    if (hasVideo) {
        lockPreviewSize(box);
        return;
    }

    box.style.removeProperty("width");
    box.style.removeProperty("height");
    box.style.removeProperty("flex");
    box.removeAttribute(SIZE_LOCKED_ATTR);
    box.removeAttribute(READY_ATTR);
    box.classList.remove(PAUSED_CLASS);
}

function createHoverVideo(box: HTMLElement): void {
    const anchor = box.querySelector<HTMLAnchorElement>("a[data-video]");
    const src = anchor?.dataset.video;
    if (!anchor || !src) return;

    const video = document.createElement("video");
    video.src = src;
    video.muted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    video.dataset[OWN_FLAG] = "1";

    lockPreviewSize(box);
    box.appendChild(video);
    syncCover(box);
    bindVideo(video);
}

function bindHover(box: HTMLElement): void {
    if (box.dataset[HOVER_BOUND_FLAG] === "1") return;
    box.dataset[HOVER_BOUND_FLAG] = "1";

    const item = box.closest<HTMLElement>(".j_thread_list") ?? box;
    item.addEventListener("mouseenter", () => {
        box.toggleAttribute(HOVERED_ATTR, true);
        if (!box.querySelector("video")) createHoverVideo(box);
        syncPlayback(box);
    });
    item.addEventListener("mouseleave", () => {
        box.toggleAttribute(HOVERED_ATTR, false);
        syncPlayback(box);
    });
}

function dedupeVideos(box: HTMLElement): void {
    const videos = box.querySelectorAll<HTMLVideoElement>("video");
    if (videos.length < 2) return;

    videos.forEach(video => {
        if (video.dataset[OWN_FLAG] !== "1") return;
        playObserver?.unobserve(video);
        video.remove();
    });
    syncPlayback(box);
}

function process(): void {
    document.querySelectorAll<HTMLElement>(BOX_SELECTOR).forEach(box => {
        dedupeVideos(box);
        bindHover(box);
        syncCover(box);
    });
    document.querySelectorAll<HTMLVideoElement>(VIDEO_SELECTOR).forEach(bindVideo);
}

export function installForumVideoFit(): void {
    if (installed) return;
    if (currentPageType() !== "forum") return;
    installed = true;

    forumThreadsObserver.addEvent(process);
    process();
}
