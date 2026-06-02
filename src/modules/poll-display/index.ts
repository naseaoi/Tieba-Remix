import { asyncdom } from "@/lib/elemental";
import { appendJSX } from "@/lib/render/jsx-extension";
import _ from "@/lib/utils/_";
import { h } from "vue";
import { fetchPollInfo, type PollInfo } from "./api";
import PollPanel from "./panel.vue";

const FLAG_ATTR = "data-poll-display-injected";

export default {
    id: "poll-display",
    name: "投票面板",
    author: "Tieba-Remix",
    version: "1.0",
    brief: "在帖子首楼底部展示官方投票数据",
    description: "网页端贴吧不显示投票模块，本模块通过 App 端接口拉取投票数据，并在首楼底部以只读形式渲染选项、票数与进度条。投票操作请在贴吧 App 内进行。",
    scope: ["thread"],
    runAt: "DOMLoaded",
    entry: main,
} as UserModule;

async function main(): Promise<void> {
    if (PageData?.pager?.cur_page !== 1) return;

    const tid = PageData?.thread?.thread_id;
    if (!tid) return;

    let poll: PollInfo | null;
    try {
        poll = await fetchPollInfo(tid);
    } catch (err) {
        console.warn("[poll-display] 拉取投票数据失败:", err);
        return;
    }
    if (!poll) return;

    const threadList = await asyncdom<"div">("#j_p_postlist");

    const firstPost = threadList.querySelector<HTMLDivElement>(".l_post");
    if (!firstPost) return;

    const contentMain = firstPost.querySelector<HTMLDivElement>(".d_post_content_main") ?? firstPost;

    if (contentMain.hasAttribute(FLAG_ATTR)) return;
    contentMain.setAttribute(FLAG_ATTR, "");

    const threadTitle = _.unescape(PageData.thread.title || "").replace(/^回复：/, "");
    appendJSX(h(PollPanel, { poll, threadTitle }), contentMain);
}
