import { asyncdom, domrd } from "@/lib/elemental";
import { threadCommentsObserver, threadFloorsObserver } from "@/lib/observers";
import { AGREE_OBJ_TYPE_FLOOR, AGREE_OBJ_TYPE_SUB_POST, AGREE_OBJ_TYPE_THREAD, fetchAgreeSnapshot, fetchSubPostAgreeSnapshot, fetchUserProfileIp, type AgreeSnapshot, type SubPostAgreeSnapshot } from "./api";
import { createAgreeActionState, setupAgreeAction, type AgreeActionServerState, type AgreeActionState } from "./agree-action";
import { formatCount } from "./format";
import { toast } from "user-view";
import "./style.css";

const FLOOR_FLAG = "data-thread-agree-count-rendered";
const SUB_POST_FLAG = "data-thread-agree-count-sub-post-rendered";
const THREAD_BADGE_CLASS = "thread-agree-count-badge";
const FLOOR_BADGE_CLASS = "floor-agree-count-badge";
const LZL_BADGE_CLASS = "lzl-agree-count-badge";
const CONFIRMED_STATE_TTL = 5 * 60 * 1000;
const LZL_FETCH_RN_MIN = 30;
const LZL_FETCH_RN_MAX = 200;
const PROFILE_IP_BATCH_SIZE = 4;

export default {
    id: "thread-agree-count",
    name: "新版点赞数",
    author: "Tieba-Remix",
    version: "1.1",
    brief: "在旧版帖子页显示新版点赞数",
    description: "通过贴吧 App 接口读取帖子与回复的官方点赞数并显示在旧版帖子页，支持登录用户点赞 / 取消。",
    scope: ["thread"],
    runAt: "DOMLoaded",
    entry: start,
} as UserModule;

function start(): void {
    void main().catch(err => {
        console.warn("[thread-agree-count] start failed:", err);
    });
}

