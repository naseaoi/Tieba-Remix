import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/remixed", () => ({
    currentPageType: () => "forum",
}));

const suggestions = vi.fn(async (query?: string) => ({
    json: async () => ({
        query_match: {
            search_data: [{ fname: query, fpic: "", member_num: 0, thread_num: 0, forum_desc: `${query}简介` }],
        },
    }),
}));

vi.mock("@/lib/api/tieba", () => ({
    tiebaAPI: { suggestions: (query?: string) => suggestions(query) },
}));

describe("forum aside layout", () => {
    beforeEach(() => {
        vi.resetModules();
        vi.stubGlobal("ResizeObserver", class {
            observe(): void { /* jsdom 无布局 */ }
        });
        document.documentElement.classList.add("style-vercel");
        document.documentElement.removeAttribute("data-forum-aside");
        document.body.innerHTML = `
            <div class="card_top_wrap">
                <div class="card_top"><div class="card_info">目录</div></div>
                <div class="card_top_right"><div id="sign_mod"></div></div>
            </div>
            <div class="nav_wrap">
                <ul class="nav_list"><li class="focus"><a href="/f?kw=test">看贴</a></li></ul>
                <form class="search_internal_wrap"></form>
            </div>
            <div class="forum_content">
                <div id="content_wrap" class="main"></div>
                <div class="aside">
                    <div class="aside_region my_tieba">
                        <div class="region_cnt">
                            <div class="my_current_forum">
                                <a class="badge" href="/f/like/level?kw=test" title="本吧头衔13级">
                                    <div class="badge_name">核心干员</div>
                                    <div class="badge_index">13</div>
                                </a>
                                <a class="exp_bar"><div class="exp_bar_current" style="width:50%;"></div>
                                <div class="exp_num"><span>9000</span><span>/18000</span></div></a>
                            </div>
                        </div>
                    </div>
                    <div class="aside_region forum_info">
                        <div class="region_cnt">
                            <ul class="manager_groups">
                                <li><a><span class="media_caption">吧主</span></a><div class="media_bottom"><a href="/home/a">甲</a></div></li>
                                <li><a><span class="media_caption">吧主</span></a><div class="media_bottom"><a href="/home/b">乙</a></div></li>
                            </ul>
                            <p class="forum_info_desc"><span>小吧：</span>小吧主共<em>16</em>人</p>
                            <p class="forum_info_desc"><span>会员：</span><a href="/member">博士</a> 共<em>100</em>人</p>
                        </div>
                    </div>
                    <div class="aside_region zyq_mod_link">
                        <h4 class="region_header">轮回之门 <span class="pull_right"></span></h4>
                        <div class="region_cnt"><a href="/p/1">吧规</a><a href="/p/2">申诉</a></div>
                    </div>
                    <div class="aside_region zyq_mod_friend">
                        <h4 class="region_header">友情贴吧</h4>
                        <div class="region_cnt">
                            <a href="/f?kw=a" title="甲"><img src="https://example.com/a.jpg"></a><a href="/f?kw=a" title="甲">甲</a>
                        </div>
                    </div>
                    <div id="novel-ranking"></div>
                </div>
            </div>
        `;
    });

    async function install(): Promise<void> {
        const { installForumAsideLayout } = await import("./forum-aside-layout");
        installForumAsideLayout();
    }

    it("summarizes forum info and user level into the title card", async () => {
        await install();

        const meta = document.querySelector(".card_top .trex-forum-meta");
        expect(meta?.textContent).toContain("吧主甲乙");
        expect(meta?.textContent).toContain("小吧主共16人");
        expect(meta?.textContent).toContain("会员博士");
        expect(meta?.textContent).not.toContain("100");

        const level = document.querySelector<HTMLAnchorElement>(".card_top_right .trex-forum-level");
        expect(level?.textContent).toContain("Lv.13");
        expect(level?.textContent).toContain("核心干员");
        expect(level?.querySelector<HTMLElement>(".trex-forum-level-bar > span")?.style.width).toBe("50%");
    });

    it("moves moderator links into the links bar", async () => {
        await install();

        const groups = [...document.querySelectorAll(".trex-forum-links-group")];
        expect(groups.map(group => group.querySelector(".trex-forum-links-label")?.textContent)).toEqual(["轮回之门"]);
        expect([...groups[0].querySelectorAll("a")].map(link => link.textContent)).toEqual(["吧规", "申诉"]);
        expect(document.querySelector(".zyq_mod_link")?.hasAttribute("data-trex-relocated")).toBe(true);
        expect(document.querySelector(".trex-forum-links")?.previousElementSibling?.classList.contains("nav_wrap")).toBe(true);
    });

    it("turns friend forums into a nav tab that switches the content view", async () => {
        await install();

        const tab = document.querySelector<HTMLElement>(".nav_list .trex-friend-forums-tab");
        const original = document.querySelector(".nav_list li:first-child");
        expect(tab?.hidden).toBe(false);
        expect(document.querySelector(".zyq_mod_friend")?.hasAttribute("data-trex-relocated")).toBe(true);

        const cards = [...document.querySelectorAll<HTMLAnchorElement>(".trex-friend-forums .trex-friend-forum")];
        expect(cards.map(card => card.querySelector(".trex-friend-forum-name")?.textContent)).toEqual(["甲吧"]);
        expect(cards[0].querySelector("img")?.src).toBe("https://example.com/a.jpg");
        expect(suggestions).not.toHaveBeenCalled();

        tab?.querySelector("a")?.click();
        expect(document.documentElement.getAttribute("data-forum-view")).toBe("friends");
        expect(tab?.classList.contains("focus")).toBe(true);
        expect(original?.classList.contains("focus")).toBe(false);
        await vi.waitFor(() => expect(cards[0].querySelector(".trex-friend-forum-desc")?.textContent).toBe("甲简介"));

        const back = new MouseEvent("click", { bubbles: true, cancelable: true });
        original?.querySelector("a")?.dispatchEvent(back);
        expect(back.defaultPrevented).toBe(true);
        expect(document.documentElement.hasAttribute("data-forum-view")).toBe(false);
        expect(original?.classList.contains("focus")).toBe(true);
    });

    it.each(["Escape", "close button", "backdrop"])("opens the native aside from the title card and closes via %s", async (closeVia) => {
        await install();

        const drawer = document.querySelector<HTMLElement>(".trex-forum-drawer");
        expect(drawer?.querySelector(".aside #novel-ranking")).not.toBeNull();
        expect(document.querySelector(".forum_content .aside")).toBeNull();
        expect(document.documentElement.getAttribute("data-forum-aside")).toBe("drawer");
        expect(drawer?.hidden).toBe(true);
        expect(document.querySelector("[aria-modal]")).toBeNull();

        expect(document.querySelector(".nav_wrap .trex-forum-drawer-toggle")).toBeNull();
        const details = document.querySelector<HTMLButtonElement>(".card_top .trex-forum-meta-more")!;
        const panel = drawer?.querySelector(".trex-forum-drawer-panel");
        const closeButton = drawer?.querySelector<HTMLButtonElement>(".trex-forum-drawer-close");
        expect(details.textContent).toBe("详情");
        expect(details.type).toBe("button");
        expect(panel?.getAttribute("role")).toBe("dialog");
        expect(panel?.getAttribute("aria-label")).toBe("本吧详情");
        expect(closeButton?.getAttribute("aria-label")).toBe("关闭");

        details.focus();
        details.click();
        expect(drawer?.hidden).toBe(false);
        expect(drawer?.dataset.open).toBe("true");
        expect(panel?.getAttribute("aria-modal")).toBe("true");
        expect(document.activeElement).toBe(closeButton);

        if (closeVia === "Escape") {
            document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
        } else if (closeVia === "close button") {
            closeButton?.click();
        } else {
            drawer?.querySelector<HTMLElement>(".trex-forum-drawer-backdrop")?.click();
        }
        expect(drawer?.hasAttribute("data-open")).toBe(false);
        expect(document.querySelector("[aria-modal]")).toBeNull();
        expect(document.activeElement).toBe(details);
        drawer?.dispatchEvent(new Event("transitionend"));
        expect(drawer?.hidden).toBe(true);
    });
});
