import { asyncdom, domrd } from "@/lib/elemental";
import { threadFloorsObserver } from "@/lib/observers";
import { AGREE_OBJ_TYPE_FLOOR, AGREE_OBJ_TYPE_THREAD, fetchAgreeSnapshot, type AgreeSnapshot } from "./api";
import { setupAgreeAction } from "./agree-action";
import { formatCount } from "./format";
import "./style.css";

const FLOOR_FLAG = "data-thread-agree-count-rendered";
const THREAD_BADGE_CLASS = "thread-agree-count-badge";
const FLOOR_BADGE_CLASS = "floor-agree-count-badge";

export default {
    id: "thread-agree-count",
    name: "新版点赞数",
    author: "Tieba-Remix",
    version: "1.1",
    brief: "在旧版帖子页显示新版点赞数",
    description: "通过贴吧 App 接口读取帖子与回复的官方点赞数并显示在旧版帖子页，支持登录用户点赞 / 取消。",
    scope: ["thread"],
    runAt: "DOMLoaded",
    entry: main,
} as UserModule;

async function main(): Promise<void> {
    const tid = PageData?.thread?.thread_id;
    if (!tid) return;

    const postList = await asyncdom<"div">("#j_p_postlist", undefined, 10_000);
    if (!postList) return;
    const threadList: HTMLDivElement = postList;

    let snapshot: AgreeSnapshot | undefined;
    let loadedKey = "";
    let loadToken = 0;

    await syncSnapshot();
    threadFloorsObserver.addEvent(() => void syncSnapshot());

    async function syncSnapshot(): Promise<void> {
        const key = `${PageData.pager.cur_page}:${Number(PageData.special.lz_only)}`;
        if (key === loadedKey) {
            if (snapshot) renderFloorAgree(threadList, snapshot);
            return;
        }

        const token = ++loadToken;
        let next: AgreeSnapshot;
        try {
            next = await fetchAgreeSnapshot({
                tid,
                pn: PageData.pager.cur_page,
                rn: PageData.pager.page_size ?? 30,
                lzOnly: PageData.special.lz_only,
            });
        } catch (err) {
            console.warn("[thread-agree-count] 拉取点赞数据失败:", err);
            return;
        }
        if (token !== loadToken) return;

        snapshot = next;
        loadedKey = key;
        renderThreadAgree(snapshot, getFirstPostId(threadList));
        renderFloorAgree(threadList, snapshot);
    }
}

function renderThreadAgree(snapshot: AgreeSnapshot, firstPid?: number): void {
    const count = snapshot.threadAgree;
    if (count == null) return;

    const title = document.querySelector<HTMLElement>("#title-wrapper .thread-title, .core_title_txt");
    if (!title) return;
    if (title.querySelector(`.${THREAD_BADGE_CLASS}`)) return;

    const badge = createAgreeBadge(THREAD_BADGE_CLASS);
    setBadgeCount(badge, count);
    title.appendChild(badge);

    if (firstPid != null && canAgree()) {
        setupAgreeAction(badge, {
            tid: PageData.thread.thread_id,
            pid: firstPid,
            objType: AGREE_OBJ_TYPE_THREAD,
            tbs: PageData.tbs,
            liked: snapshot.threadHasAgree,
            count,
        });
    }
}

function renderFloorAgree(threadList: HTMLElement, snapshot: AgreeSnapshot): void {
    const floors = threadList.querySelectorAll<HTMLElement>(".l_post");
    floors.forEach(floor => {
        if (floor.hasAttribute(FLOOR_FLAG)) return;

        const postId = getFloorPostId(floor);
        if (postId == null) return;

        const count = snapshot.postAgreeById.get(postId);
        if (count == null) return;

        const tail = floor.querySelector<HTMLElement>(".post-tail-wrap, .core_reply_tail:not(.clearfix)");
        if (!tail) return;

        const badge = createAgreeBadge(FLOOR_BADGE_CLASS);
        setBadgeCount(badge, count);
        tail.appendChild(badge);
        floor.setAttribute(FLOOR_FLAG, "");

        if (canAgree()) {
            setupAgreeAction(badge, {
                tid: PageData.thread.thread_id,
                pid: postId,
                objType: AGREE_OBJ_TYPE_FLOOR,
                tbs: PageData.tbs,
                liked: snapshot.postHasAgreeById.get(postId) ?? false,
                count,
            });
        }
    });
}

function getFloorPostId(floor: HTMLElement): number | undefined {
    const dataField = floor.getAttribute("data-field");
    if (dataField) {
        try {
            const parsed = JSON.parse(dataField) as {
                content?: {
                    post_id?: number | string;
                };
            };
            const id = parsePostId(parsed.content?.post_id);
            if (id != null) return id;
        } catch (err) {
            void err;
        }
    }

    const content = floor.querySelector<HTMLElement>(".d_post_content[id^='post_content_']");
    return parsePostId(content?.id.replace("post_content_", ""));
}

function parsePostId(value: unknown): number | undefined {
    const id = typeof value === "string" ? Number(value) : value;
    if (typeof id !== "number") return undefined;
    if (!Number.isFinite(id)) return undefined;
    return id;
}

function createAgreeBadge(className: string): HTMLSpanElement {
    const icon = domrd("span", { class: "agree-count-icon", "aria-hidden": "true" });
    const value = domrd("span", { class: "agree-count-value" });
    return domrd("span", { class: `agree-count-badge ${className}` }, [icon, value]);
}

function setBadgeCount(badge: HTMLElement, count: number): void {
    const value = badge.querySelector<HTMLElement>(".agree-count-value");
    if (!value) return;
    value.textContent = formatCount(count);
    badge.title = `点赞 ${count}`;
}

function getFirstPostId(threadList: HTMLElement): number | undefined {
    if (PageData.pager.cur_page !== 1) return undefined;
    const first = threadList.querySelector<HTMLElement>(".l_post");
    return first ? getFloorPostId(first) : undefined;
}

function canAgree(): boolean {
    return Boolean(PageData.user?.is_login) && Boolean(PageData.tbs);
}
