import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/remixed", () => ({
    currentPageType: () => "forum",
}));

describe("forum aside collapse", () => {
    it("collapses native regions and novel ranking by default", async () => {
        document.documentElement.classList.add("style-vercel");
        document.body.innerHTML = `
            <aside class="aside">
                <section class="aside_region">
                    <h2 class="region_header">本吧信息</h2>
                    <div class="region_cnt">信息内容</div>
                </section>
                <section id="novel-ranking">
                    <div class="novel-ranking-last-area"></div>
                    <div class="novel-ranking-frs-body">
                        <div class="novel-ranking-frs-title">百度小说人气榜</div>
                        <div class="j-novel-rank-area">榜单内容</div>
                    </div>
                </section>
            </aside>
        `;

        const { installForumAsideCollapse } = await import("./forum-aside-collapse");
        installForumAsideCollapse();

        const nativeRegion = document.querySelector<HTMLElement>(".aside_region");
        const novelRanking = document.querySelector<HTMLElement>("#novel-ranking");
        const novelTitle = novelRanking?.querySelector<HTMLElement>(".novel-ranking-frs-title");

        expect(nativeRegion?.dataset.collapsed).toBe("true");
        expect(novelRanking?.dataset.collapsed).toBe("true");
        expect(novelTitle?.getAttribute("aria-expanded")).toBe("false");
        expect(novelTitle?.tabIndex).toBe(0);

        novelTitle?.click();
        expect(novelRanking?.hasAttribute("data-collapsed")).toBe(false);
        expect(novelTitle?.getAttribute("aria-expanded")).toBe("true");

        novelTitle?.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
        expect(novelRanking?.hasAttribute("data-collapsed")).toBe(true);
        expect(novelTitle?.getAttribute("aria-expanded")).toBe("false");
    });
});
