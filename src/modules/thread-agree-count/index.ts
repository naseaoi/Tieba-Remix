import { asyncdom, domrd } from "@/lib/elemental";
import { createLucideIconElement } from "@/lib/lucide";
import { threadCommentsObserver, threadFloorsObserver } from "@/lib/observers";
import { ThumbsUp } from "@lucide/vue";
import {
    AGREE_OBJ_TYPE_FLOOR,
    AGREE_OBJ_TYPE_SUB_POST,
    AGREE_OBJ_TYPE_THREAD,
    createSubPostAgreeSnapshot,
    fetchAgreeSnapshot,
    fetchNestedFloorPage,
    fetchSubPostSourceSnapshot,
    loadThreadPageSnapshot,
    mergeSubPostAgreeSnapshot,
    type AgreeSnapshot,
    type SubPostAgreeSnapshot,
    type ThreadPageOptions,
    type ThreadPageSnapshot,
} from "./api";
import { createAgreeActionState, setupAgreeAction, type AgreeActionServerState, type AgreeActionState } from "./agree-action";
import { formatCount } from "./format";
import { mergeRecentThreadAgreeState, saveRecentThreadAgreeState } from "./recent-state";
import { toast } from "user-view";
import "./style.css";

const FLOOR_FLAG = "data-thread-agree-count-rendered";
const SUB_POST_FLAG = "data-thread-agree-count-sub-post-rendered";
const FLOOR_BADGE_CLASS = "floor-agree-count-badge";
const LZL_BADGE_CLASS = "lzl-agree-count-badge";
const CONFIRMED_STATE_TTL = 5 * 60 * 1000;
const NESTED_FLOOR_MAX_BATCHES = 50;
// 整页数据（含 App 兜底）失败后会随楼层变化重新拉取，同一页最多尝试此次数
const PAGE_LOAD_MAX_ATTEMPTS = 3;

