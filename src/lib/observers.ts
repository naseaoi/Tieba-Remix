import { dom } from "./elemental";

export class TbObserver {
    constructor(selector: string, options?: MutationObserverInit, initEvent?: keyof WindowEventMap) {
        this.selector = selector;
        this.options = options;
        this.initEvent = initEvent;
    }

    private readonly selector: string;
    private readonly options: MutationObserverInit | undefined;
    private readonly initEvent: keyof WindowEventMap | undefined;
    private observer: MutationObserver | undefined;
    private observedElement: Element | undefined;
    private initEventObserved = false;
    private initEventFired = false;

    readonly events: (() => void)[] = [];

    /** 手动触发所有已注册的事件 */
    public emit() {
        this.events.forEach(func => this.runEvent(func));
    }

    public observe() {
        const obsElem = dom(this.selector);
        if (this.observer && this.observedElement === obsElem) return;

        if (typeof this.initEvent !== "undefined" && !this.initEventObserved) {
            window.addEventListener(this.initEvent, () => {
                this.initEventFired = true;
                this.emit();
            }, { once: true });
            this.initEventObserved = true;
        }

        this.observer?.disconnect();
        this.observer = undefined;
        this.observedElement = undefined;

        if (!obsElem) return;

        this.observer = new MutationObserver(() => this.emit());
        this.observer.observe(obsElem, this.options);
        this.observedElement = obsElem;
    }

    public addEvent(...events: (() => void)[]) {
        events.forEach(event => {
            if (this.events.includes(event)) return;
            if (typeof this.initEvent === "undefined") {
                this.runEvent(event);
            } else if (this.initEventFired) {
                this.runEvent(event);
            }
            this.events.push(event);
        });
    }

    private runEvent(event: () => void) {
        try {
            event();
        } catch (error) {
            console.error(`[Tieba Remix] Observer 回调执行失败: ${this.selector}`, error);
        }
    }
}

/** 帖子页面 楼层监控 */
export const threadFloorsObserver = new TbObserver("#j_p_postlist", { childList: true });
/** 帖子页面 楼中楼监控 */
export const threadCommentsObserver = new TbObserver("#j_p_postlist", { childList: true, subtree: true });
/** 旧版主页 推送监控 */
export const legacyIndexFeedsObserver = new TbObserver("#new_list", { childList: true });
/** 进吧页面 贴子监控 */
export const forumThreadsObserver = new TbObserver("#pagelet_frs-list\\/pagelet\\/thread", { childList: true, subtree: true });
