import { currentPageType } from "@/lib/api/remixed";
import { threadFloorsObserver } from "@/lib/observers";
import { styleTheme } from "@/lib/user-values";

let installed = false;

const PROCESSED = "vercelImageGridProcessed";
const GRID_CLASS = "vercel-image-grid";

/**
 * 把 .d_post_content 内连续相邻的图片单元（.BDE_Image / .replace_div，中间只夹 <br>/空白）
 * 整组包到 .vercel-image-grid，并删除组内的 <br>，由 vercel 主题 CSS 渲染成 grid 网格。
 * 单张图不包装（避免被 cell 尺寸拉伸失真），仅 vercel 主题生效。
 */
export function installThreadImageGrid(): void {
    if (installed) return;
    if (currentPageType() !== "thread") return;
    if (styleTheme.get() !== "vercel") return;
    installed = true;

    const process = (): void => {
        document.querySelectorAll<HTMLElement>(".d_post_content").forEach(content => {
            if (content.dataset[PROCESSED]) return;

            const units = Array.from(
                content.querySelectorAll<HTMLElement>(":scope > .BDE_Image, :scope > .replace_div")
            );

            if (units.length >= 2) {
                const groups: HTMLElement[][] = [];
                let current: HTMLElement[] = [];

                for (const unit of units) {
                    if (current.length === 0) {
                        current.push(unit);
                        continue;
                    }
                    const prev = current[current.length - 1];
                    if (adjacentByBrOrSpace(prev, unit)) {
                        current.push(unit);
                    } else {
                        if (current.length >= 2) groups.push(current);
                        current = [unit];
                    }
                }
                if (current.length >= 2) groups.push(current);

                for (const group of groups) wrapIntoGrid(group);
            }

            content.dataset[PROCESSED] = "1";
        });
    };

    threadFloorsObserver.addEvent(process);
    process();
}

/** a → b 之间是否只夹着 <br> 与空白文本节点 */
function adjacentByBrOrSpace(a: Element, b: Element): boolean {
    let node: Node | null = a.nextSibling;
    while (node && node !== b) {
        const ok = node.nodeName === "BR"
            || (node.nodeType === Node.TEXT_NODE && (node.textContent ?? "").trim() === "");
        if (!ok) return false;
        node = node.nextSibling;
    }
    return node === b;
}

/** 把一组连续图片单元包到 grid 容器，路径上的 <br> / 空白文本一并丢弃 */
function wrapIntoGrid(group: HTMLElement[]): void {
    const first = group[0];
    const last = group[group.length - 1];
    const parent = first.parentElement;
    if (!parent) return;

    const wrap = document.createElement("div");
    wrap.className = GRID_CLASS;
    parent.insertBefore(wrap, first);

    let cursor: Node | null = first;
    while (cursor) {
        const next: Node | null = cursor.nextSibling;
        const isLast = cursor === last;

        if (cursor.nodeName === "BR"
            || (cursor.nodeType === Node.TEXT_NODE && (cursor.textContent ?? "").trim() === "")) {
            cursor.parentNode?.removeChild(cursor);
        } else {
            wrap.appendChild(cursor);
        }

        if (isLast) break;
        cursor = next;
    }
}
