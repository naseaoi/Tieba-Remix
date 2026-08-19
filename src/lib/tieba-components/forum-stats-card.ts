import { currentPageType } from "@/lib/api/remixed";
import { asyncdom } from "@/lib/elemental";

const INSTALLED_FLAG = "data-trex-forum-stats";

export function installForumStatsCard(): void {
    if (currentPageType() !== "forum") return;
    void Promise.all([
        asyncdom<"div">(".thread_list_bottom .th_footer_bright"),
        asyncdom<"div">(".frs_content_footer_pagelet"),
    ]).then(([footer, host]) => {
        if (footer && host) renderForumStatsCard(footer, host);
    });
}

export function renderForumStatsCard(footer: HTMLElement, host?: HTMLElement): void {
    if (!footer.hasAttribute(INSTALLED_FLAG)) {
        const source = footer.querySelector<HTMLElement>(".th_footer_l");
        const values = [...source?.querySelectorAll<HTMLElement>(".red_text") ?? []]
            .map(element => formatValue(element.textContent));
        if (values.length < 3) return;

        const memberLink = source?.querySelector<HTMLAnchorElement>(".fans_name");
        const title = document.createElement("div");
        title.className = "trex-forum-stats-title";
        title.textContent = "社区概况";

        const list = document.createElement("dl");
        list.className = "trex-forum-stats-list";
        list.append(
            createStat("主题", values[0]),
            createStat("帖子", values[1]),
            createStat(memberLink?.textContent?.trim() || "成员", values[2], memberLink),
        );

        footer.setAttribute(INSTALLED_FLAG, "");
        footer.classList.add("trex-forum-stats");
        footer.replaceChildren(title, list);
    }
    if (host && footer.parentElement !== host) host.append(footer);
}

function createStat(label: string, value: string, sourceLink?: HTMLAnchorElement | null): HTMLDivElement {
    const item = document.createElement("div");
    item.className = "trex-forum-stat";

    const term = document.createElement("dt");
    term.className = "trex-forum-stat-label";
    if (sourceLink) {
        const link = document.createElement("a");
        link.className = "trex-forum-stat-link";
        link.href = sourceLink.href;
        link.target = sourceLink.target || "_blank";
        link.rel = "noopener";
        link.textContent = label;
        term.append(link);
    } else {
        term.textContent = label;
    }

    const detail = document.createElement("dd");
    detail.className = "trex-forum-stat-value";
    detail.textContent = value;
    item.append(term, detail);
    return item;
}

function formatValue(value: string | null): string {
    const digits = value?.replace(/\D/g, "") ?? "";
    const number = Number(digits);
    return digits && Number.isSafeInteger(number)
        ? new Intl.NumberFormat("zh-CN").format(number)
        : value?.trim() || "--";
}
