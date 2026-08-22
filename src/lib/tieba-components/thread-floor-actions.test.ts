import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/remixed", () => ({
    currentPageType: () => "thread",
}));

vi.mock("@/modules/shield/shield", () => ({
    shieldList: {
        get: () => [],
        set: vi.fn(),
    },
}));

describe("legacy thread floor metadata", () => {
    beforeAll(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 7, 12, 12));
    });

    it("uses the same metadata and action presentation as modern floors", async () => {
        document.body.innerHTML = `
            <div id="j_p_postlist">
                <div class="l_post">
                    <a class="p_author_name">测试用户</a>
                    <div class="core_reply_tail">
                        <div class="j_lzl_r p_reply">
                            <a class="lzl_link_unfold">回复</a>
                            <span class="lzl_link_fold" style="display:none">收起回复</span>
                        </div>
                        <ul class="p_tail">
                            <li><span>7楼</span></li>
                            <li><span>2026-08-12 08:00</span></li>
                        </ul>
                        <ul class="p_mtail">
                            <li class="j_jb_ele complaint"></li>
                            <li>
                                <span class="p_tail_txt">来自</span>
                                <a class="p_tail_wap">iPhone客户端</a>
                            </li>
                        </ul>
                        <div class="ip-location"><span>IP属地:广东</span></div>
                    </div>
                    <div class="lzl_content_reply">
                        <span class="tbr-lzl-source" data-tbr-platform="mobile" title="移动端">移动端</span>
                    </div>
                </div>
            </div>
        `;

        const { installThreadFloorTag } = await import("./thread-floor-tag");
        const { installThreadFloorActions } = await import("./thread-floor-actions");
        installThreadFloorTag();
        installThreadFloorActions();

        const tail = document.querySelector<HTMLElement>(".core_reply_tail");
        const floor = tail?.querySelector<HTMLElement>(".p_tail li:first-child span");
        const time = tail?.querySelector<HTMLElement>(".p_tail li:last-child span");
        const platform = tail?.querySelector<HTMLElement>(".p_tail_wap");
        const menu = tail?.querySelector<HTMLElement>(".tbr-floor-menu");
        const reply = tail?.querySelector<HTMLElement>(".lzl_link_unfold");
        const collapseReply = tail?.querySelector<HTMLElement>(".lzl_link_fold");
        const subPostPlatform = document.querySelector<HTMLElement>(".tbr-lzl-source");

        expect(floor?.dataset.floorNum).toBe("7");
        expect(time?.textContent).toBe("今天 08:00");
        expect(tail?.querySelector(".ip-location")?.textContent).toBe("广东");
        expect(platform?.dataset.tbrPlatform).toBe("mobile");
        expect(platform?.title).toBe("iPhone客户端");
        expect(platform?.querySelector("svg.lucide-smartphone")).not.toBeNull();
        expect(subPostPlatform?.querySelector("svg.lucide-smartphone")).not.toBeNull();
        expect(menu?.parentElement).toBe(tail);
        expect(menu?.getAttribute("aria-label")).toBe("更多操作");
        expect(reply?.querySelector("svg.lucide-message-square")).not.toBeNull();
        expect(reply?.getAttribute("aria-label")).toBe("回复");
        expect(collapseReply?.querySelector("svg.lucide-message-square")).not.toBeNull();
        expect(collapseReply?.getAttribute("aria-label")).toBe("收起回复");

        menu?.click();
        expect(document.querySelector(".tbr-floor-menu-popup")?.textContent).toBe("举报拉黑");
    });
});
