import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/remixed", () => ({
    currentPageType: () => "forum",
}));

const setting = vi.hoisted(() => ({ enabled: true, listeners: [] as ((value: boolean) => void)[] }));

vi.mock("@/lib/user-values", () => ({
    forumStickyNav: {
        get: () => setting.enabled,
        set: (value: boolean) => {
            setting.enabled = value;
            setting.listeners.forEach(listener => listener(value));
        },
        on: (_event: string, listener: (value: boolean) => void) => { setting.listeners.push(listener); },
    },
}));

describe("forum sticky nav", () => {
    beforeEach(() => {
        vi.resetModules();
        setting.enabled = true;
        setting.listeners = [];
        document.documentElement.classList.add("style-vercel");
        document.documentElement.removeAttribute("data-forum-nav-stuck");
        document.body.innerHTML = `
            <div class="card_top"><img class="card_head_img" src="https://example.com/head.jpg"><a class="card_title_fname"> 测试吧 </a></div>
            <div class="holder"><div class="nav_wrap"><ul class="nav_list"></ul></div></div>
        `;
    });

    async function install(): Promise<void> {
        const { installForumStickyNav } = await import("./forum-sticky-nav");
        installForumStickyNav();
    }

    it("adds the forum brand to the nav", async () => {
        await install();

        const brand = document.querySelector(".nav_wrap .trex-forum-nav-brand");
        expect(brand?.textContent).toBe("测试吧");
        expect(brand?.querySelector("img")?.src).toBe("https://example.com/head.jpg");
    });

    it("pins the nav once it scrolls past the top", async () => {
        let top = 100;
        vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(() => new DOMRect(40, top, 900, 46));
        await install();
        const nav = document.querySelector<HTMLElement>(".nav_wrap")!;
        const placeholder = document.querySelector<HTMLElement>(".trex-forum-nav-placeholder")!;
        expect(placeholder.hidden).toBe(true);
        expect(document.documentElement.hasAttribute("data-forum-nav-stuck")).toBe(false);

        top = -20;
        window.dispatchEvent(new Event("scroll"));
        await vi.waitFor(() => expect(document.documentElement.hasAttribute("data-forum-nav-stuck")).toBe(true));
        expect(placeholder.hidden).toBe(false);
        expect(nav.style.left).toBe("40px");
        expect(nav.style.width).toBe("900px");

        top = 100;
        window.dispatchEvent(new Event("scroll"));
        await vi.waitFor(() => expect(document.documentElement.hasAttribute("data-forum-nav-stuck")).toBe(false));
        expect(placeholder.hidden).toBe(true);
        expect(nav.style.left).toBe("");
        vi.restoreAllMocks();
    });

    it("follows the sticky nav setting", async () => {
        vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(() => new DOMRect(40, -20, 900, 46));
        setting.enabled = false;
        await install();
        const { forumStickyNav } = await import("@/lib/user-values");
        const stuck = () => document.documentElement.hasAttribute("data-forum-nav-stuck");
        expect(stuck()).toBe(false);

        forumStickyNav.set(true);
        await vi.waitFor(() => expect(stuck()).toBe(true));

        forumStickyNav.set(false);
        await vi.waitFor(() => expect(stuck()).toBe(false));
        expect(document.querySelector<HTMLElement>(".trex-forum-nav-placeholder")?.hidden).toBe(true);
        vi.restoreAllMocks();
    });
});
