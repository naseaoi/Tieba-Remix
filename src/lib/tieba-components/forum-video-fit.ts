import { currentPageType } from "@/lib/api/remixed";
import { forumThreadsObserver } from "@/lib/observers";

let installed = false;
let playObserver: Maybe<IntersectionObserver>;

const BOX_SELECTOR = ".threadlist_video";
const VIDEO_SELECTOR = ".threadlist_video video";
const BOUND_FLAG = "trexVideoFitBound";
const HOVER_BOUND_FLAG = "trexVideoHoverBound";
const OWN_FLAG = "trexVideoOwn";
const HOVERED_ATTR = "data-trex-hovered";
const IN_BAND_ATTR = "data-trex-in-band";
const PAUSED_CLASS = "trex-video-paused";
const BOX_MAX_W = 240;
const BOX_MAX_H = 180;
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

function fitVideoToRatio(video: HTMLVideoElement): void {
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) return;

    const scale = Math.min(BOX_MAX_W / vw, BOX_MAX_H / vh);
    const width = Math.round(vw * scale);
    const height = Math.round(vh * scale);

    video.style.setProperty("width", `${width}px`, "important");
    video.style.setProperty("height", `${height}px`, "important");
    video.style.setProperty("object-fit", "cover", "important");

    const box = video.closest<HTMLElement>(BOX_SELECTOR);
    if (box) {
        box.style.setProperty("width", `${width}px`, "important");
        box.style.setProperty("height", `${height}px`, "important");
        box.style.setProperty("flex", "0 0 auto", "important");
    }
}

function bindVideo(video: HTMLVideoElement): void {
    if (video.dataset[BOUND_FLAG] === "1") return;
    video.dataset[BOUND_FLAG] = "1";

    video.muted = true;

    if (video.videoWidth) fitVideoToRatio(video);
    else video.addEventListener("loadedmetadata", () => fitVideoToRatio(video), { once: true });

    getPlayObserver().observe(video);
}

function syncCover(box: HTMLElement): void {
    const hasVideo = box.querySelector("video") != null;
    const img = box.querySelector<HTMLElement>("img");
    const anchor = box.querySelector<HTMLElement>("a");

    for (const el of [img, anchor]) {
        if (!el) continue;
        if (hasVideo) {
            el.style.setProperty("display", "none", "important");
        } else {
            el.style.removeProperty("display");
            el.style.removeProperty("opacity");
        }
    }

    if (!hasVideo) {
        box.style.removeProperty("width");
        box.style.removeProperty("height");
        box.style.removeProperty("flex");
        box.classList.remove(PAUSED_CLASS);
    }
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
