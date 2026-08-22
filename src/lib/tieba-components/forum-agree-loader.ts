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

function drainRequestQueue(): void {
    while (requestQueue.length > 0) {
        const index = findHighestPriorityRequest();
        const queued = requestQueue[index];
        const limit = isVisible(queued.target) ? MAX_VISIBLE_REQUESTS : MAX_BACKGROUND_REQUESTS;
        if (activeRequests >= limit) return;
        requestQueue.splice(index, 1);
        queued.start();
    }
}

function findHighestPriorityRequest(): number {
    let bestIndex = 0;
    let bestPriority = viewportPriority(requestQueue[0].target);
    for (let index = 1; index < requestQueue.length; index++) {
        const priority = viewportPriority(requestQueue[index].target);
        if (priority < bestPriority) {
            bestIndex = index;
            bestPriority = priority;
        }
    }
    return bestIndex;
}

function viewportPriority(target: Element): number {
    const rect = target.getBoundingClientRect();
    const viewportCenter = window.innerHeight / 2;
    const targetCenter = (rect.top + rect.bottom) / 2;
    if (isVisible(target)) return Math.abs(targetCenter - viewportCenter);
    if (rect.bottom <= 0) return window.innerHeight + Math.abs(rect.bottom);
    return window.innerHeight + Math.max(0, rect.top - window.innerHeight);
}

function isVisible(target: Element): boolean {
    const rect = target.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < window.innerHeight;
}
