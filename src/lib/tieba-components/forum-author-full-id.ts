import { currentPageType } from "@/lib/api/remixed";
import { asyncdom } from "@/lib/elemental";

let installed = false;

/**
 * 还原吧首页帖子列表中被贴吧后端截断的发帖人 ID。
 * 原版 HTML 里 .frs-author-name 的文字本身就是截断后的（如 "肉食主义b..."），CSS 拿不回丢失字符，
 * 必须从 href?un=<encoded> 解码完整 ID，兜底从 .tb_icon_author 的 title 提取。
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
    const href = a.getAttribute("href");
    if (href) {
        const match = href.match(/[?&]un=([^&#]+)/);
        if (match) {
            try {
                const decoded = decodeURIComponent(match[1]);
                if (decoded) return decoded;
            } catch {
                // 编码异常，落到下一兜底
            }
        }
    }

    const wrap = a.closest<HTMLElement>(".tb_icon_author");
    const title = wrap?.getAttribute("title");
    if (title) {
        // 形如 "主题作者: xxx" / "主题作者:xxx"，中英文冒号都兜
        const m = title.match(/[:：]\s*(.+)$/);
        if (m) {
            const name = m[1].trim();
            if (name) return name;
        }
    }

    return null;
}