async function main(): Promise<void> {
    const tid = PageData?.thread?.thread_id;
    if (!tid) return;

    const postList = await asyncdom<"div">("#j_p_postlist", undefined, 10_000);
    if (!postList) return;
    const threadList: HTMLDivElement = postList;

    let snapshot: AgreeSnapshot | undefined;
    let loadedKey = "";
    let loadToken = 0;
    let subPostLoadedKey = "";
    let subPostLoadToken = 0;
    const subPostSnapshotByParentId = new Map<number, Promise<SubPostAgreeSnapshot | undefined>>();
    const actionStateByKey = new Map<string, AgreeActionState>();
    const profileIpByUserId = new Map<number, Promise<string | undefined>>();

    let skipInitialCommentEvent = true;
    threadFloorsObserver.addEvent(() => {
        void syncSnapshot();
        void syncSubPosts();
    });
    threadCommentsObserver.addEvent(() => {
        if (skipInitialCommentEvent) {
            skipInitialCommentEvent = false;
            return;
        }
        void syncSubPosts();
    });

    async function syncSnapshot(): Promise<void> {
        const key = `${PageData.pager.cur_page}:${Number(PageData.special.lz_only)}`;
        if (key === loadedKey) {
            if (snapshot) renderFloorAgree(threadList, snapshot, actionStateByKey);
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
        renderThreadAgree(snapshot, actionStateByKey);
        renderFloorAgree(threadList, snapshot, actionStateByKey);
    }

    async function syncSubPosts(): Promise<void> {
        const key = `${PageData.thread.thread_id}:${PageData.pager.cur_page}:${Number(PageData.special.lz_only)}`;
        if (key !== subPostLoadedKey) {
            subPostSnapshotByParentId.clear();
            subPostLoadedKey = key;
        }

        const groups = collectSubPostGroups(threadList);
        if (groups.size === 0) return;

        const token = ++subPostLoadToken;
        const entries = await Promise.all([...groups].map(async ([parentId, rn]) => {
            const next = await getSubPostSnapshot(parentId, rn);
            return [parentId, next] as const;
        }));
        if (token !== subPostLoadToken) return;

        const snapshots = new Map<number, SubPostAgreeSnapshot>();
        entries.forEach(([parentId, next]) => {
            if (next) snapshots.set(parentId, next);
        });
        renderSubPostAgree(threadList, snapshots, snapshot?.userIpByPortrait, new Map(), actionStateByKey);

        void resolveSubPostProfileIps(threadList, snapshots, snapshot?.userIpByPortrait).then(profileIps => {
            if (token !== subPostLoadToken) return;
            renderSubPostAgree(threadList, snapshots, snapshot?.userIpByPortrait, profileIps, actionStateByKey);
        });
    }

    function getSubPostSnapshot(parentId: number, rn: number): Promise<SubPostAgreeSnapshot | undefined> {
        let promise = subPostSnapshotByParentId.get(parentId);
        if (!promise) {
            promise = fetchSubPostAgreeSnapshot({
                tid,
                pid: parentId,
                rn,
            }).catch(err => {
                console.warn("[thread-agree-count] 拉取楼中楼点赞数据失败:", err);
                return undefined;
            });
            subPostSnapshotByParentId.set(parentId, promise);
        }
        return promise;
    }

    async function resolveSubPostProfileIps(threadList: HTMLElement, snapshotsByParentId: Map<number, SubPostAgreeSnapshot>, userIpByPortrait: Map<string, string> | undefined): Promise<Map<number, string>> {
        const userIds = new Set<number>();
        const posts = threadList.querySelectorAll<HTMLElement>(".lzl_single_post");
        posts.forEach(post => {
            const ids = getSubPostIds(post);
            if (!ids) return;

            const snapshot = snapshotsByParentId.get(ids.parentId);
            const portrait = getSubPostPortrait(post) ?? snapshot?.subPostPortraitById.get(ids.subPostId);
            if (portrait && userIpByPortrait?.has(portrait)) return;

            const userId = snapshot?.subPostAuthorIdById.get(ids.subPostId);
            if (userId != null) userIds.add(userId);
        });

        const result = new Map<number, string>();
        const ids = [...userIds];
        for (let i = 0; i < ids.length; i += PROFILE_IP_BATCH_SIZE) {
            const batch = await Promise.all(ids.slice(i, i + PROFILE_IP_BATCH_SIZE).map(async userId => {
                const ip = await getProfileIp(userId);
                return [userId, ip] as const;
            }));
            batch.forEach(([userId, ip]) => {
                if (ip) result.set(userId, ip);
            });
        }
        return result;
    }

    function getProfileIp(userId: number): Promise<string | undefined> {
        let promise = profileIpByUserId.get(userId);
        if (!promise) {
            promise = fetchUserProfileIp(userId).catch(err => {
                console.warn("[thread-agree-count] fetch user profile failed:", err);
                return undefined;
            });
            profileIpByUserId.set(userId, promise);
        }
        return promise;
    }
}

function renderThreadAgree(snapshot: AgreeSnapshot, actionStateByKey: Map<string, AgreeActionState>): void {
    const count = snapshot.threadAgree;
    if (count == null) return;

    const title = document.querySelector<HTMLElement>("#title-wrapper .thread-title, .core_title_txt");
    if (!title) return;
    if (title.querySelector(`.${THREAD_BADGE_CLASS}`)) return;

    const badge = createAgreeBadge(THREAD_BADGE_CLASS);
    setBadgeCount(badge, count);
    title.appendChild(badge);

    if (canAgree()) {
        setupAgreeAction(badge, {
            tid: PageData.thread.thread_id,
            fid: getForumId(),
            objType: AGREE_OBJ_TYPE_THREAD,
            tbs: PageData.tbs,
            liked: snapshot.threadHasAgree,
            count,
            state: getAgreeActionState(actionStateByKey, threadAgreeKey(), snapshot.threadHasAgree, count),
            refresh: refreshThreadAgreeState,
        });
    }
}

function renderFloorAgree(threadList: HTMLElement, snapshot: AgreeSnapshot, actionStateByKey: Map<string, AgreeActionState>): void {
    const firstPostId = getFirstPostId(threadList);
    const floors = threadList.querySelectorAll<HTMLElement>(".l_post");
    floors.forEach(floor => {
        if (floor.hasAttribute(FLOOR_FLAG)) return;

        const postId = getFloorPostId(floor);
        if (postId == null) return;

        const isThreadPost = postId === firstPostId;
        const count = isThreadPost ? snapshot.threadAgree ?? snapshot.postAgreeById.get(postId) : snapshot.postAgreeById.get(postId);
        if (count == null) return;

        const tail = floor.querySelector<HTMLElement>(".post-tail-wrap, .core_reply_tail:not(.clearfix)");
        if (!tail) return;

        const badge = createAgreeBadge(FLOOR_BADGE_CLASS);
        setBadgeCount(badge, count);
        tail.appendChild(badge);
        floor.setAttribute(FLOOR_FLAG, "");

        if (canAgree()) {
            const key = isThreadPost ? threadAgreeKey() : floorAgreeKey(postId);
            const liked = isThreadPost ? snapshot.threadHasAgree : snapshot.postHasAgreeById.get(postId) ?? false;
            setupAgreeAction(badge, {
                tid: PageData.thread.thread_id,
                pid: isThreadPost ? undefined : postId,
                fid: getForumId(),
                objType: isThreadPost ? AGREE_OBJ_TYPE_THREAD : AGREE_OBJ_TYPE_FLOOR,
                tbs: PageData.tbs,
                liked,
                count,
                state: getAgreeActionState(actionStateByKey, key, liked, count),
                refresh: isThreadPost ? refreshThreadAgreeState : () => refreshFloorAgreeState(postId),
            });
        }
    });
}

function renderSubPostAgree(threadList: HTMLElement, snapshotsByParentId: Map<number, SubPostAgreeSnapshot>, userIpByPortrait: Map<string, string> | undefined, profileIpByUserId: Map<number, string>, actionStateByKey: Map<string, AgreeActionState>): void {
    const sourceByPortrait = collectFloorSourceByPortrait(threadList);
    const posts = threadList.querySelectorAll<HTMLElement>(".lzl_single_post");
    posts.forEach(post => {
        const rendered = post.hasAttribute(SUB_POST_FLAG);

        const ids = getSubPostIds(post);
        if (!ids) return;

        const tail = post.querySelector<HTMLElement>(".lzl_content_reply");
        if (!tail) return;

        const snapshot = snapshotsByParentId.get(ids.parentId);
        renderSubPostTailInfo(
            tail,
            getSubPostLocation(post, snapshot, userIpByPortrait, profileIpByUserId),
            getSubPostSource(post, snapshot, sourceByPortrait),
        );
        if (!snapshot || rendered) return;

        const count = snapshot.subPostAgreeById.get(ids.subPostId);
        if (count != null && !tail.querySelector(`.${LZL_BADGE_CLASS}`)) {
            const badge = createAgreeBadge(LZL_BADGE_CLASS);
            setBadgeCount(badge, count);
            tail.appendChild(badge);

            if (canAgree()) {
                const liked = snapshot.subPostHasAgreeById.get(ids.subPostId) ?? false;
                setupAgreeAction(badge, {
                    tid: PageData.thread.thread_id,
                    pid: ids.subPostId,
                    fid: getForumId(),
                    objType: AGREE_OBJ_TYPE_SUB_POST,
                    tbs: PageData.tbs,
                    liked,
                    count,
                    state: getAgreeActionState(actionStateByKey, subPostAgreeKey(ids.subPostId), liked, count),
                    refresh: () => refreshSubPostAgreeState(ids.parentId, ids.subPostId),
                });
            }
        }

        post.setAttribute(SUB_POST_FLAG, "");
    });
}

function renderSubPostTailInfo(tail: HTMLElement, location: string | undefined, source: string | undefined): void {
    upsertTailItem(tail, "tbr-lzl-location", location);

    const sourceItem = upsertTailItem(tail, "tbr-lzl-source", source);
    if (!sourceItem) return;

    if (isMobileSource(source)) {
        sourceItem.dataset.tbrPlatform = "mobile";
    } else {
        delete sourceItem.dataset.tbrPlatform;
    }
}

function getSubPostLocation(post: HTMLElement, snapshot: SubPostAgreeSnapshot | undefined, userIpByPortrait: Map<string, string> | undefined, profileIpByUserId: Map<number, string>): string | undefined {
    const ids = getSubPostIds(post);
    const portrait = getSubPostPortrait(post) ?? (ids ? snapshot?.subPostPortraitById.get(ids.subPostId) : undefined);
    const portraitIp = portrait ? userIpByPortrait?.get(portrait) : undefined;
    if (portraitIp) return portraitIp;

    const userId = ids ? snapshot?.subPostAuthorIdById.get(ids.subPostId) : undefined;
    return userId != null ? profileIpByUserId.get(userId) : undefined;
}

function getSubPostSource(post: HTMLElement, snapshot: SubPostAgreeSnapshot | undefined, sourceByPortrait: Map<string, string>): string | undefined {
    const ids = getSubPostIds(post);
    const portrait = getSubPostPortrait(post) ?? (ids ? snapshot?.subPostPortraitById.get(ids.subPostId) : undefined);
    return portrait ? sourceByPortrait.get(portrait) : undefined;
}

function getSubPostPortrait(post: HTMLElement): string | undefined {
    const match = (post.getAttribute("data-field") ?? "").match(/["']portrait["']\s*:\s*["']([^"']+)["']/);
    return match ? match[1].replace(/\?.*$/, "") : undefined;
}

function upsertTailItem(tail: HTMLElement, className: string, text: string | undefined): HTMLElement | undefined {
    let item = tail.querySelector<HTMLElement>(`.${className}`);
    if (!text) {
        item?.remove();
        return undefined;
    }

    if (!item) {
        item = domrd("span", { class: `tbr-lzl-tail-item ${className}` });
        insertTailItem(tail, item);
    }

    item.textContent = text;
    item.title = text;
    return item;
}

function insertTailItem(tail: HTMLElement, item: HTMLElement): void {
    const anchor = tail.querySelector(".lzl_time");
    if (anchor?.nextSibling) {
        tail.insertBefore(item, anchor.nextSibling);
        return;
    }
    if (anchor) {
        tail.appendChild(item);
        return;
    }
    tail.insertBefore(item, tail.querySelector(".lzl_s_r, .lzl_jb"));
}

function collectSubPostGroups(threadList: HTMLElement): Map<number, number> {
    const groups = new Map<number, number>();
    const posts = threadList.querySelectorAll<HTMLElement>(".lzl_single_post");
    posts.forEach(post => {
        if (post.hasAttribute(SUB_POST_FLAG)) return;

        const ids = getSubPostIds(post);
        if (!ids) return;

        const rn = getSubPostFetchSize(post);
        groups.set(ids.parentId, Math.max(groups.get(ids.parentId) ?? 0, rn));
    });
    return groups;
}

function collectFloorSourceByPortrait(threadList: HTMLElement): Map<string, string> {
    const result = new Map<string, string>();
    threadList.querySelectorAll<HTMLElement>(".l_post").forEach(floor => {
        const portrait = getFloorPortrait(floor);
        const source = getFloorSource(floor);
        if (portrait && source) result.set(portrait, source);
    });
    return result;
}

function getFloorPortrait(floor: HTMLElement): string | undefined {
    const dataField = floor.getAttribute("data-field");
    if (dataField) {
        try {
            const parsed = JSON.parse(dataField) as {
                author?: {
                    portrait?: string;
                };
            };
            const portrait = normalizePortrait(parsed.author?.portrait);
            if (portrait) return portrait;
        } catch (err) {
            void err;
        }
    }

    const href = floor.querySelector<HTMLAnchorElement>(".p_author_face")?.href;
    return normalizePortrait(href?.split(/(?:\?|&)id=/)[1]?.split("&")[0]);
}

function getFloorSource(floor: HTMLElement): string | undefined {
    const elems = floor.querySelectorAll<HTMLElement>(".post-tail-wrap .tail-info, .post-tail-wrap .p_tail_wap, .core_reply_tail .tail-info, .core_reply_tail .p_tail_wap");
    for (const elem of elems) {
        const text = normalizeSourceText(elem.title || elem.textContent);
        if (isPlatformSource(text)) return text;
    }
    return undefined;
}

function normalizeSourceText(value: string | null | undefined): string {
    return (value ?? "")
        .replace(/\s+/g, "")
        .replace(/^(来自|通过)/, "")
        .replace(/上传$/, "")
        .trim();
}

function isPlatformSource(text: string): boolean {
    return /客户端|移动端|Android|iPhone|iPad/i.test(text);
}

function isMobileSource(text: string | undefined): boolean {
    return !!text && /Android|iPhone|iPad|移动端/i.test(text);
}

function normalizePortrait(value: string | undefined): string | undefined {
    const text = value?.trim();
    return text ? text.replace(/\?.*$/, "") : undefined;
}

function getAgreeActionState(actionStateByKey: Map<string, AgreeActionState>, key: string, liked: boolean, count: number): AgreeActionState {
    let state = actionStateByKey.get(key);
    if (!state) {
        state = createAgreeActionState(liked, count);
        actionStateByKey.set(key, state);
    } else if (!state.pending) {
        applyServerState(state, liked, count);
    }
    return state;
}

function applyServerState(state: AgreeActionState, liked: boolean, count: number): void {
    const recent = state.confirmedAt != null && Date.now() - state.confirmedAt <= CONFIRMED_STATE_TTL;
    if (!recent) {
        state.liked = liked;
        state.count = count;
        state.confirmedAt = undefined;
        state.mismatchNotified = false;
        return;
    }

    if (liked !== state.liked) {
        notifyMismatch(state);
        state.liked = liked;
        state.count = count;
        state.confirmedAt = undefined;
        return;
    }

    state.count = liked ? Math.max(count, state.count) : Math.min(count, state.count);
}

function notifyMismatch(state: AgreeActionState): void {
    if (state.mismatchNotified) return;
    state.mismatchNotified = true;
    toast({
        message: `${state.liked ? "点赞" : "取消点赞"}未生效，请稍后重试`,
        type: "warning",
        duration: 5000,
    });
}

async function refreshThreadAgreeState(): Promise<AgreeActionServerState | undefined> {
    const snapshot = await fetchCurrentAgreeSnapshot();
    const count = snapshot.threadAgree;
    if (count == null) return undefined;
    return {
        liked: snapshot.threadHasAgree,
        count,
    };
}

async function refreshFloorAgreeState(postId: number): Promise<AgreeActionServerState | undefined> {
    const snapshot = await fetchCurrentAgreeSnapshot();
    const count = snapshot.postAgreeById.get(postId);
    if (count == null) return undefined;
    return {
        liked: snapshot.postHasAgreeById.get(postId) ?? false,
        count,
    };
}

async function refreshSubPostAgreeState(parentId: number, subPostId: number): Promise<AgreeActionServerState | undefined> {
    const snapshot = await fetchSubPostAgreeSnapshot({
        tid: PageData.thread.thread_id,
        pid: parentId,
        rn: LZL_FETCH_RN_MAX,
    });
    const count = snapshot.subPostAgreeById.get(subPostId);
    if (count == null) return undefined;
    return {
        liked: snapshot.subPostHasAgreeById.get(subPostId) ?? false,
        count,
    };
}

function fetchCurrentAgreeSnapshot(): Promise<AgreeSnapshot> {
    return fetchAgreeSnapshot({
        tid: PageData.thread.thread_id,
        pn: PageData.pager.cur_page,
        rn: PageData.pager.page_size ?? 30,
        lzOnly: PageData.special.lz_only,
    });
}

function getForumId(): string {
    return PageData.forum.forum_id || PageData.forum.id;
}

function threadAgreeKey(): string {
    return `thread:${PageData.thread.thread_id}`;
}

function floorAgreeKey(postId: number): string {
    return `floor:${postId}`;
}

function subPostAgreeKey(subPostId: number): string {
    return `sub-post:${subPostId}`;
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

function getSubPostIds(post: HTMLElement): { parentId: number; subPostId: number } | undefined {
    const dataField = post.getAttribute("data-field") ?? "";
    const parentId = getDataFieldNumber(dataField, "pid") ?? getClosestFloorPostId(post);
    const subPostId = getDataFieldNumber(dataField, "spid")
        ?? parsePostId(post.querySelector<HTMLAnchorElement>("a[name]")?.getAttribute("name"));
    if (parentId == null || subPostId == null) return undefined;
    return { parentId, subPostId };
}

function getDataFieldNumber(dataField: string, key: string): number | undefined {
    const match = dataField.match(new RegExp(`["']${key}["']\\s*:\\s*["']?(\\d+)`));
    return parsePostId(match?.[1]);
}

function getClosestFloorPostId(post: HTMLElement): number | undefined {
    const floor = post.closest<HTMLElement>(".l_post");
    return floor ? getFloorPostId(floor) : undefined;
}

function getSubPostFetchSize(post: HTMLElement): number {
    const floor = post.closest<HTMLElement>(".l_post");
    const count = floor?.querySelectorAll(".lzl_single_post").length ?? 0;
    return Math.max(LZL_FETCH_RN_MIN, Math.min(LZL_FETCH_RN_MAX, count + 20));
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
