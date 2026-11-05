import { describe, expect, it } from "vitest";
import { linkVideoCodes } from "./index";

function render(html: string): HTMLDivElement {
    const root = document.createElement("div");
    root.innerHTML = html;
    linkVideoCodes(root);
    return root;
}

describe("linkVideoCodes", () => {
    it("links a BV id surrounded by whitespace", () => {
        const root = render("                    BV1wtdgBgErC");
        const link = root.querySelector("a");
        expect(link?.href).toBe("https://www.bilibili.com/video/BV1wtdgBgErC/");
        expect(link?.textContent).toBe("BV1wtdgBgErC");
    });

    it("links a BV id directly following CJK text", () => {
        const root = render("测试BV1wtdgBgErC");
        expect(root.querySelector("a")?.textContent).toBe("BV1wtdgBgErC");
        expect(root.textContent).toBe("测试BV1wtdgBgErC");
    });

    it("normalizes av ids to lowercase", () => {
        const root = render("看 AV170001 这个");
        expect(root.querySelector("a")?.href).toBe("https://www.bilibili.com/video/av170001/");
    });

    it("skips ids already inside links or video urls", () => {
        const root = render('<a href="#">BV1wtdgBgErC</a> https://www.bilibili.com/video/BV1wtdgBgErC');
        expect(root.querySelectorAll("a")).toHaveLength(1);
    });
});