export default {
    id: "thread-agree-count",
    name: "新版点赞数",
    author: "Tieba-Remix",
    version: "1.2",
    brief: "在旧版帖子页显示新版点赞数",
    description: "通过新版贴吧接口读取帖子与回复的官方点赞数和楼中楼 IP 属地并显示在旧版帖子页，支持登录用户点赞 / 取消。",
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
    let snapshotRequestKey = "";
    let snapshotRequest: Promise<ThreadPageSnapshot | undefined> | undefined;
    const subPosts = createSubPostAgreeSnapshot();
    const userIpByPortrait = new Map<string, string>();
    const nestedOffsetByParentId = new Map<number, number>();
    const nestedLoadingParentIds = new Set<number>();
    const unresolvedSubPostIds = new Set<number>();
    const actionStateByKey = new Map<string, AgreeActionState>();
    const sourceByPortrait = new Map<string, string>();
    const sourceBySubPostId = new Map<number, string>();
    let subPostSourcePromise: Promise<Map<number, string>> | undefined;
    let subPostSyncScheduled = false;
    const failedLoadsByKey = new Map<string, number>();

    let skipInitialCommentEvent = true;
    threadFloorsObserver.addEvent(() => {
        void syncSnapshot();
        scheduleSubPostsSync();
    });
    threadCommentsObserver.addEvent(() => {
        if (skipInitialCommentEvent) {
            skipInitialCommentEvent = false;
            return;
        }
        scheduleSubPostsSync();
    });

    async function syncSnapshot(): Promise<void> {
        const key = currentPageKey();
        if (key === loadedKey) {
            if (snapshot) renderFloorAgree(threadList, snapshot, actionStateByKey);
            return;
        }
        if (key === snapshotRequestKey && snapshotRequest) {
            await snapshotRequest;
            if (key === loadedKey && snapshot) renderFloorAgree(threadList, snapshot, actionStateByKey);
            return;
        }

        const failedLoads = failedLoadsByKey.get(key) ?? 0;
        if (failedLoads >= PAGE_LOAD_MAX_ATTEMPTS) return;

        const token = ++loadToken;
        const request = loadPageSnapshot(threadList);
        snapshotRequestKey = key;
        snapshotRequest = request;
        const next = await request;
        if (snapshotRequest === request) {
            snapshotRequestKey = "";
            snapshotRequest = undefined;
        }
        if (!next) {
            failedLoadsByKey.set(key, failedLoads + 1);
            return;
        }
        if (token !== loadToken) return;

        resetSubPostState();
        mergeSubPostAgreeSnapshot(subPosts, next.subPosts);
        next.userIpByPortrait.forEach((ip, portrait) => userIpByPortrait.set(portrait, ip));
        snapshot = withRecentThreadState(tid, next);
        loadedKey = key;
        renderFloorAgree(threadList, snapshot, actionStateByKey);
        scheduleSubPostsSync();
    }

    function resetSubPostState(): void {
        subPosts.subPostAgreeById.clear();
        subPosts.subPostHasAgreeById.clear();
        subPosts.subPostIpById.clear();
        userIpByPortrait.clear();
        nestedOffsetByParentId.clear();
        unresolvedSubPostIds.clear();
        sourceByPortrait.clear();
        sourceBySubPostId.clear();
        subPostSourcePromise = undefined;
    }

    function syncSubPosts(): void {
        const key = currentPageKey();
        // 楼中楼预览随整页数据一起返回，整页数据到达后才知道哪些楼中楼需要单独补取
        if (key !== loadedKey) return;
        void resolveAndRenderSubPostSources(key);
        renderSubPosts();

        collectMissingSubPosts().forEach((missing, parentId) => {
            if (nestedLoadingParentIds.has(parentId)) return;
            nestedLoadingParentIds.add(parentId);
            void loadNestedSubPosts(parentId, missing, key).finally(() => {
                nestedLoadingParentIds.delete(parentId);
                if (key === currentPageKey()) scheduleSubPostsSync();
            });
        });
    }

    function renderSubPosts(): void {
        renderSubPostAgree(threadList, subPosts, userIpByPortrait, sourceByPortrait, sourceBySubPostId, actionStateByKey);
    }

    function collectMissingSubPosts(): Map<number, Set<number>> {
        const result = new Map<number, Set<number>>();
        threadList.querySelectorAll<HTMLElement>(".lzl_single_post").forEach(post => {
            const ids = getSubPostIds(post);
            if (!ids) return;
            if (subPosts.subPostAgreeById.has(ids.subPostId) || unresolvedSubPostIds.has(ids.subPostId)) return;
            const missing = result.get(ids.parentId) ?? new Set<number>();
            missing.add(ids.subPostId);
            result.set(ids.parentId, missing);
        });
        return result;
    }

    async function loadNestedSubPosts(parentId: number, missing: Set<number>, key: string): Promise<void> {
        let offset = nestedOffsetByParentId.get(parentId) ?? 0;
        let probedAfterEnd = false;
        try {
            for (let batch = 0; batch < NESTED_FLOOR_MAX_BATCHES && missing.size > 0; batch++) {
                const page = await fetchNestedFloorPage({ tid, pid: parentId, offset });
                if (key !== currentPageKey()) return;

                mergeSubPostAgreeSnapshot(subPosts, page);
                page.subPostAgreeById.forEach((_, id) => missing.delete(id));
                renderSubPosts();

                const advanced = page.nextOffset > offset;
                if (advanced) {
                    offset = page.nextOffset;
                    nestedOffsetByParentId.set(parentId, offset);
                }
                if (page.hasMore && advanced) continue;
                // has_more 偶尔提前置 0，末批仍有数据时再向后探测一次
                if (probedAfterEnd || !advanced || page.subPostAgreeById.size === 0) break;
                probedAfterEnd = true;
            }
        } catch (err) {
            console.warn("[thread-agree-count] 拉取楼中楼数据失败:", err);
        }
        if (key === currentPageKey()) missing.forEach(id => unresolvedSubPostIds.add(id));
    }

    async function resolveAndRenderSubPostSources(key: string): Promise<void> {
        const sources = await getSubPostSourceSnapshot();
        if (key !== currentPageKey()) return;
        if (sources.size === 0) return;

        sources.forEach((source, subPostId) => {
            sourceBySubPostId.set(subPostId, source);
        });
        renderSubPosts();
    }

    function getSubPostSourceSnapshot(): Promise<Map<number, string>> {
        if (!subPostSourcePromise) {
            subPostSourcePromise = fetchSubPostSourceSnapshot({
                tid,
                fid: getForumId(),
                pn: PageData.pager.cur_page,
                lzOnly: PageData.special.lz_only,
            }).catch(err => {
                console.warn("[thread-agree-count] 拉取楼中楼来源数据失败:", err);
                return new Map();
            });
        }
        return subPostSourcePromise;
    }

    function scheduleSubPostsSync(): void {
        if (subPostSyncScheduled) return;
        subPostSyncScheduled = true;
        requestAnimationFrame(() => {
            subPostSyncScheduled = false;
            syncSubPosts();
        });
    }
}

