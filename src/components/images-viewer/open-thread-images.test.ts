import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    cache: {} as Record<number, ThreadPicture[]>,
    getThreadImages: vi.fn(),
}));

vi.mock("@/lib/api/tieba", () => ({
    tiebaAPI: {
        getThreadImages: mocks.getThreadImages,
    },
}));

vi.mock("@/lib/user-values", () => ({
    currentStorage: {
        get: () => mocks.cache,
        set: (_entry: unknown, value: Record<number, ThreadPicture[]>) => {
            mocks.cache = value;
        },
    },
    highQualityImage: {
        get: () => true,
    },
    HOME_FEED_IMAGES: ["home_feed_images", {}],
}));

vi.mock("./viewer", () => ({
    imagesViewer: vi.fn(),
}));

describe("thread image requests", () => {
    beforeEach(() => {
        mocks.cache = {};
        mocks.getThreadImages.mockReset();
    });

    it("shares an in-flight request and then reuses the response cache", async () => {
        let resolveRequest: ((response: { json: () => Promise<unknown> }) => void) | undefined;
        mocks.getThreadImages.mockReturnValue(new Promise(resolve => {
            resolveRequest = resolve;
        }));

        const { fetchThreadImages } = await import("./open-thread-images");
        const firstRequest = fetchThreadImages(123);
        const secondRequest = fetchThreadImages(123);

        expect(mocks.getThreadImages).toHaveBeenCalledTimes(1);

        resolveRequest?.({
            json: async () => ({
                data: {
                    pic_list: {
                        "#1": {
                            img: {
                                original: { id: "picture-id", waterurl: "original-url" },
                                screen: { waterurl: "screen-url" },
                                medium: { url: "thumbnail-url" },
                            },
                            post_id: 456,
                        },
                    },
                },
            }),
        });

        const [firstResult, secondResult] = await Promise.all([firstRequest, secondRequest]);
        const cachedResult = await fetchThreadImages(123);

        expect(firstResult).toEqual([{
            original: "original-url",
            thumbnail: "thumbnail-url",
            pictureId: "picture-id",
            postId: 456,
        }]);
        expect(secondResult).toEqual(firstResult);
        expect(cachedResult).toEqual(firstResult);
        expect(mocks.getThreadImages).toHaveBeenCalledTimes(1);
    });
});
