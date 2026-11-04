import { describe, expect, it, vi } from "vitest";
import { buildReplyTree, MAX_REPLY_DEPTH, renderLzlReplyTrees } from "./lzl-reply-tree";

describe("buildReplyTree", () => {
    it("多人回复同一人时作为同级子节点并按时间排序", () => {
        const nodes = buildReplyTree([
            { author: "a" },
            { author: "b", target: "a" },
            { author: "c" },
            { author: "d", target: "a" },
            { author: "e", target: "b" },
        ]);

        expect(nodes.map(node => [node.index, node.depth])).toEqual([[0, 0], [1, 1], [4, 2], [3, 1], [2, 0]]);
        expect(nodes.map(node => node.rails)).toEqual([[], ["tee"], ["pass", "elbow"], ["elbow"], []]);
        expect(nodes.map(node => node.hasChildren)).toEqual([true, true, false, false, false]);
        expect(nodes.every(node => node.index === 0 || node.index === 2 || node.linked)).toBe(true);
    });

    it("挂到被回复者最近的一条回复下", () => {
        const nodes = buildReplyTree([
            { author: "a" },
            { author: "a" },
            { author: "b", target: "a" },
        ]);

        expect(nodes.map(node => [node.index, node.depth])).toEqual([[0, 0], [1, 0], [2, 1]]);
    });

    it("真实第 2 楼延续双方对话，旁观者回复独立发言", () => {
        const nodes = buildReplyTree([
            { author: "某螺旋" },
            { author: "2012sos1998" }, // A
            { author: "flffl", target: "2012sos1998" },
            { author: "2012sos1998", target: "flffl" }, // C
            { author: "破碎幻光", target: "2012sos1998" }, // B
            { author: "2012sos1998", target: "破碎幻光" }, // D
            { author: "破碎幻光", target: "2012sos1998" }, // E
            { author: "2012sos1998", target: "破碎幻光" }, // F
            { author: "2012sos1998", target: "破碎幻光" }, // G
            { author: "cjysbok", target: "2012sos1998" },
        ]);
        expect(nodes.map(({ index, depth, linked }) => [index, depth, linked])).toEqual([
            [0, 0, false], [1, 0, false], [2, 1, true], [3, 2, true],
            [4, 1, true], [5, 2, true], [6, 3, true], [7, 4, true],
            [8, 4, true], [9, 1, true],
        ]);
    });

    it("优先最近的双向回复，并按双方别名匹配", () => {
        const nodes = buildReplyTree([
            { author: "a", names: ["甲"], target: "乙" },
            { author: "a", names: ["甲"], target: "b" },
            { author: "a", names: ["甲"] },
            { author: "b", names: ["乙"], target: "甲" },
        ]);
        expect(nodes.map(node => [node.index, node.depth])).toEqual([[0, 0], [1, 0], [3, 1], [2, 0]]);
    });

    it("没有独立发言或双向回复时回退到最近候选", () => {
        const nodes = buildReplyTree([
            { author: "a", target: "x" },
            { author: "a", target: "y" },
            { author: "b", target: "a" },
        ]);
        expect(nodes.map(node => [node.index, node.depth])).toEqual([[0, 0], [1, 0], [2, 1]]);
    });

    it("被回复者不在当前页时保持顶层并标记未连线", () => {
        const [node] = buildReplyTree([{ author: "b", target: "missing" }]);

        expect(node).toMatchObject({ depth: 0, linked: false, rails: [] });
    });

    const chain = (length: number) => Array.from({ length }, (_, i) => ({
        author: i % 2 ? "b" : "a",
        target: i === 0 ? undefined : i % 2 ? "a" : "b",
    }));

    it("超过最大深度的子树折叠到最深可见节点", () => {
        const nodes = buildReplyTree(chain(MAX_REPLY_DEPTH + 3));
        const last = nodes[nodes.length - 1];

        expect(nodes).toHaveLength(MAX_REPLY_DEPTH + 1);
        expect(last).toMatchObject({ index: MAX_REPLY_DEPTH, depth: MAX_REPLY_DEPTH, hasChildren: true, linked: true });
        expect(last.fold).toEqual({ count: 2, rails: [...Array<string>(MAX_REPLY_DEPTH - 1).fill("none"), "none", "elbow"] });
    });

    it("聚焦时以指定回复为根重新计算深度", () => {
        const nodes = buildReplyTree(chain(MAX_REPLY_DEPTH + 3), MAX_REPLY_DEPTH);

        expect(nodes.map(({ index, depth, linked }) => [index, depth, linked])).toEqual([
            [MAX_REPLY_DEPTH, 0, false], [MAX_REPLY_DEPTH + 1, 1, true], [MAX_REPLY_DEPTH + 2, 2, true],
        ]);
        expect(nodes.some(node => node.fold)).toBe(false);
    });
});

