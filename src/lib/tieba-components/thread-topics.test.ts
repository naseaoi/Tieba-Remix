import { describe, expect, it, vi } from "vitest";
import { renderThreadTopics, tokenizeTopics, type TopicSegment } from "./thread-topics";

vi.mock("@/lib/api/remixed", () => ({ currentPageType: () => "thread" }));

const topics = (segments: TopicSegment[]) => tokenizeTopics(segments).filter(token => token.topic).map(token => [token.text, token.topic]);

describe("话题切分", () => {
    it("连写的话题共用 # 分隔，并保留服务端已识别的话题", () => {
        expect(topics([
            { text: "#强制#", topic: "强制" },
            { text: "猎奇" },
            { text: "#孙笑川#", topic: "孙笑川" },
            { text: "兔耳娘#机娘" },
        ])).toEqual([
            ["#强制", "强制"],
            ["#猎奇", "猎奇"],
            ["#孙笑川", "孙笑川"],
            ["#兔耳娘", "兔耳娘"],
            ["#机娘", "机娘"],
        ]);
    });

    it("闭合的话题后接正文时保留闭合符", () => {
        expect(tokenizeTopics([{ text: "#话题# 正文" }])).toEqual([
            { text: "#话题#", topic: "话题" },
            { text: " 正文" },
        ]);
        expect(topics([{ text: "#话题#正文很长，后面还有" }])).toEqual([["#话题#", "话题"]]);
    });

    it("「#话题」以空白或结尾收束，后接标点、纯数字或紧跟字母数字时不识别", () => {
        expect(topics([{ text: "看看 #机娘 和 #兔耳娘" }])).toEqual([["#机娘", "机娘"], ["#兔耳娘", "兔耳娘"]]);
        expect(topics([{ text: "#机娘，好看" }])).toEqual([]);
        expect(topics([{ text: "回复 #3" }])).toEqual([]);
        expect(topics([{ text: "C#语言" }])).toEqual([]);
    });

    it("服务端识别的含空格话题保持完整", () => {
        expect(topics([{ text: "#机娘" }, { text: "#Hello World#", topic: "Hello World" }])).toEqual([
            ["#机娘", "机娘"],
            ["#Hello World#", "Hello World"],
        ]);
    });
});

describe("楼层话题渲染", () => {
    const topicHref = (name: string) => `http://tieba.baidu.com/hottopic/browse/hottopic?topic_id=0&topic_name=${encodeURIComponent(name)}&is_video_topic=0`;

    it("重写话题链接并移除嵌套解析出的空链接，表情截断话题", () => {
        document.body.innerHTML = `<div class="d_post_content"> <a href="${topicHref("强制")}"></a><a href="${topicHref("强制")}">#强制#</a>猎奇<a href="${topicHref("孙笑川")}"></a><a href="${topicHref("孙笑川")}">#孙笑川#</a>兔耳娘#机娘<img class="BDE_Smiley">#表情后</div>`;
        renderThreadTopics();

        const content = document.querySelector(".d_post_content")!;
        const links = [...content.querySelectorAll("a")];
        expect(links.map(link => link.textContent)).toEqual(["#强制", "#猎奇", "#孙笑川", "#兔耳娘", "#机娘", "#表情后"]);
        expect(new URL(links[1].href).searchParams.get("topic_name")).toBe("猎奇");
        expect(content.textContent).toBe(" #强制#猎奇#孙笑川#兔耳娘#机娘#表情后");
        expect(content.querySelector("img")?.previousSibling).toBe(links[4]);
    });

    it("无需调整的内容保持原节点", () => {
        document.body.innerHTML = `<div class="lzl_cnt"><span class="lzl_content_main">正文<a href="${topicHref("话题")}">#话题#</a> 结尾</span></div>`;
        const link = document.querySelector("a");
        renderThreadTopics();
        expect(document.querySelector("a")).toBe(link);
    });
});
