import { afterAll, describe, expect, it, vi } from "vitest";
import { preloadImageUrl, preloadUpcomingImages } from "./image-preloader";

describe("image preloader", () => {
    const loadedSources: string[] = [];

    class TestImage extends EventTarget {
        decoding = "auto";

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
});
