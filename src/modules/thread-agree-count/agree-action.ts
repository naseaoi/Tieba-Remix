import { opAgree } from "./api";
import { formatCount } from "./format";
import { toast } from "user-view";

const LIKED_CLASS = "agree-count-liked";
const CLICKABLE_CLASS = "agree-count-clickable";

export interface AgreeActionParams {
    tid: number | string;
    pid?: number | string;
    fid: number | string;
    objType: number;
    tbs: string;
    liked: boolean;
    count: number;
    state?: AgreeActionState;
    refresh?: () => Promise<AgreeActionServerState | undefined>;
    onConfirmed?: (state: AgreeActionServerState) => void;
}

export interface AgreeActionState {
    liked: boolean;
    count: number;
    pending: boolean;
    badges: Set<HTMLElement>;
    confirmedAt?: number;
    mismatchNotified?: boolean;
}

export interface AgreeActionServerState {
    liked: boolean;
    count: number;
}

export function createAgreeActionState(liked: boolean, count: number): AgreeActionState {
    return {
        liked,
        count,
        pending: false,
        badges: new Set(),
    };
}

export function setupAgreeAction(badge: HTMLElement, params: AgreeActionParams): void {
    const state = params.state ?? createAgreeActionState(params.liked, params.count);
    state.badges.add(badge);

    badge.classList.add(CLICKABLE_CLASS);
    badge.setAttribute("role", "button");
    badge.setAttribute("tabindex", "0");
    applyAllStates();

    badge.addEventListener("click", event => {
        event.stopPropagation();
        void toggle();
    });
    badge.addEventListener("keydown", event => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        void toggle();
    });

    function applyState(target: HTMLElement): void {
        target.classList.toggle(LIKED_CLASS, state.liked);
        const value = target.querySelector<HTMLElement>(".agree-count-value");
        if (value) value.textContent = formatCount(state.count);
        target.setAttribute("aria-pressed", String(state.liked));
        target.title = `${state.liked ? "取消点赞" : "点赞"} ${state.count}`;
    }

    function applyAllStates(): void {
        state.badges.forEach(applyState);
    }

    async function toggle(): Promise<void> {
        if (state.pending) return;

        const cancel = state.liked;
        const expectedCount = Math.max(0, state.count + (cancel ? -1 : 1));
        state.pending = true;
        state.liked = !cancel;
        state.count = expectedCount;
        applyAllStates();

        try {
            await opAgree({
                tid: params.tid,
                pid: params.pid,
                fid: params.fid,
                objType: params.objType,
                cancel,
                tbs: params.tbs,
            });

            const latest = await params.refresh?.();
            if (latest) {
                if (latest.liked === cancel) throw new Error(`${cancel ? "取消点赞" : "点赞"}未生效，请稍后重试`);
                state.liked = latest.liked;
                state.count = reconcileCount(latest.count, expectedCount, cancel);
                state.confirmedAt = Date.now();
                state.mismatchNotified = false;
                applyAllStates();
            }
            try {
                params.onConfirmed?.({ liked: state.liked, count: state.count });
            } catch {
                return;
            }
        } catch (err) {
            state.liked = cancel;
            state.count = Math.max(0, state.count + (cancel ? 1 : -1));
            applyAllStates();
            toast({
                message: agreeErrorMessage(err, cancel),
                type: "warning",
                duration: 5000,
            });
            console.warn("[thread-agree-count] 点赞操作失败:", err);
        } finally {
            state.pending = false;
        }
    }
}

function reconcileCount(serverCount: number, expectedCount: number, cancel: boolean): number {
    if (cancel) return Math.min(serverCount, expectedCount);
    return Math.max(serverCount, expectedCount);
}

function agreeErrorMessage(err: unknown, cancel: boolean): string {
    const message = err instanceof Error ? err.message : String(err || "未知错误");
    return `${cancel ? "取消点赞" : "点赞"}失败：${message}`;
}
