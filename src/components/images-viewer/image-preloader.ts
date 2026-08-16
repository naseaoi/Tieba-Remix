const PRELOAD_RECORD_LIMIT = 100;
const preloadedUrls = new Set<string>();
const activePreloads = new Map<string, Promise<void>>();

export function preloadImageUrl(url: string | undefined, priority: "high" | "low" = "low"): void {
    void ensureImageReady(url, priority).catch(() => undefined);
}

export function ensureImageReady(url: string | undefined, priority: "high" | "low" = "high"): Promise<void> {
    const normalizedUrl = url?.trim();
    if (!normalizedUrl || preloadedUrls.has(normalizedUrl)) return Promise.resolve();

    const activeRequest = activePreloads.get(normalizedUrl);
    if (activeRequest) return activeRequest;

    const request = new Promise<void>((resolve, reject) => {
        const image = new Image();
        const cleanup = () => {
            image.removeEventListener("load", onLoad);
            image.removeEventListener("error", onError);
        };
        const onLoad = () => {
            const decodeRequest = typeof image.decode === "function"
                ? image.decode()
                : Promise.resolve();
            void decodeRequest.then(() => {
                cleanup();
                rememberPreloadedUrl(normalizedUrl);
                resolve();
            }, error => {
                cleanup();
                reject(error);
            });
        };
        const onError = () => {
            cleanup();
            reject(new Error("image preload failed"));
        };

        image.decoding = "async";
        image.fetchPriority = priority;
        image.addEventListener("load", onLoad, { once: true });
        image.addEventListener("error", onError, { once: true });
        image.src = normalizedUrl;
    });
    activePreloads.set(normalizedUrl, request);
    request.then(
        () => activePreloads.delete(normalizedUrl),
        () => activePreloads.delete(normalizedUrl),
    );
    return request;
}

function rememberPreloadedUrl(url: string): void {
    preloadedUrls.add(url);
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
