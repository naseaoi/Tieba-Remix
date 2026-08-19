import { beforeEach, describe, expect, it } from "vitest";
import { renderForumStatsCard } from "./forum-stats-card";

describe("forum stats card", () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div class="th_footer_bright">
                <div class="th_footer_l">
                    共有主题数 <span class="red_text">2011902</span> 个，
                    帖子数 <span class="red_text">91673110</span> 篇
                    <a class="fans_name" href="https://tieba.baidu.com/bawu2/platform/listMemberInfo?word=test">博士</a>
                    数 <span class="red_text">2007252</span>
                </div>
            </div>
        `;
    });

    it("renders formatted statistics and preserves the member link", () => {
        const footer = document.querySelector<HTMLElement>(".th_footer_bright")!;
        const host = document.createElement("div");
        host.className = "frs_content_footer_pagelet";
        document.body.append(host);

        renderForumStatsCard(footer, host);

        expect(footer.parentElement).toBe(host);
        expect(footer.classList.contains("trex-forum-stats")).toBe(true);
        expect(footer.querySelector(".trex-forum-stats-title")?.textContent).toBe("社区概况");
        expect([...footer.querySelectorAll(".trex-forum-stat-label")].map(element => element.textContent))
            .toEqual(["主题", "帖子", "博士"]);
        expect([...footer.querySelectorAll(".trex-forum-stat-value")].map(element => element.textContent))
            .toEqual(["2,011,902", "91,673,110", "2,007,252"]);

        const link = footer.querySelector<HTMLAnchorElement>(".trex-forum-stat-link")!;
        expect(link.href).toBe("https://tieba.baidu.com/bawu2/platform/listMemberInfo?word=test");
        expect(link.target).toBe("_blank");
        expect(link.rel).toBe("noopener");
    });

    it("does not duplicate an already rendered card", () => {
        const footer = document.querySelector<HTMLElement>(".th_footer_bright")!;
        const host = document.createElement("div");
        document.body.append(host);

        renderForumStatsCard(footer, host);
        const renderedMarkup = footer.innerHTML;
        renderForumStatsCard(footer, host);

        expect(footer.innerHTML).toBe(renderedMarkup);
        expect(host.children).toHaveLength(1);
        expect(footer.querySelectorAll(".trex-forum-stat")).toHaveLength(3);
    });
});
