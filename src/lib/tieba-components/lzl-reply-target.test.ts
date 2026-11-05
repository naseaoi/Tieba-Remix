import { describe, expect, it } from "vitest";
import { renderLzlReplyTargets } from "./lzl-reply-target";

function setup(content: string): HTMLElement {
    document.body.innerHTML = `
        <div class="lzl_cnt">
            <a class="at j_user_card" href="/home/main?id=author">作者</a>
            <span class="lzl_content_main">${content}</span>
            <div class="lzl_content_reply"></div>
        </div>
    `;
    renderLzlReplyTargets();
    return document.querySelector<HTMLElement>(".lzl_cnt")!;
}

describe("renderLzlReplyTargets", () => {
    it("把回复对象移到作者名后并去掉前缀", () => {
        const cnt = setup(`回复 <a href="" portrait="tb.1.abc" class="at">目标</a> :没事，可以用嘴`);

        const label = cnt.querySelector(".tbr-lzl-reply-target")!;
        expect(label.previousElementSibling?.textContent).toBe("作者");
        expect(label.querySelector("svg")).not.toBeNull();
        expect(label.querySelector<HTMLAnchorElement>(".at")?.getAttribute("href"))
            .toBe("/home/main?id=tb.1.abc&ie=utf-8&fr=pb");
        expect(cnt.querySelector(".lzl_content_main")?.innerHTML).toBe("没事，可以用嘴");
    });

    it("支持全角冒号并保留正文中的其他节点", () => {
        const cnt = setup(`回复 <a class="at" href="/home/main?id=x">目标</a>：<img class="BDE_Smiley">好`);

        expect(cnt.querySelector(".tbr-lzl-reply-target .at")?.getAttribute("href")).toBe("/home/main?id=x");
        expect(cnt.querySelector(".lzl_content_main")?.innerHTML).toBe(`<img class="BDE_Smiley">好`);
    });

    it("目标链接没有 portrait 时读 data-field 中的 un", () => {
        document.body.innerHTML = `
            <li class="lzl_single_post">
                <div class="lzl_cnt">
                    <a class="at j_user_card" href="/home/main?id=author">作者</a>
                    <span class="lzl_content_main">回复 <a class="at" href="" data-field='{"un":"用户名","id":""}'>用户名</a> :正文</span>
                </div>
            </li>
        `;
        renderLzlReplyTargets();

        expect(document.querySelector<HTMLElement>("li")?.dataset.tbrReplyTo).toBe("用户名");
    });

    it("目标链接只有文字时以其作为用户名并补齐主页链接", () => {
        document.body.innerHTML = `
            <li class="lzl_single_post">
                <div class="lzl_cnt">
                    <a class="at j_user_card" href="/home/main?id=author">作者</a>
                    <span class="lzl_content_main">回复 <a class="at is-tagged" href="" username="">用户名</a> :正文</span>
                </div>
            </li>
        `;
        renderLzlReplyTargets();

        expect(document.querySelector<HTMLElement>("li")?.dataset.tbrReplyTo).toBe("用户名");
        expect(document.querySelector(".tbr-lzl-reply-target .at")?.getAttribute("href"))
            .toBe(`/home/main?un=${encodeURIComponent("用户名")}&ie=utf-8&fr=pb`);
    });

    it("正文不是回复格式时保持原样", () => {
        const html = `回复一下 <a class="at" href="">某人</a> 看看`;
        const cnt = setup(html);

        expect(cnt.querySelector(".tbr-lzl-reply-target")).toBeNull();
        expect(cnt.querySelector(".lzl_content_main")?.innerHTML).toBe(html);
    });

    it("同一节点只处理一次", () => {
        const cnt = setup(`回复 <a class="at" href="">目标</a> :正文`);
        renderLzlReplyTargets();

        expect(cnt.querySelectorAll(".tbr-lzl-reply-target")).toHaveLength(1);
    });
});
