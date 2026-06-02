import { dom } from "@/lib/elemental";
import { threadCommentsObserver } from "@/lib/observers";

const VIDEO_CODE_REGEXP = /\b(?<id>av[1-9]\d*|BV[1-9A-HJ-NP-Za-km-z]{10})\b/g;

export default {
    id: "portal",
    name: "传送门",
    author: "锯条",
    version: "1.1.2",
    brief: "为贴子中的b站番号添加跳转链接",
    description: `该模块可以识别贴子中的 av/BV 号并将其转换为超链接`,
    scope: ["thread"],
    runAt: "immediately",
    entry: main,
} as UserModule;

function main(): void {
    document.addEventListener("DOMContentLoaded", () => {
        threadCommentsObserver.addEvent(biliPortal);
    });

    function biliPortal() {
        addBiliLinks(".d_post_content");
        addBiliLinks(".lzl_cnt .lzl_content_main");
    }
}

function addBiliLinks(selector: string): void {
    (dom(selector, [])).forEach((elem) => {
        linkVideoCodes(elem);
    });
}

function linkVideoCodes(root: Element): void {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            if (!(node instanceof Text)) return NodeFilter.FILTER_REJECT;
            if (!node.textContent?.trim()) return NodeFilter.FILTER_REJECT;
            if (node.parentElement?.closest("a, script, style, textarea")) {
                return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
        },
    });

    const textNodes: Text[] = [];
    let current = walker.nextNode();
    while (current) {
        if (current instanceof Text) textNodes.push(current);
        current = walker.nextNode();
    }

    textNodes.forEach(textNode => {
        const text = textNode.textContent;
        if (!text) return;

        const matches = Array.from(text.matchAll(VIDEO_CODE_REGEXP));
        if (matches.length === 0) return;

        const fragment = document.createDocumentFragment();
        let lastIndex = 0;
        let replaced = false;

        matches.forEach(match => {
            const index = match.index ?? -1;
            const rawId = match.groups?.id ?? match[0];
            if (index < 0 || isInsideBilibiliVideoUrl(text, index)) return;

            if (index > lastIndex) {
                fragment.appendChild(document.createTextNode(text.slice(lastIndex, index)));
            }

            const normalizedId = rawId.toLowerCase().startsWith("av") ? rawId.toLowerCase() : rawId;
            const link = document.createElement("a");
            link.href = `https://www.bilibili.com/video/${normalizedId}/`;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = rawId;
            fragment.appendChild(link);

            lastIndex = index + rawId.length;
            replaced = true;
        });

        if (!replaced) return;

        if (lastIndex < text.length) {
            fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
        }

        textNode.replaceWith(fragment);
    });
}

function isInsideBilibiliVideoUrl(text: string, index: number): boolean {
    const prefix = text.slice(Math.max(0, index - 40), index).toLowerCase();
    return prefix.endsWith("bilibili.com/video/") || prefix.endsWith("://www.bilibili.com/video/");
}
