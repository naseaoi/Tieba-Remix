import { describe, expect, it, vi } from "vitest";
import { blockAdScrollTrackers, unbindWindowHandlers, type JQueryEventHost } from "./thread-native-scroll-block";

// 需要与原生压缩代码一致的函数源码
const allPostTracker = new Function("n", "e", "a", "i", "return function(){n()&&e()&&(clearTimeout(a),a=setTimeout(i,200))}")();
const viewTracker = new Function("d", "n", "r", "return function(){d()&&(clearTimeout(n),n=setTimeout(r,200))}")();

type Bound = Record<string, { handler: (...args: unknown[]) => unknown }[]>;

function fakeJQuery(bound: Bound) {
    const off = vi.fn();
    const add = vi.fn();
    const jquery = Object.assign(() => ({ off }), {
        _data: () => bound,
        event: { add },
    }) as unknown as JQueryEventHost;
    return { jquery, off, add };
}

describe("blockAdScrollTrackers", () => {
    it("移除已绑定并拦截后续绑定的广告曝光滚动统计，其余处理函数照常绑定", () => {
        const normal = () => undefined;
        const { jquery, off, add } = fakeJQuery({ scroll: [{ handler: allPostTracker }, { handler: normal }] });

        blockAdScrollTrackers(jquery, window);

        expect(off).toHaveBeenCalledExactlyOnceWith("scroll", allPostTracker);
        jquery.event.add(window, "scroll", viewTracker);
        jquery.event.add(window, "scroll", normal);
        jquery.event.add(document, "scroll", viewTracker);
        jquery.event.add(window, "resize", allPostTracker);
        expect(add.mock.calls.map(([elem, type, handler]) => [elem, type, handler])).toEqual([
            [window, "scroll", normal],
            [document, "scroll", viewTracker],
            [window, "resize", allPostTracker],
        ]);
    });
});

describe("unbindWindowHandlers", () => {
    it("按事件类型解绑匹配的处理函数", () => {
        const fixSize = Object.assign(() => undefined, { guid: 7 });
        const other = Object.assign(() => undefined, { guid: 8 });
        const { jquery, off } = fakeJQuery({ scroll: [{ handler: other }, { handler: fixSize }], resize: [{ handler: fixSize }] });

        unbindWindowHandlers(jquery, window, ["scroll", "resize"], handler => (handler as { guid?: number }).guid === 7);

        expect(off.mock.calls).toEqual([["scroll", fixSize], ["resize", fixSize]]);
    });
});
