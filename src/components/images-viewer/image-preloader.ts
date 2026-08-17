const PRELOAD_RECORD_LIMIT = 100;
const preloadedImages = new Map<string, ImageReadyInfo>();
const activePreloads = new Map<string, Promise<ImageReadyInfo>>();

export interface ImageReadyInfo {
    width: number;
    height: number;
}

export function preloadImageUrl(url: string | undefined, priority: "high" | "low" = "low"): void {
    void ensureImageReady(url, priority).catch(() => undefined);
}

export function ensureImageReady(url: string | undefined, priority: "high" | "low" = "high"): Promise<ImageReadyInfo | undefined> {
    const normalizedUrl = url?.trim();
    if (!normalizedUrl) return Promise.resolve(undefined);

    const preloaded = preloadedImages.get(normalizedUrl);
    if (preloaded) return Promise.resolve(preloaded);

    const activeRequest = activePreloads.get(normalizedUrl);
    if (activeRequest) return activeRequest;

    const request = new Promise<ImageReadyInfo>((resolve, reject) => {
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
                const info = {
                    width: image.naturalWidth,
                    height: image.naturalHeight,
                };
                rememberPreloadedImage(normalizedUrl, info);
                resolve(info);
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

function rememberPreloadedImage(url: string, info: ImageReadyInfo): void {
    preloadedImages.set(url, info);
    while (preloadedImages.size > PRELOAD_RECORD_LIMIT) {
        const oldestUrl = preloadedImages.keys().next().value;
        if (typeof oldestUrl !== "string") break;
        preloadedImages.delete(oldestUrl);
    }
}

export function preloadUpcomingImages(urls: string[], currentIndex: number, count = 3): void {
    if (!Number.isInteger(currentIndex) || currentIndex < 0 || count <= 0) return;

    urls.slice(currentIndex + 1, currentIndex + 1 + count).forEach(url => preloadImageUrl(url));
}
