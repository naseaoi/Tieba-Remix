import { currentPageType } from "@/lib/api/remixed";
import { forumThreadsObserver } from "@/lib/observers";

let installed = false;
let playObserver: Maybe<IntersectionObserver>;

const VIDEO_SELECTOR = ".threadlist_video video";
const BOUND_FLAG = "trexVideoFitBound";
const PAUSED_CLASS = "trex-video-paused";
const BOX_MAX_W = 240;
const BOX_MAX_H = 180;
const VIEWPORT_BAND = "-40% 0px -40% 0px";

function getPlayObserver(): IntersectionObserver {
    if (playObserver) return playObserver;
    playObserver = new IntersectionObserver(entries => {
        for (const entry of entries) {
            const video = entry.target as HTMLVideoElement;
            if (entry.isIntersecting) {
                const playing = video.play();
                if (playing && typeof playing.catch === "function") playing.catch(() => undefined);
            } else {
                video.pause();
            }
            video.closest<HTMLElement>(".threadlist_video")?.classList.toggle(PAUSED_CLASS, !entry.isIntersecting);
        }
    }, { rootMargin: VIEWPORT_BAND, threshold: 0 });
    return playObserver;
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

    const box = video.closest<HTMLElement>(".threadlist_video");
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

function process(): void {
    document.querySelectorAll<HTMLVideoElement>(VIDEO_SELECTOR).forEach(bindVideo);
}

export function installForumVideoFit(): void {
    if (installed) return;
    if (currentPageType() !== "forum") return;
    installed = true;

    forumThreadsObserver.addEvent(process);
    process();
}
