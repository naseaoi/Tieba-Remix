import { UserKeyTS } from "@/lib/user-values";

const RECENT_STATE_TTL = 5 * 60 * 1000;

export interface ThreadAgreeState {
    liked: boolean;
    count: number;
}

interface StoredThreadAgreeState extends ThreadAgreeState {
    updatedAt: number;
}

const recentThreadAgreeStates = new UserKeyTS<Record<string, StoredThreadAgreeState>>(
    "threadAgreeRecentStates",
    {},
);

function getViewerKey(): string {
    return String(PageData.user?.portrait || PageData.user?.user_name || "anonymous");
}

function getThreadKey(tid: number | string): string {
    return `${getViewerKey()}:${String(tid)}`;
}

export function saveRecentThreadAgreeState(tid: number | string, state: ThreadAgreeState): void {
    if (!Number.isSafeInteger(Number(tid)) || !Number.isFinite(state.count) || state.count < 0) return;

    recentThreadAgreeStates.set({
        ...recentThreadAgreeStates.get(),
        [getThreadKey(tid)]: {
            liked: state.liked,
            count: state.count,
            updatedAt: Date.now(),
        },
    }, Date.now() + RECENT_STATE_TTL);
}

export function mergeRecentThreadAgreeState(tid: number | string, serverState: ThreadAgreeState): ThreadAgreeState {
    const recent = recentThreadAgreeStates.get()[getThreadKey(tid)];
    if (!recent || Date.now() - recent.updatedAt > RECENT_STATE_TTL) return serverState;

    if (recent.liked) {
        return {
            liked: true,
            count: Math.max(serverState.count, recent.count),
        };
    }

    return {
        liked: false,
        count: Math.min(serverState.count, recent.count),
    };
}
