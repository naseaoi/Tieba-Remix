import { opAgree } from "./api";
import { formatCount } from "./format";

const LIKED_CLASS = "agree-count-liked";
const CLICKABLE_CLASS = "agree-count-clickable";

export interface AgreeActionParams {
    tid: number | string;
    pid: number | string;
    objType: number;
    tbs: string;
    liked: boolean;
    count: number;
}

export function setupAgreeAction(badge: HTMLElement, params: AgreeActionParams): void {
    const state = { liked: params.liked, count: params.count, pending: false };

    badge.classList.add(CLICKABLE_CLASS);
    badge.setAttribute("role", "button");
    badge.setAttribute("tabindex", "0");
    applyState();

    badge.addEventListener("click", event => {
        event.stopPropagation();
        void toggle();
    });
    badge.addEventListener("keydown", event => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        void toggle();
    });

    function applyState(): void {
        badge.classList.toggle(LIKED_CLASS, state.liked);
        const value = badge.querySelector<HTMLElement>(".agree-count-value");
        if (value) value.textContent = formatCount(state.count);
        badge.setAttribute("aria-pressed", String(state.liked));
        badge.title = `${state.liked ? "取消点赞" : "点赞"} ${state.count}`;
    }

    async function toggle(): Promise<void> {
        if (state.pending) return;

        const cancel = state.liked;
        state.pending = true;
        state.liked = !cancel;
        state.count = Math.max(0, state.count + (cancel ? -1 : 1));
        applyState();

        try {
            await opAgree({
                tid: params.tid,
                pid: params.pid,
                objType: params.objType,
                cancel,
                tbs: params.tbs,
            });
        } catch (err) {
            state.liked = cancel;
            state.count = Math.max(0, state.count + (cancel ? 1 : -1));
            applyState();
            console.warn("[thread-agree-count] 点赞操作失败:", err);
        } finally {
            state.pending = false;
        }
    }
}