function currentPageOptions(): ThreadPageOptions {
    return {
        tid: PageData.thread.thread_id,
        pn: PageData.pager.cur_page,
        lzOnly: Boolean(PageData.special.lz_only),
    };
}

function currentPageKey(): string {
    return `${PageData.pager.cur_page}:${Number(PageData.special.lz_only)}`;
}

// 同源整页数据缺楼（请求失败或与旧版分页错位）时，用 App 接口补齐楼层点赞
async function loadPageSnapshot(threadList: HTMLElement, fresh = false): Promise<ThreadPageSnapshot | undefined> {
    let page: ThreadPageSnapshot | undefined;
    try {
        page = await loadThreadPageSnapshot(currentPageOptions(), fresh);
    } catch (err) {
        console.warn("[thread-agree-count] 拉取帖子数据失败:", err);
    }

    const floorIds = [...threadList.querySelectorAll<HTMLElement>(".l_post")].flatMap(floor => getFloorPostId(floor) ?? []);
    if (page?.threadAgree != null && floorIds.every(id => page.postAgreeById.has(id))) return page;

    try {
        const fallback = await fetchAgreeSnapshot({
            tid: PageData.thread.thread_id,
            pn: PageData.pager.cur_page,
            rn: PageData.pager.page_size ?? 30,
            lzOnly: PageData.special.lz_only,
        });
        return mergeFallbackSnapshot(page, fallback);
    } catch (err) {
        console.warn("[thread-agree-count] 拉取点赞数据失败:", err);
        return page;
    }
}

function mergeFallbackSnapshot(page: ThreadPageSnapshot | undefined, fallback: AgreeSnapshot): ThreadPageSnapshot {
    if (!page) return { ...fallback, subPosts: createSubPostAgreeSnapshot() };
    fallback.postAgreeById.forEach((count, id) => {
        if (page.postAgreeById.has(id)) return;
        page.postAgreeById.set(id, count);
        page.postHasAgreeById.set(id, fallback.postHasAgreeById.get(id) ?? false);
    });
    fallback.userIpByPortrait.forEach((ip, portrait) => {
        if (!page.userIpByPortrait.has(portrait)) page.userIpByPortrait.set(portrait, ip);
    });
    if (page.threadAgree == null) {
        page.threadAgree = fallback.threadAgree;
        page.threadHasAgree = fallback.threadHasAgree;
    }
    return page;
}

function withRecentThreadState<T extends AgreeSnapshot>(tid: number | string, snapshot: T): T {
    if (snapshot.threadAgree == null) return snapshot;
    const state = mergeRecentThreadAgreeState(tid, {
        liked: snapshot.threadHasAgree,
        count: snapshot.threadAgree,
    });
    return {
        ...snapshot,
        threadAgree: state.count,
        threadHasAgree: state.liked,
    };
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
                onConfirmed: isThreadPost ? state => saveRecentThreadAgreeState(PageData.thread.thread_id, state) : undefined,
            });
        }
    });
}

