import { currentPageType } from "@/lib/api/remixed";
import { threadFloorsObserver } from "@/lib/observers";

let installed = false;

/**
 * 帖子页：给楼层尾的「X 楼」与紧跟其后的「时间」.tail-info 打 class，
 * 供 vercel 主题 CSS 用 flex order 把它们重排到尾巴最左端，并装饰成胶囊。
 *
 * 贴吧原版 HTML 中楼层 / 时间 <span> 没有特殊语义类，只能按文本内容（形如 "5楼"）
 * 识别楼层，再取其紧邻的下一个 .tail-info 作为时间。监听 threadFloorsObserver，
 * 每次楼层注入后扫描整页并补打标。
 */
export function installThreadFloorTag(): void {
    if (installed) return;
    if (currentPageType() !== "thread") return;
    installed = true;

    const tag = (): void => {
        document.querySelectorAll<HTMLElement>(".post-tail-wrap .tail-info").forEach(el => {
            if (el.classList.contains("vercel-floor-tag")) return;
            const text = (el.textContent ?? "").trim();
            // 形如 "5楼" / "12楼" — 严格匹配避免误标平台/IP 等含数字的元素
            const match = /^(\d+)楼$/.exec(text);
            if (match) {
                el.classList.add("vercel-floor-tag");
                // 把楼层号写入 data 属性，供 CSS ::before 渲染为 "#N" 格式
                // （保留原 textContent 不动，避免 parser.ts 等模块通过 innerText 读取楼层数据时出现偏差）
                el.dataset.floorNum = match[1];
                const next = el.nextElementSibling;
                if (next instanceof HTMLElement && next.classList.contains("tail-info")) {
                    next.classList.add("vercel-time-tag");
                }
            }
        });
    };

    threadFloorsObserver.addEvent(tag);
    tag();
}
