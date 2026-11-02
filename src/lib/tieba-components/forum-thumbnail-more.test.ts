import { describe, expect, it } from "vitest";
import { syncThumbnailMore } from "./forum-thumbnail-more";

function gallery(thumbs: number, label?: string): HTMLElement {
    const root = document.createElement("div");
    root.innerHTML = `<div class="small_list_gallery"><ul class="threadlist_media">${
        "<li><img></li>".repeat(thumbs)
    }</ul>${label === undefined ? "" : `<div class="small_pic_num">${label}</div>`}</div>`;
    return root;
}

const items = (root: HTMLElement) => [...root.querySelectorAll("li")];

describe("syncThumbnailMore", () => {
    it("在最后一张缩略图上标记剩余数量", () => {
        const root = gallery(3, "共&nbsp;9&nbsp;张");
        syncThumbnailMore(root);
        expect(items(root).map(li => li.getAttribute("data-trex-more"))).toEqual([null, null, "+6"]);
    });

    it("总数不超过缩略图数或缺少数量标签时不标记", () => {
        const exact = gallery(3, "共 3 张");
        const missing = gallery(2);
        syncThumbnailMore(exact);
        syncThumbnailMore(missing);
        expect(exact.querySelector("[data-trex-more]")).toBeNull();
        expect(missing.querySelector("[data-trex-more]")).toBeNull();
    });

    it("缩略图数量变化后标记移到新的最后一张", () => {
        const root = gallery(2, "共 5 张");
        syncThumbnailMore(root);
        root.querySelector("ul")!.append(document.createElement("li"));
        syncThumbnailMore(root);
        expect(items(root).map(li => li.getAttribute("data-trex-more"))).toEqual([null, null, "+2"]);
    });
});