function renderSubPostAgree(threadList: HTMLElement, subPosts: SubPostAgreeSnapshot, userIpByPortrait: Map<string, string>, sourceByPortrait: Map<string, string>, sourceBySubPostId: Map<number, string>, actionStateByKey: Map<string, AgreeActionState>): void {
    collectFloorSourceByPortrait(threadList).forEach((source, portrait) => {
        sourceByPortrait.set(portrait, source);
    });
    const posts = threadList.querySelectorAll<HTMLElement>(".lzl_single_post");
    posts.forEach(post => {
        const ids = getSubPostIds(post);
        if (!ids) return;

        const tail = post.querySelector<HTMLElement>(".lzl_content_reply");
        if (!tail) return;

        const portrait = getSubPostPortrait(post);
        renderSubPostTailInfo(
            tail,
            subPosts.subPostIpById.get(ids.subPostId) ?? (portrait ? userIpByPortrait.get(portrait) : undefined),
            (portrait ? sourceByPortrait.get(portrait) : undefined) ?? sourceBySubPostId.get(ids.subPostId),
        );
        if (post.hasAttribute(SUB_POST_FLAG)) return;

        const count = subPosts.subPostAgreeById.get(ids.subPostId);
        if (count == null) return;
        if (!tail.querySelector(`.${LZL_BADGE_CLASS}`)) {
            const badge = createAgreeBadge(LZL_BADGE_CLASS);
            setBadgeCount(badge, count);
            tail.appendChild(badge);

            if (canAgree()) {
                const liked = subPosts.subPostHasAgreeById.get(ids.subPostId) ?? false;
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

    if (isMobileSource(source) && sourceItem.dataset.tbrPlatform !== "mobile") {
        sourceItem.dataset.tbrPlatform = "mobile";
    } else if (!isMobileSource(source) && sourceItem.dataset.tbrPlatform != null) {
        delete sourceItem.dataset.tbrPlatform;
    }
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

    if (item.textContent !== text) item.textContent = text;
    if (item.title !== text) item.title = text;
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
    const snapshot = await fetchFreshPageSnapshot();
    if (snapshot?.threadAgree == null) return undefined;
    return {
        liked: snapshot.threadHasAgree,
        count: snapshot.threadAgree,
    };
}

async function refreshFloorAgreeState(postId: number): Promise<AgreeActionServerState | undefined> {
    const snapshot = await fetchFreshPageSnapshot();
    const count = snapshot?.postAgreeById.get(postId);
    if (!snapshot || count == null) return undefined;
    return {
        liked: snapshot.postHasAgreeById.get(postId) ?? false,
        count,
    };
}

async function refreshSubPostAgreeState(parentId: number, subPostId: number): Promise<AgreeActionServerState | undefined> {
    let offset = 0;
    for (let batch = 0; batch < NESTED_FLOOR_MAX_BATCHES; batch++) {
        const page = await fetchNestedFloorPage({ tid: PageData.thread.thread_id, pid: parentId, offset });
        const count = page.subPostAgreeById.get(subPostId);
        if (count != null) {
            return {
                liked: page.subPostHasAgreeById.get(subPostId) ?? false,
                count,
            };
        }
        if (!page.hasMore || page.nextOffset <= offset) return undefined;
        offset = page.nextOffset;
    }
    return undefined;
}

function fetchFreshPageSnapshot(): Promise<ThreadPageSnapshot | undefined> {
    const threadList = document.querySelector<HTMLElement>("#j_p_postlist");
    return threadList ? loadPageSnapshot(threadList, true) : Promise.resolve(undefined);
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
    const match = dataField.match(new RegExp(`(?:["']${key}["']|${key})\\s*:\\s*["']?(\\d+)`));
    return parsePostId(match?.[1]);
}

function getClosestFloorPostId(post: HTMLElement): number | undefined {
    const floor = post.closest<HTMLElement>(".l_post");
    return floor ? getFloorPostId(floor) : undefined;
}

function parsePostId(value: unknown): number | undefined {
    const id = typeof value === "string" ? Number(value) : value;
    if (typeof id !== "number") return undefined;
    if (!Number.isFinite(id)) return undefined;
    return id;
}

function createAgreeBadge(className: string): HTMLSpanElement {
    const icon = createLucideIconElement(ThumbsUp, {
        class: "agree-count-icon",
        strokeWidth: 1.75,
    });
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
