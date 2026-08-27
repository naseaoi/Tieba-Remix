import { fetchAgreeSnapshot } from "@/modules/thread-agree-count/api";
import { mergeRecentThreadAgreeState } from "@/modules/thread-agree-count/recent-state";

export interface ForumAgreeState {
    count: number;
    liked: boolean;
}

interface ForumAgreeTarget {
    tid: number;
    onLoaded: (state: ForumAgreeState) => void;
    onFailed: () => void;
}

interface QueuedRequest {
    target: Element;
    start: () => void;
}

const MAX_BACKGROUND_REQUESTS = 4;
const MAX_VISIBLE_REQUESTS = 6;
const agreeCache = new Map<number, ForumAgreeState>();
const agreeRequests = new Map<number, Promise<ForumAgreeState>>();
const agreeTargets = new WeakMap<Element, ForumAgreeTarget>();
const requestQueue: QueuedRequest[] = [];

let activeRequests = 0;
let agreeObserver: IntersectionObserver | undefined;

export function observeForumAgree(
    target: Element,
    tid: number,
    onLoaded: (state: ForumAgreeState) => void,
    onFailed: () => void,
): void {
    const cached = agreeCache.get(tid);
    if (cached) {
        onLoaded(cached);
        return;
    }

    agreeTargets.set(target, { tid, onLoaded, onFailed });
    getAgreeObserver().observe(target);
}

export function unobserveForumAgree(target: Element): void {
    agreeObserver?.unobserve(target);
    agreeTargets.delete(target);
}

function getAgreeObserver(): IntersectionObserver {
    agreeObserver ??= new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const target = agreeTargets.get(entry.target);
            if (!target) return;

            agreeObserver?.unobserve(entry.target);
            agreeTargets.delete(entry.target);
            void loadForumAgree(target.tid, entry.target).then(state => {
                target.onLoaded(state);
            }, () => {
                target.onFailed();
            }).catch(() => undefined);
        });
    }, { rootMargin: "1000px 0px" });
    return agreeObserver;
}

function loadForumAgree(tid: number, target: Element): Promise<ForumAgreeState> {
    const cached = agreeCache.get(tid);
    if (cached) return Promise.resolve(cached);

    const pending = agreeRequests.get(tid);
    if (pending) return pending;

    const request = enqueueRequest(target, async () => {
        const snapshot = await fetchAgreeSnapshot({ tid, pn: 1, rn: 1, lzOnly: false });
        const state = mergeRecentThreadAgreeState(tid, {
            count: snapshot.threadAgree ?? 0,
            liked: snapshot.threadHasAgree,
        });
        agreeCache.set(tid, state);
        return state;
    }).finally(() => {
        agreeRequests.delete(tid);
    });
    agreeRequests.set(tid, request);
    return request;
}

function enqueueRequest<T>(target: Element, request: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        requestQueue.push({
            target,
            start: () => {
                activeRequests++;
                void request().then(resolve, reject).finally(() => {
                    activeRequests--;
                    drainRequestQueue();
                });
            },
        });
        drainRequestQueue();
    });
}

// 每轮只批量读一次布局，避免出队循环里反复 getBoundingClientRect 触发强制回流
function drainRequestQueue(): void {
    if (requestQueue.length === 0) return;
    if (activeRequests >= MAX_VISIBLE_REQUESTS) return;

    const viewportHeight = window.innerHeight;
    const metrics = requestQueue.map(queued => measure(queued.target, viewportHeight));
    const order = metrics
        .map((metric, index) => ({ index, metric }))
        .sort((a, b) => a.metric.priority - b.metric.priority);

    let projected = activeRequests;
    const started = new Set<number>();
    for (const { index, metric } of order) {
        const limit = metric.visible ? MAX_VISIBLE_REQUESTS : MAX_BACKGROUND_REQUESTS;
        if (projected >= limit) break;
        started.add(index);
        projected++;
    }
    if (started.size === 0) return;

    const pending = requestQueue.filter((_, index) => started.has(index));
    const remaining = requestQueue.filter((_, index) => !started.has(index));
    requestQueue.length = 0;
    requestQueue.push(...remaining);
    pending.forEach(queued => { queued.start(); });
}

function measure(target: Element, viewportHeight: number): { priority: number; visible: boolean } {
    const rect = target.getBoundingClientRect();
    const visible = rect.bottom > 0 && rect.top < viewportHeight;
    if (visible) {
        const targetCenter = (rect.top + rect.bottom) / 2;
        return { priority: Math.abs(targetCenter - viewportHeight / 2), visible };
    }
    if (rect.bottom <= 0) return { priority: viewportHeight + Math.abs(rect.bottom), visible };
    return { priority: viewportHeight + Math.max(0, rect.top - viewportHeight), visible };
}
