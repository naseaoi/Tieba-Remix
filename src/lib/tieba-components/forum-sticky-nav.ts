import { currentPageType } from "@/lib/api/remixed";
import { asyncdom, dom } from "@/lib/elemental";
import { forumStickyNav } from "@/lib/user-values";
import { FORUM_PAGELET_TIMEOUT_MS } from "./forum";

const STUCK_ATTR = "data-forum-nav-stuck";
// 与固定状态下的 top 保持一致，越过该位置即切换为吸顶
const STICK_OFFSET = 8;

let installed = false;

export function installForumStickyNav(): void {
    if (installed || currentPageType() !== "forum") return;
    installed = true;

    void setup();
}

async function setup(): Promise<void> {
    if (!document.documentElement.classList.contains("style-vercel")) return;

    // 导航嵌在标题卡 pagelet 内，导航出现时品牌所需的吧名与头像已就绪
    const nav = await asyncdom<"div">(".nav_wrap", undefined, FORUM_PAGELET_TIMEOUT_MS);
    if (!nav) return;

    nav.prepend(createBrand());

    // 固定后由占位元素顶住原位置，避免下方内容上跳
    const placeholder = document.createElement("div");
    placeholder.className = "trex-forum-nav-placeholder";
    placeholder.hidden = true;
    nav.before(placeholder);

    let stuck = false;
    let enabled = forumStickyNav.get();
    const place = (): void => {
        const rect = placeholder.getBoundingClientRect();
        nav.style.left = `${rect.left}px`;
        nav.style.width = `${rect.width}px`;
    };
    const update = (): void => {
        const next = enabled
            && (stuck ? placeholder : nav).getBoundingClientRect().top < STICK_OFFSET;
        if (next === stuck) {
            if (stuck) place();
            return;
        }
        stuck = next;
        if (stuck) {
            const style = getComputedStyle(nav);
            placeholder.style.height = `${nav.offsetHeight}px`;
            placeholder.style.margin = style.margin;
            placeholder.hidden = false;
            place();
        } else {
            placeholder.hidden = true;
            nav.style.removeProperty("left");
            nav.style.removeProperty("width");
        }
        document.documentElement.toggleAttribute(STUCK_ATTR, stuck);
    };

    let frame = 0;
    const schedule = (): void => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
            frame = 0;
            update();
        });
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    forumStickyNav.on("setter", value => {
        enabled = value;
        schedule();
    });
    update();
}

function createBrand(): HTMLElement {
    const brand = document.createElement("a");
    brand.className = "trex-forum-nav-brand";
    brand.href = "#";
    brand.title = "回到顶部";
    brand.addEventListener("click", event => {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    const src = dom<"img">(".card_head_img")?.src;
    if (src) {
        const avatar = document.createElement("img");
        avatar.src = src;
        avatar.alt = "";
        brand.append(avatar);
    }
    const name = document.createElement("span");
    name.textContent = dom(".card_title_fname")?.textContent?.trim() ?? "";
    brand.append(name);
    return brand;
}
