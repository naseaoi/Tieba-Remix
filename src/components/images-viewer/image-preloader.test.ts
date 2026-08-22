import { afterAll, describe, expect, it, vi } from "vitest";
import { ensureImageReady, preloadImageUrl, preloadUpcomingImages } from "./image-preloader";

describe("image preloader", () => {
    const loadedSources: string[] = [];
    const imageInstances: TestImage[] = [];

    class TestImage extends EventTarget {
        decoding = "auto";
        naturalWidth = 640;
        naturalHeight = 480;

        constructor() {
            super();
            imageInstances.push(this);
        }

        set src(value: string) {
            loadedSources.push(value);
        }
    }

    vi.stubGlobal("Image", TestImage);

    afterAll(() => {
        vi.unstubAllGlobals();
    });

    it("preloads only the next three images and deduplicates warmed URLs", () => {
        const urls = ["current", "next-1", "next-2", "next-3", "next-4"];

        preloadUpcomingImages(urls, 0);
        preloadUpcomingImages(urls, 0);
        preloadImageUrl("next-2");

        expect(loadedSources).toEqual(["next-1", "next-2", "next-3"]);
    });

    it("waits for the image load before resolving", async () => {
        const request = ensureImageReady("ready-url");
        let settled = false;
        void request.then(() => {
            settled = true;
        });

        await Promise.resolve();
        expect(settled).toBe(false);

        imageInstances.at(-1)?.dispatchEvent(new Event("load"));
        await expect(request).resolves.toEqual({ width: 640, height: 480 });
        expect(settled).toBe(true);
    });
});
