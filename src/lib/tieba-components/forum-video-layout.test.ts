import { describe, expect, it } from "vitest";
import { constrainForumVideoPreviewSize } from "./forum-video-layout";

describe("constrainForumVideoPreviewSize", () => {
    it("keeps an existing preview footprint unchanged", () => {
        expect(constrainForumVideoPreviewSize(240, 135)).toEqual({ width: 240, height: 135 });
    });

    it("scales oversized previews without changing their ratio", () => {
        expect(constrainForumVideoPreviewSize(480, 270)).toEqual({ width: 240, height: 135 });
        expect(constrainForumVideoPreviewSize(1080, 1920)).toEqual({ width: 101, height: 180 });
    });

    it("rejects invalid dimensions", () => {
        expect(constrainForumVideoPreviewSize(0, 135)).toBeUndefined();
        expect(constrainForumVideoPreviewSize(Number.NaN, 135)).toBeUndefined();
    });
});
