import { beforeEach, describe, expect, it, vi } from "vitest";

const apiMocks = vi.hoisted(() => ({
    fetchAgreeSnapshot: vi.fn(),
}));

vi.mock("@/modules/thread-agree-count/api", () => ({
    fetchAgreeSnapshot: apiMocks.fetchAgreeSnapshot,
}));

vi.mock("@/modules/thread-agree-count/recent-state", () => ({
    mergeRecentThreadAgreeState: (_tid: number, state: unknown) => state,
}));

describe("forum agree loader", () => {
    beforeEach(() => {
        vi.resetModules();
        apiMocks.fetchAgreeSnapshot.mockReset();
        Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 });
    });

    it("shares one observer, limits background requests, and reuses duplicate tids", async () => {
        const observers = installFakeIntersectionObserver();

        let active = 0;
        let maxActive = 0;
        const resolvers: Array<() => void> = [];
        apiMocks.fetchAgreeSnapshot.mockImplementation(() => new Promise(resolve => {
            active++;
            maxActive = Math.max(maxActive, active);
            resolvers.push(() => {
                active--;
                resolve({ threadAgree: 1, threadHasAgree: false });
            });
        }));

        const { observeForumAgree } = await import("./forum-agree-loader");
        const targets = Array.from({ length: 6 }, () => document.createElement("div"));
        targets.forEach((target, index) => setRect(target, 1200 + index * 100));
        const loaded: number[] = [];
        [1, 2, 3, 4, 5, 5].forEach((tid, index) => {
            observeForumAgree(targets[index], tid, () => loaded.push(tid), vi.fn());
        });

        expect(observers).toHaveLength(1);
        observers[0].emit(targets);
        expect(apiMocks.fetchAgreeSnapshot).toHaveBeenCalledTimes(4);
        expect(maxActive).toBe(4);

        resolvers.shift()?.();
        await vi.waitFor(() => {
            expect(apiMocks.fetchAgreeSnapshot).toHaveBeenCalledTimes(5);
        });

        while (resolvers.length > 0) {
            resolvers.shift()?.();
            await Promise.resolve();
        }
        await vi.waitFor(() => {
            expect(loaded).toHaveLength(6);
        });
        expect(apiMocks.fetchAgreeSnapshot).toHaveBeenCalledTimes(5);
        expect(loaded.filter(tid => tid === 5)).toHaveLength(2);
    });

    it("prioritizes visible targets and temporarily expands to six requests", async () => {
        const observers = installFakeIntersectionObserver();
        const resolvers = new Map<number, () => void>();
        let active = 0;
        let maxActive = 0;
        apiMocks.fetchAgreeSnapshot.mockImplementation(({ tid }: { tid: number }) => new Promise(resolve => {
            active++;
            maxActive = Math.max(maxActive, active);
            resolvers.set(tid, () => {
                active--;
                resolve({ threadAgree: tid, threadHasAgree: false });
            });
        }));

        const { observeForumAgree } = await import("./forum-agree-loader");
        const targets = Array.from({ length: 8 }, () => document.createElement("div"));
        targets.slice(0, 6).forEach((target, index) => setRect(target, 1400 + index * 100));
        targets.slice(6).forEach((target, index) => setRect(target, 300 + index * 100));
        targets.forEach((target, index) => {
            observeForumAgree(target, index + 1, vi.fn(), vi.fn());
        });

        observers[0].emit(targets.slice(0, 6));
        expect(apiMocks.fetchAgreeSnapshot.mock.calls.map(([request]) => request.tid)).toEqual([1, 2, 3, 4]);

        observers[0].emit(targets.slice(6));
        expect(apiMocks.fetchAgreeSnapshot.mock.calls.map(([request]) => request.tid)).toEqual([1, 2, 3, 4, 7, 8]);
        expect(maxActive).toBe(6);

        resolvers.get(7)?.();
        resolvers.get(8)?.();
        await Promise.resolve();
        await Promise.resolve();
        expect(apiMocks.fetchAgreeSnapshot).toHaveBeenCalledTimes(6);

        resolvers.get(1)?.();
        await vi.waitFor(() => {
            expect(apiMocks.fetchAgreeSnapshot.mock.calls.map(([request]) => request.tid)).toContain(5);
        });

        for (const resolve of resolvers.values()) resolve();
        await Promise.resolve();
    });
});

function installFakeIntersectionObserver(): FakeIntersectionObserver[] {
    const observers: FakeIntersectionObserver[] = [];
    vi.stubGlobal("IntersectionObserver", class extends FakeIntersectionObserver {
        constructor(callback: IntersectionObserverCallback) {
            super(callback);
            observers.push(this);
        }
    });
    return observers;
}

function setRect(target: Element, top: number, height = 80): void {
    target.getBoundingClientRect = () => ({
        top,
        bottom: top + height,
        left: 0,
        right: 100,
        width: 100,
        height,
        x: 0,
        y: top,
        toJSON: () => undefined,
    });
}

class FakeIntersectionObserver {
    constructor(private readonly callback: IntersectionObserverCallback) {}

    observe(): void {}
    unobserve(): void {}
    emit(targets: Element[]): void {
        const entries = targets.map(target => ({ isIntersecting: true, target }) as IntersectionObserverEntry);
        this.callback(entries, this as unknown as IntersectionObserver);
    }
}
