import { dom, fadeInElems, fadeInLoad } from "@/lib/elemental";
import { onDOMReady, onWindowLoaded } from "@/lib/elemental/ready";
import { injectCSSRule } from "@/lib/elemental/styles";
import { threadFloorsObserver } from "@/lib/observers";

const levelBadges = ".d_badge_bright .d_badge_lv, .user_level .badge_index";
let installed = false;

export function installThreadBadges(): void {
    if (installed) return;
    installed = true;

    // 自己的等级牌也出现在吧页，因此这里不限制帖子页范围。
    fadeInElems.push(levelBadges);
    injectCSSRule(levelBadges, { opacity: "0" });

    onDOMReady(() => {
        dom(".post-tail-wrap .icon-jubao", []).forEach(elem => {
            elem.removeAttribute("src");
            elem.after("举报");
        });

        threadFloorsObserver.addEvent(() => {
            dom<"div">(".d_badge_lv", []).forEach(elem => {
                if (elem.textContent === "") {
                    const badge = elem.closest<HTMLElement>(".l_badge");
                    if (badge) badge.style.display = "none";
                }
            });
        });
    });

    onWindowLoaded(() => {
        threadFloorsObserver.addEvent(() => {
            dom(".d_badge_bawu1 .d_badge_lv, .d_badge_bawu2 .d_badge_lv, .badge_index", []).forEach(elem => {
                if (elem.className.includes("tieba-lvl-")) return;

                const text = elem.textContent?.trim();
                if (!text) return;
                const level = parseInt(text, 10);
                if (Number.isNaN(level) || level < 1) return;
                const color = level <= 3 ? "green" : level <= 9 ? "blue" : level <= 15 ? "yellow" : "orange";
                elem.classList.add(`tieba-lvl-${color}`);
            });

            fadeInLoad(levelBadges);
        });
    });
}
