import { describe, expect, it } from "vitest";
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

    it("被回复者不在当前页时保持顶层并标记未连线", () => {
        const [node] = buildReplyTree([{ author: "b", target: "missing" }]);

        expect(node).toMatchObject({ depth: 0, linked: false, rails: [] });
    });

    it("超过最大深度时提升为同级并保留回复标签", () => {
        const items = Array.from({ length: MAX_REPLY_DEPTH + 2 }, (_, i) => ({
            author: i % 2 ? "b" : "a",
            target: i === 0 ? undefined : i % 2 ? "a" : "b",
        }));
        const nodes = buildReplyTree(items);
        const last = nodes[nodes.length - 1];

        expect(Math.max(...nodes.map(node => node.depth))).toBe(MAX_REPLY_DEPTH);
        expect(last).toMatchObject({ depth: MAX_REPLY_DEPTH, linked: false });
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
