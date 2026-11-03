import { CornerDownRight } from "@lucide/vue";
import { currentPageType } from "@/lib/api/remixed";
import { domrd } from "@/lib/elemental";
import { createLucideIconElement } from "@/lib/lucide";
import { threadCommentsObserver } from "@/lib/observers";
import { renderLzlReplyTrees } from "./lzl-reply-tree";

const CHECKED_ATTR = "data-tbr-lzl-reply-target";
let installed = false;

export function installLzlReplyTarget(): void {
    if (installed || currentPageType() !== "thread") return;
    installed = true;
    threadCommentsObserver.addEvent(() => {
        renderLzlReplyTargets();
        renderLzlReplyTrees();
    });
    // 原生「点击查看」只切换 display，不触发 childList；其 handler 返回 false 会阻止冒泡
    document.addEventListener("click", event => {
        if (!(event.target instanceof Element) || !event.target.closest(".j_lzl_m")) return;
        window.setTimeout(() => renderLzlReplyTrees(), 0);
    }, true);
}

export function renderLzlReplyTargets(root: ParentNode = document): void {
    root.querySelectorAll<HTMLElement>(`.lzl_cnt:not([${CHECKED_ATTR}])`).forEach(cnt => {
        cnt.setAttribute(CHECKED_ATTR, "");
        moveReplyTarget(cnt);
    });
}

// 原生结构：<span.lzl_content_main>回复 <a.at>目标</a> :正文</span>
function moveReplyTarget(cnt: HTMLElement): void {
    const author = cnt.querySelector<HTMLElement>(":scope > .at");
    const content = cnt.querySelector<HTMLElement>(":scope > .lzl_content_main");
    if (!author || !content) return;

    const prefix = skipBlank(content.firstChild);
    if (!(prefix instanceof Text) || prefix.data.trim() !== "回复") return;
    const target = skipBlank(prefix.nextSibling);
    if (!(target instanceof HTMLAnchorElement) || !target.classList.contains("at")) return;
    const separator = target.nextSibling;
    if (!(separator instanceof Text) || !/^\s*[:：]/.test(separator.data)) return;

    prefix.remove();
    separator.data = separator.data.replace(/^\s*[:：]\s*/, "");
    if (!separator.data) separator.remove();

    const portrait = target.getAttribute("portrait");
    const post = cnt.closest<HTMLElement>(".lzl_single_post");
    // 「点击查看」展开的回复由另一模板渲染，目标链接没有 portrait，只能按用户名匹配
    const userName = portrait ? "" : readUserName(target);
    const replyTo = portrait || userName;
    if (post && replyTo) post.dataset.tbrReplyTo = replyTo;
    if (!target.getAttribute("href") && replyTo) {
        target.href = portrait
            ? `/home/main?id=${encodeURIComponent(portrait)}&ie=utf-8&fr=pb`
            : `/home/main?un=${encodeURIComponent(userName)}&ie=utf-8&fr=pb`;
    }

    const icon = createLucideIconElement(CornerDownRight, {
        class: "tbr-lzl-reply-target-icon",
        strokeWidth: 2,
    });
    const label = domrd("span", { class: "tbr-lzl-reply-target", title: `回复 ${target.textContent?.trim() ?? ""}` }, [icon, target]);
    author.after(label);
}

// 原生 showattip 悬停时才以链接文字补齐 data-field 和 href，文字本身就是用户名
function readUserName(link: HTMLAnchorElement): string {
    const fromField = link.getAttribute("data-field")?.match(/["']un["']\s*:\s*["']([^"']*)/)?.[1].trim();
    return fromField || link.textContent?.trim() || "";
}

function skipBlank(node: ChildNode | null): ChildNode | null {
    while (node instanceof Text && !node.data.trim()) node = node.nextSibling;
    return node;
}