describe("renderLzlReplyTrees", () => {
    function post(spid: string, portrait: string, replyTo?: string): string {
        const reply = replyTo ? ` data-tbr-reply-to="${replyTo}"` : "";
        return `<li class="lzl_single_post j_lzl_s_p" data-field="{'spid':'${spid}','portrait':'${portrait}'}"${reply}></li>`;
    }

    it("按树形顺序重排并保持翻页节点在末尾", () => {
        document.body.innerHTML = `
            <ul class="j_lzl_m_w">
                ${post("1", "a")}${post("2", "c")}${post("3", "b", "a?t=1")}
                <li class="lzl_li_pager"></li>
            </ul>
        `;
        renderLzlReplyTrees();

        const items = [...document.querySelectorAll<HTMLElement>("ul > li")];
        expect(items.map(item => item.getAttribute("data-field")?.match(/spid':'(\d)/)?.[1] ?? "pager"))
            .toEqual(["1", "3", "2", "pager"]);
        expect(items[1].style.getPropertyValue("--tbr-lzl-depth")).toBe("1");
        expect(items[1].hasAttribute("data-tbr-lzl-linked")).toBe(true);
        expect(items[0].querySelector(".tbr-lzl-rail-stem")).not.toBeNull();
        expect(items[1].querySelector(".tbr-lzl-rail-elbow")).not.toBeNull();
        expect(items[2].querySelector(".tbr-lzl-rails")).toBeNull();
    });

    it("折叠的隐藏回复不参与建树，展开后并入同一棵树", () => {
        document.body.innerHTML = `
            <ul class="j_lzl_m_w">
                ${post("1", "a")}${post("2", "c")}
                <ul class="lzl_post_hidden" style="display: none">${post("3", "b", "a")}</ul>
                <li class="lzl_li_pager"></li>
            </ul>
        `;
        renderLzlReplyTrees();
        expect(document.querySelectorAll("ul.j_lzl_m_w > li.lzl_single_post")).toHaveLength(2);

        document.querySelector<HTMLElement>(".lzl_post_hidden")!.style.display = "block";
        renderLzlReplyTrees();

        const ids = [...document.querySelectorAll("ul.j_lzl_m_w > li.lzl_single_post")]
            .map(item => item.getAttribute("data-field")?.match(/spid':'(\d)/)?.[1]);
        expect(ids).toEqual(["1", "3", "2"]);
        expect(document.querySelector(".lzl_post_hidden")?.children).toHaveLength(0);
    });

    it("展开后按时间顺序重建，不受首次建树重排影响", () => {
        // 首次建树后 DOM 变为 1,2,4,3，4 是 a 的回复且排在 3 前面
        document.body.innerHTML = `
            <ul class="j_lzl_m_w">
                ${post("1", "a")}${post("2", "b", "a")}${post("3", "c", "a")}${post("4", "a", "b")}
                <ul class="lzl_post_hidden" style="display: none">${post("5", "a", "c")}</ul>
            </ul>
        `;
        renderLzlReplyTrees();
        document.querySelector<HTMLElement>(".lzl_post_hidden")!.style.display = "block";
        renderLzlReplyTrees();

        const items = [...document.querySelectorAll<HTMLElement>("ul.j_lzl_m_w > li.lzl_single_post")];
        const depthOf = (spid: string) => items
            .find(item => item.getAttribute("data-field")?.includes(`'spid':'${spid}'`))!
            .style.getPropertyValue("--tbr-lzl-depth");
        expect(depthOf("3")).toBe("1");
        expect(depthOf("5")).toBe("2");
    });

    it("JSON 格式 data-field 的数字 spid 参与排序", () => {
        document.body.innerHTML = `
            <ul class="j_lzl_m_w">
                <li class="lzl_single_post" data-field='{"spid":20,"portrait":"b"}' data-tbr-reply-to="a"></li>
                <li class="lzl_single_post" data-field='{"spid":10,"portrait":"a"}'></li>
            </ul>
        `;
        renderLzlReplyTrees();

        const [first, second] = document.querySelectorAll<HTMLElement>("li");
        expect(first.getAttribute("data-field")).toContain('"spid":10');
        expect(second.style.getPropertyValue("--tbr-lzl-depth")).toBe("1");
    });

    it("回复对象只有用户名时按 user_name 挂入树", () => {
        document.body.innerHTML = `
            <ul class="j_lzl_m_w">
                <li class="lzl_single_post" data-field="{'spid':'1','user_name':'甲','portrait':'a'}"></li>
                <li class="lzl_single_post" data-field="{'spid':'2','user_name':'乙','portrait':'b'}" data-tbr-reply-to="甲"></li>
            </ul>
        `;
        renderLzlReplyTrees();

        const reply = document.querySelectorAll<HTMLElement>("li")[1];
        expect(reply.style.getPropertyValue("--tbr-lzl-depth")).toBe("1");
        expect(reply.hasAttribute("data-tbr-lzl-linked")).toBe(true);
    });

    it("建树前按 spid 去重，保持末尾分页和原节点", () => {
        document.body.innerHTML = `<ul class="j_lzl_m_w">${post("1", "a")}${post("2", "b", "a")}
            <li class="lzl_single_post" data-field='{"spid":2,"portrait":"b"}'></li>
            <li class="lzl_li_pager"></li></ul>`;
        const first = document.querySelector("li");
        renderLzlReplyTrees();
        expect(document.querySelectorAll(".lzl_single_post")).toHaveLength(2);
        expect(document.querySelector("li")).toBe(first);
        expect(document.querySelector("ul")?.lastElementChild?.className).toBe("lzl_li_pager");
    });

    it("树序中最新回复不在末尾时重建仍把分页留在最后", () => {
        document.body.innerHTML = `<ul class="j_lzl_m_w">${post("1", "a")}${post("2", "c")}${post("3", "b", "a")}<li class="lzl_li_pager"></li></ul>`;
        renderLzlReplyTrees();
        document.querySelector("li")!.removeAttribute("data-tbr-lzl-tree");
        renderLzlReplyTrees();
        expect([...document.querySelectorAll<HTMLElement>("ul > li")].map(item => item.getAttribute("data-field")?.match(/spid':'(\d)/)?.[1] ?? "pager"))
            .toEqual(["1", "3", "2", "pager"]);
    });

    it("JSON 转义的用户名参与匹配", () => {
        document.body.innerHTML = `<ul class="j_lzl_m_w"><li class="lzl_single_post" data-field='{"spid":1,"portrait":"a","user_name":"\\u7532"}'></li>${post("2", "b", "甲")}</ul>`;
        renderLzlReplyTrees();
        expect(document.querySelectorAll<HTMLElement>("li")[1].hasAttribute("data-tbr-lzl-linked")).toBe(true);
    });

    it("折叠行展开为聚焦视图，返回后恢复完整树", () => {
        const spids = Array.from({ length: MAX_REPLY_DEPTH + 3 }, (_, i) => i + 1);
        document.body.innerHTML = `<ul class="j_lzl_m_w">${spids.map((spid, i) =>
            post(String(spid), i % 2 ? "b" : "a", i === 0 ? undefined : i % 2 ? "a" : "b")).join("")}<li class="lzl_li_pager"></li></ul>`;
        renderLzlReplyTrees();

        const list = document.querySelector<HTMLElement>("ul")!;
        const visibleIds = () => [...list.querySelectorAll<HTMLElement>(":scope > li.lzl_single_post:not([hidden])")]
            .map(item => Number(item.getAttribute("data-field")?.match(/spid':'(\d+)/)?.[1]));
        expect(visibleIds()).toEqual(spids.slice(0, MAX_REPLY_DEPTH + 1));
        const fold = list.querySelector<HTMLElement>(".tbr-lzl-fold")!;
        expect(fold.textContent).toContain("2");
        expect(fold.style.getPropertyValue("--tbr-lzl-depth")).toBe(String(MAX_REPLY_DEPTH + 1));
        expect(list.lastElementChild?.className).toBe("lzl_li_pager");

        fold.querySelector("button")!.click();
        expect(visibleIds()).toEqual(spids.slice(MAX_REPLY_DEPTH));
        expect(list.firstElementChild?.classList.contains("tbr-lzl-focus-back")).toBe(true);
        const root = list.querySelector<HTMLElement>(":scope > li.lzl_single_post:not([hidden])")!;
        expect(root.style.getPropertyValue("--tbr-lzl-depth")).toBe("0");
        expect(root.hasAttribute("data-tbr-lzl-linked")).toBe(false);
        expect(root.hasAttribute("data-tbr-lzl-static")).toBe(true);

        list.querySelector<HTMLElement>(".tbr-lzl-focus-back button")!.click();
        expect(visibleIds()).toEqual(spids.slice(0, MAX_REPLY_DEPTH + 1));
        expect(list.querySelector(".tbr-lzl-focus-back")).toBeNull();
        expect(list.querySelectorAll(".tbr-lzl-fold")).toHaveLength(1);
    });

    it("observer 回调不读取计算样式，已建树列表不再解析回复", () => {
        document.body.innerHTML = `<ul class="j_lzl_m_w">${post("1", "a")}${post("2", "b", "a")}
            <ul class="lzl_post_hidden">${post("3", "c")}</ul></ul>`;
        renderLzlReplyTrees();
        const computed = vi.spyOn(window, "getComputedStyle");
        const getAttribute = vi.spyOn(Element.prototype, "getAttribute");

        renderLzlReplyTrees();

        expect(computed).not.toHaveBeenCalled();
        expect(getAttribute.mock.calls.some(([name]) => name === "data-field")).toBe(false);
        computed.mockRestore();
        getAttribute.mockRestore();
    });

    it("新回复加入后重建连线而不重复插入", () => {
        document.body.innerHTML = `<ul class="j_lzl_m_w">${post("1", "a")}</ul>`;
        renderLzlReplyTrees();
        document.querySelector("ul")!.insertAdjacentHTML("beforeend", post("2", "b", "a"));
        renderLzlReplyTrees();

        const first = document.querySelector<HTMLElement>("li")!;
        expect(first.querySelectorAll(".tbr-lzl-rails")).toHaveLength(1);
        expect(first.querySelector(".tbr-lzl-rail-stem")).not.toBeNull();
    });
});
