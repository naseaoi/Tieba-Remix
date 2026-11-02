import { unsafeWindow as importedUnsafeWindow } from "$";
import { Reply, X } from "@lucide/vue";
import { currentPageType } from "@/lib/api/remixed";
import { domrd } from "@/lib/elemental";
import { createLucideIconElement } from "@/lib/lucide";
import { threadCommentsObserver } from "@/lib/observers";

const CONTAINER_SELECTOR = ".lzl_editor_container";
const BODY_SELECTOR = ".editor_lzl_container";
const CHIP_CLASS = "tbr-lzl-reply-chip";
const PATCH_FLAG = "__tbrReplyComposerPatched";

export interface ReplyTarget {
    portrait: string;
    // 原生 encodeURI 后的昵称，html2ubb 用它校验 span 文本未被篡改
    showname: string;
    name: string;
}

interface SimplePosterLike {
    _getHtml?: () => string;
    _se?: {
        $body?: ArrayLike<HTMLElement>;
        setContent?: (content: string) => void;
    };
    [PATCH_FLAG]?: boolean;
}

const chipTargets = new WeakMap<HTMLElement, ReplyTarget>();

let installed = false;

export function installLzlReplyComposer(): void {
    if (installed || currentPageType() !== "thread") return;
    installed = true;
    threadCommentsObserver.addEvent(renderLzlReplyComposers);

    document.addEventListener("click", event => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const entry = target.closest(".j_lzl_p");
        if (!entry) return;
        // 「我也说一句」是对楼层评论，不再沿用上一次的回复对象
        entry.closest(".l_post")?.querySelectorAll<HTMLElement>(`.${CHIP_CLASS}`).forEach(removeChip);
    }, true);

    document.addEventListener("keydown", event => {
        if (event.key !== "Backspace") return;
        const body = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>(BODY_SELECTOR) : null;
        if (!body || !isEditorEmpty(body)) return;
        const chip = body.closest(CONTAINER_SELECTOR)?.querySelector<HTMLElement>(`.${CHIP_CLASS}`);
        if (!chip) return;
        event.preventDefault();
        removeChip(chip);
    }, true);
}

export function renderLzlReplyComposers(root: ParentNode = document): void {
    root.querySelectorAll<HTMLElement>(`${CONTAINER_SELECTOR} ${BODY_SELECTOR}`).forEach(body => {
        const target = extractReplyPrefix(body);
        if (!target) return;
        const container = body.closest<HTMLElement>(CONTAINER_SELECTOR);
        if (!container) return;
        showChip(container, target);
        moveCaretToEnd(body);
        patchPoster();
    });
}

// 原生 _fastReply 写入：回复&nbsp;<span class="ubb_showname" use="reply">昵称</span>&nbsp;:
export function extractReplyPrefix(body: HTMLElement): ReplyTarget | null {
    const prefix = body.firstChild;
    if (!(prefix instanceof Text) || !/^\s*回复\s*$/.test(prefix.data)) return null;
    const span = prefix.nextSibling;
    if (!(span instanceof HTMLSpanElement) || !span.classList.contains("ubb_showname")) return null;
    if (span.getAttribute("use") !== "reply") return null;
    const separator = span.nextSibling;
    if (!(separator instanceof Text) || !/^\s*[:：]/.test(separator.data)) return null;

    const target: ReplyTarget = {
        portrait: span.getAttribute("portrait") ?? "",
        showname: span.getAttribute("showname") ?? "",
        name: span.textContent ?? "",
    };
    prefix.remove();
    span.remove();
    separator.data = separator.data.replace(/^\s*[:：]\s*/, "");
    if (!separator.data) separator.remove();
    return target;
}

export function buildReplyPrefix(target: ReplyTarget): string {
    return `回复 <span class="ubb_showname" portrait="${escapeHTML(target.portrait)}" showname="${escapeHTML(target.showname)}" use="reply">${escapeHTML(target.name)}</span> :`;
}

function showChip(container: HTMLElement, target: ReplyTarget): void {
    container.querySelectorAll<HTMLElement>(`.${CHIP_CLASS}`).forEach(chip => chip.remove());

    const close = domrd("button", {
        class: "tbr-lzl-reply-chip-close",
        type: "button",
        title: "取消回复",
        "aria-label": "取消回复",
    }, [createLucideIconElement(X, { strokeWidth: 2 })]);
    const chip = domrd("div", { class: CHIP_CLASS }, [
        createLucideIconElement(Reply, { class: "tbr-lzl-reply-chip-icon", strokeWidth: 2 }),
        domrd("span", { class: "tbr-lzl-reply-chip-label" }, ["回复"]),
        domrd("span", { class: "tbr-lzl-reply-chip-name", title: target.name }, [target.name]),
        close,
    ]);
    close.addEventListener("click", event => {
        event.preventDefault();
        const body = container.querySelector<HTMLElement>(BODY_SELECTOR);
        removeChip(chip);
        if (body) moveCaretToEnd(body, true);
    });

    chipTargets.set(chip, target);
    container.prepend(chip);
}

function removeChip(chip: HTMLElement): void {
    chipTargets.delete(chip);
    chip.remove();
}

function readChipTarget(container: Element | null | undefined): ReplyTarget | undefined {
    const chip = container?.querySelector<HTMLElement>(`.${CHIP_CLASS}`);
    return chip ? chipTargets.get(chip) : undefined;
}

// 提交时由原生 _getHtml → html2ubb 生成内容，这里在其结果前补回回复前缀
function patchPoster(): void {
    const win = (importedUnsafeWindow ?? window) as unknown as { LzlEditor?: { _s_p?: SimplePosterLike | null } };
    const poster = win.LzlEditor?._s_p;
    if (!poster || poster[PATCH_FLAG] || typeof poster._getHtml !== "function") return;
    poster[PATCH_FLAG] = true;

    const bodyOf = (): HTMLElement | undefined => poster._se?.$body?.[0];
    const originalGetHtml = poster._getHtml;
    poster._getHtml = function (this: SimplePosterLike): string {
        const html = originalGetHtml.call(this);
        const target = readChipTarget(bodyOf()?.closest(CONTAINER_SELECTOR));
        return target ? buildReplyPrefix(target) + html : html;
    };

    const editor = poster._se;
    const originalSetContent = editor?.setContent;
    if (editor && typeof originalSetContent === "function") {
        editor.setContent = function (this: unknown, content: string): void {
            originalSetContent.call(this, content);
            // 原生发表成功后以空内容重置编辑器
            if (content === "") {
                bodyOf()?.closest(CONTAINER_SELECTOR)?.querySelectorAll<HTMLElement>(`.${CHIP_CLASS}`).forEach(removeChip);
            }
        };
    }
}

function isEditorEmpty(body: HTMLElement): boolean {
    return !body.textContent?.replace(/[\s\u200b]/g, "") && !body.querySelector("img");
}

function moveCaretToEnd(body: HTMLElement, focus = false): void {
    if (focus) body.focus();
    else if (document.activeElement !== body && !body.contains(document.activeElement)) return;
    const selection = window.getSelection();
    if (!selection) return;
    const range = document.createRange();
    range.selectNodeContents(body);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
}

function escapeHTML(text: string): string {
    return text.replace(/[&<>"']/g, char => `&#${char.charCodeAt(0)};`);
}
