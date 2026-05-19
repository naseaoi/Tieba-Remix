import { currentPageType } from "@/lib/api/remixed";
import { asyncdom } from "@/lib/elemental";

let installed = false;

/**
 * 还原吧首页帖子列表中被贴吧后端截断的发帖人 ID。
 * 关键观察：服务端渲染的 textContent 才是真正的"最新显示名"；data-field.un 在用户改名后可能滞后。
 * 因此只在 textContent 尾部有省略号（"..." / "…"）时才视为被截断、需要补全；
 * 补全时还要求候选源以"截断前缀"开头，避免拿到滞后的旧昵称覆盖最新昵称。
 * 仅在 vercel 主题下启用 —— 其它主题未解开 CSS 截断，强行回填会撑破布局。
 */
export function installForumAuthorFullId(): void {
    if (installed) return;
    if (currentPageType() !== "forum") return;
    installed = true;

    void (async () => {
        if (!document.documentElement.classList.contains("style-vercel")) return;

        const threadlist = await asyncdom<"ul">(".threadlist_bright");
        if (!threadlist) return;

        const applyAll = (): void => {
            const links = threadlist.querySelectorAll<HTMLAnchorElement>(
                ".threadlist_author .frs-author-name"
            );
            if (links.length === 0) return;

            // 先读后写：避免读写交错触发布局抖动；已等值的节点 short-circuit 让 observer 回环空转
            const updates: Array<[HTMLAnchorElement, string]> = [];
            for (const a of links) {
                const fullName = extractFullName(a);
                if (!fullName) continue;
                if (a.textContent === fullName) continue;
                updates.push([a, fullName]);
            }

            for (const [a, name] of updates) {
                a.textContent = name;
            }
        };

        applyAll();

        const obs = new MutationObserver(applyAll);
        obs.observe(threadlist, {
            childList: true,
            subtree: true,
        });
    })();
}

function extractFullName(a: HTMLAnchorElement): string | null {
    const current = (a.textContent ?? "").trim();
    if (!current) return null;

    // 只处理服务端做了截断的情况：尾部 "..." (三个 ASCII 点) 或 "…"（单字符省略号）
    const trunc = current.match(/^(.+?)(\.{3}|…)$/);
    if (!trunc) return null;
    const prefix = trunc[1];
    if (!prefix) return null;

    // 候选源以截断前缀开头时才采用，避免 data-field.un 滞后于改名时覆盖出旧昵称
    const dataField = a.getAttribute("data-field");
    if (dataField) {
        try {
            const parsed = JSON.parse(dataField) as { un?: unknown };
            if (typeof parsed.un === "string") {
                const un = parsed.un.trim();
                if (un && un.startsWith(prefix)) return un;
            }
        } catch {
            // JSON 异常，落到下一兜底
        }
    }

    const href = a.getAttribute("href");
    if (href) {
        const match = href.match(/[?&]un=([^&#]+)/);
        if (match) {
            try {
                const decoded = decodeURIComponent(match[1]).trim();
                if (decoded && decoded.startsWith(prefix)) return decoded;
            } catch {
                // 编码异常，无可用兜底
            }
        }
    }

    return null;
}
