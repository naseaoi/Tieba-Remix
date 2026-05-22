// 投票面板模块：在帖子首楼底部展示 App 端独有的投票数据
//
// 数据流：
//   PageData.thread.thread_id  → tiebac App 接口 pb/page → poll_info → 渲染面板
// 触发条件：
//   - 必须是帖子页（scope=thread，由 packer 控制）
//   - 必须是第 1 页（首楼仅在 cur_page=1 时存在）
//   - 接口返回 poll_info 才会插入面板，否则静默退出
//
// 失败处理：网络/接口/DOM 任一环节失败均不影响其它模块运行，控制台 warn 即可。

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
    // 翻页（cur_page>1）时首楼不在当前 DOM 中，直接放弃
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

    // 等首楼 DOM 出现后再注入；threadList 内首个 .l_post 即首楼
    const threadList = await asyncdom<"div">("#j_p_postlist");

    const firstPost = threadList.querySelector<HTMLDivElement>(".l_post");
    if (!firstPost) return;

    // 优先挂在楼层正文容器底部，让面板紧贴正文；找不到再退回 .l_post 自身
    const contentMain = firstPost.querySelector<HTMLDivElement>(".d_post_content_main") ?? firstPost;

    // 防止 SPA/observers 二次触发导致重复挂载
    if (contentMain.hasAttribute(FLAG_ATTR)) return;
    contentMain.setAttribute(FLAG_ATTR, "");

    const threadTitle = _.unescape(PageData.thread.title || "").replace(/^回复：/, "");
    appendJSX(h(PollPanel, { poll, threadTitle }), contentMain);
}
