import { describe, expect, it } from "vitest";
import { buildReplyPrefix, extractReplyPrefix } from "./lzl-reply-composer";

function editorBody(html: string): HTMLElement {
    document.body.innerHTML = `<div class="editor_lzl_container" contenteditable="true">${html}</div>`;
    return document.querySelector<HTMLElement>(".editor_lzl_container")!;
}

const NATIVE_PREFIX = `回复&nbsp;<span class="ubb_showname" portrait="tb.1.abc" showname="%E7%9B%AE%E6%A0%87" use="reply">目标</span>&nbsp;:`;

describe("extractReplyPrefix", () => {
    it("移除原生回复前缀并返回回复对象", () => {
        const body = editorBody(NATIVE_PREFIX);

        expect(extractReplyPrefix(body)).toEqual({ portrait: "tb.1.abc", showname: "%E7%9B%AE%E6%A0%87", name: "目标" });
        expect(body.innerHTML).toBe("");
    });

    it("保留前缀后已有的正文", () => {
        const body = editorBody(`${NATIVE_PREFIX}好的<img class="BDE_Smiley">`);

        extractReplyPrefix(body);
        expect(body.innerHTML).toBe(`好的<img class="BDE_Smiley">`);
    });

    it("忽略非回复用途的昵称和普通正文", () => {
        expect(extractReplyPrefix(editorBody(`回复 <span class="ubb_showname" use="at">x</span> :`))).toBeNull();
        expect(extractReplyPrefix(editorBody("回复一下"))).toBeNull();
    });
});

describe("buildReplyPrefix", () => {
    it("生成与原生 _getHtml 一致的前缀并转义属性", () => {
        expect(buildReplyPrefix({ portrait: "tb.1.abc", showname: "%E7%9B%AE", name: "<a>&" }))
            .toBe(`回复 <span class="ubb_showname" portrait="tb.1.abc" showname="%E7%9B%AE" use="reply">&#60;a&#62;&#38;</span> :`);
    });
});
