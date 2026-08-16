const PRELOAD_RECORD_LIMIT = 100;
const preloadedUrls = new Set<string>();
const activePreloads = new Map<string, HTMLImageElement>();

export function preloadImageUrl(url: string | undefined, priority: "high" | "low" = "low"): void {
    const normalizedUrl = url?.trim();
    if (!normalizedUrl || preloadedUrls.has(normalizedUrl)) return;

    const image = new Image();
    const finish = () => activePreloads.delete(normalizedUrl);

    image.decoding = "async";
    image.fetchPriority = priority;
    image.addEventListener("load", finish, { once: true });
    image.addEventListener("error", () => {
        preloadedUrls.delete(normalizedUrl);
        finish();
    }, { once: true });

    preloadedUrls.add(normalizedUrl);
    activePreloads.set(normalizedUrl, image);
    image.src = normalizedUrl;

    while (preloadedUrls.size > PRELOAD_RECORD_LIMIT) {
        const oldestUrl = preloadedUrls.values().next().value;
        if (typeof oldestUrl !== "string") break;
        preloadedUrls.delete(oldestUrl);
    }
}

export function preloadUpcomingImages(urls: string[], currentIndex: number, count = 3): void {
    if (!Number.isInteger(currentIndex) || currentIndex < 0 || count <= 0) return;

    urls.slice(currentIndex + 1, currentIndex + 1 + count).forEach(url => preloadImageUrl(url));
}
