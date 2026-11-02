import type { UserModuleEx } from "@/ex";
import { dom, domrd } from "@/lib/elemental";
import { TbObserver, forumThreadsObserver, legacyIndexFeedsObserver, threadCommentsObserver, threadFloorsObserver } from "@/lib/observers";

import { markRaw } from "vue";
import moduleShieldVue from "./module.shield.vue";
import { findShieldRule, shieldList } from "./shield";
import type { ShieldRule, ShieldScope } from "./shield";
import "./style.scss";

export default {
    id: "shield",
    name: "贴吧屏蔽",
    author: "锯条",
    version: "1.3",
    brief: "眼不见为净",
    description: `用户自定义屏蔽规则，可分别应用于帖子标题、楼层内容和用户名。支持多范围与正则匹配`,
    scope: true,
    runAt: "immediately",
    settings: {
        "shield-controls": {
            widgets: [{
                type: "component",
                component: markRaw(moduleShieldVue),
            }],
        },
    },
    entry: main,
} as UserModuleEx;

export * from "./shield";

interface ShieldCheck {
    scope: ShieldScope;
    subSelector: string;
}

type ShieldApplier = (elem: HTMLElement, rule: ShieldRule | undefined) => void;

const NOTICE_CLASS = "tbr-shield-notice";
const REVEALED_ATTR = "data-tbr-shield-revealed";
const mainFloorCache = new WeakMap<Element, boolean>();

export function findElementShieldRule(elem: Element, checks: ShieldCheck[], rules: ShieldRule[]): ShieldRule | undefined {
    for (const check of checks) {
        const texts = dom(check.subSelector, elem, []).map(el => el.textContent ?? "");
        const rule = findShieldRule(rules, texts, check.scope);
        if (rule) return rule;
    }
}

function hideElement(elem: HTMLElement, rule: ShieldRule | undefined) {
    elem.style.display = rule ? "none" : "";
}

function shieldByMultiScope(
    observers: TbObserver[],
    parentSelector: string,
    checks: ShieldCheck[],
    apply: ShieldApplier = hideElement,
) {
    const run = () => {
        const rules = shieldList.get();
        dom<"div">(parentSelector, []).forEach(elem => apply(elem, findElementShieldRule(elem, checks, rules)));
    };
    observers.forEach(observer => observer.addEvent(run));
}

function isMainFloor(floor: Element): boolean {
    let cached = mainFloorCache.get(floor);
    if (cached === undefined) {
        try {
            cached = JSON.parse(floor.getAttribute("data-field") ?? "")?.content?.post_no === 1;
        } catch {
            cached = false;
        }
        mainFloorCache.set(floor, cached);
    }
    return cached;
}

// 主楼命中时折叠为提示条而非直接移除，避免帖子“缺少首楼”且无从得知原因
export function applyFloorShield(floor: HTMLElement, rule: ShieldRule | undefined) {
    if (!isMainFloor(floor)) {
        hideElement(floor, rule);
        return;
    }

    const prev = floor.previousElementSibling;
    const notice = prev?.classList.contains(NOTICE_CLASS) ? prev : undefined;
    if (!rule || floor.hasAttribute(REVEALED_ATTR)) {
        notice?.remove();
        floor.style.display = "";
        return;
    }

    floor.style.display = "none";
    const current = notice ?? createFloorNotice(floor);
    const ruleLabel = current.querySelector(`.${NOTICE_CLASS}-rule`);
    // 仅在变化时写入，避免触发子树 observer 形成循环
    if (ruleLabel && ruleLabel.textContent !== rule.content) ruleLabel.textContent = rule.content;
}

function createFloorNotice(floor: HTMLElement): HTMLElement {
    const reveal = domrd("button", { class: `${NOTICE_CLASS}-reveal`, type: "button" }, "仍然显示");
    reveal.addEventListener("click", () => {
        floor.setAttribute(REVEALED_ATTR, "");
        applyFloorShield(floor, undefined);
    });

    const notice = domrd("div", { class: NOTICE_CLASS }, [
        domrd("span", { class: `${NOTICE_CLASS}-icon`, "aria-hidden": "true" }),
        domrd("span", { class: `${NOTICE_CLASS}-text` }, "主楼命中屏蔽规则"),
        domrd("span", { class: `${NOTICE_CLASS}-rule` }),
        reveal,
    ]);
    floor.before(notice);
    return notice;
}

function main() {
    // 看贴页面：楼层内容可能被原地替换，子树变化时也要重新匹配
    shieldByMultiScope([threadFloorsObserver, threadCommentsObserver], ".l_post_bright", [
        { scope: "post-content", subSelector: ".d_post_content" },
        { scope: "username", subSelector: ".p_author_name" },
    ], applyFloorShield);
    shieldByMultiScope([threadCommentsObserver], ".lzl_single_post", [
        { scope: "post-content", subSelector: ".lzl_content_main" },
        { scope: "username", subSelector: ".lzl_cnt .j_user_card" },
    ]);
    // 首页动态
    shieldByMultiScope([legacyIndexFeedsObserver], ".j_feed_li", [
        { scope: "thread-title", subSelector: ".title" },
        { scope: "post-content", subSelector: ".n_txt" },
        { scope: "username", subSelector: ".post_author" },
    ]);
    // 进吧页面
    shieldByMultiScope([forumThreadsObserver], ".j_thread_list", [
        { scope: "thread-title", subSelector: ".threadlist_title a" },
        { scope: "username", subSelector: ".frs-author-name-wrap, .thread-modern-author-name" },
    ]);

    // 规则变更时实时生效
    shieldList.on("setter", () => {
        threadFloorsObserver.emit();
        threadCommentsObserver.emit();
        legacyIndexFeedsObserver.emit();
        forumThreadsObserver.emit();
    });
}
