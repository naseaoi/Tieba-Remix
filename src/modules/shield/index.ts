import type { UserModuleEx } from "@/ex";
import { dom } from "@/lib/elemental";
import { TbObserver, forumThreadsObserver, legacyIndexFeedsObserver, threadCommentsObserver, threadFloorsObserver } from "@/lib/observers";

import { markRaw } from "vue";
import moduleShieldVue from "./module.shield.vue";
import { matchShield, shieldList } from "./shield";
import type { ShieldRule } from "./shield";

export default {
    id: "shield",
    name: "贴吧屏蔽",
    author: "锯条",
    version: "1.2",
    brief: "眼不见为净",
    description: `用户自定义屏蔽规则，符合规则的贴子和楼层将不会显示在首页、看贴页面和进吧页面。支持正则匹配`,
    scope: true,
    runAt: "immediately",
    settings: {
        "shield-controls": {
            title: "管理屏蔽规则",
            description:
                `这些屏蔽规则将会在首页、看贴页面生效，会自动隐藏所有符合匹配规则的贴子和楼层。`,
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
    scope: ShieldRule["scope"];
    subSelector: string;
}

function shieldByMultiScope(
    observer: TbObserver,
    parentSelector: string,
    checks: ShieldCheck[],
) {
    observer.addEvent(() => {
        const rules = shieldList.get();
        dom(parentSelector, []).forEach(elem => {
            let isMatch = false;

            for (const check of checks) {
                if (isMatch) break;
                const content = dom(check.subSelector, elem, []).map(el => el.textContent ?? "").join("\n");
                for (const rule of rules) {
                    if (matchShield(rule, content, check.scope)) {
                        isMatch = true;
                        break;
                    }
                }
            }

            (elem as HTMLElement).style.display = isMatch ? "none" : "";
        });
    });
}

function main() {
    // 看贴页面
    shieldByMultiScope(threadFloorsObserver, ".l_post_bright", [
        { scope: "content", subSelector: ".d_post_content" },
        { scope: "username", subSelector: ".p_author_name" },
    ]);
    shieldByMultiScope(threadCommentsObserver, ".lzl_single_post", [
        { scope: "content", subSelector: ".lzl_content_main" },
        { scope: "username", subSelector: ".lzl_cnt .j_user_card" },
    ]);
    // 首页动态
    shieldByMultiScope(legacyIndexFeedsObserver, ".j_feed_li", [
        { scope: "content", subSelector: ".title, .n_txt" },
        { scope: "username", subSelector: ".post_author" },
    ]);
    // 进吧页面
    shieldByMultiScope(forumThreadsObserver, ".j_thread_list", [
        { scope: "content", subSelector: ".threadlist_title a" },
        { scope: "username", subSelector: ".frs-author-name-wrap" },
    ]);

    // 规则变更时实时生效
    shieldList.on("setter", () => {
        threadFloorsObserver.emit();
        threadCommentsObserver.emit();
        legacyIndexFeedsObserver.emit();
        forumThreadsObserver.emit();
    });
}
