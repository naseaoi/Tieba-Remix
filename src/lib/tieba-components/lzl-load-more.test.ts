import { beforeEach, describe, expect, it, vi } from "vitest";
import { tiebaAPI } from "@/lib/api/tieba";
import { threadCommentsObserver } from "@/lib/observers";
import { appendCommentPosts, parseCommentPage, renderLzlLoadMore } from "./lzl-load-more";
import { renderLzlReplyTrees } from "./lzl-reply-tree";
import { renderLzlFloorControls } from "./lzl-floor-controls";

vi.mock("@/lib/api/tieba", () => ({ tiebaAPI: { commentPage: vi.fn() } }));

const post = (id: number, author = "a", target = "") =>
    `<li class="lzl_single_post j_lzl_s_p" data-field='{"spid":${id},"portrait":"${author}"}' ${target ? `data-tbr-reply-to="${target}"` : ""}><a class="lzl_s_r">回复</a></li>`;
const pager = (page = 1, total = 2) =>
    `<li class="lzl_li_pager" data-field='{total_page:${total}}'><a class="j_lzl_p btn-sub">我也说一句</a><p class="j_pager"><span class="tP">${page}</span><a href="#2">下一页</a></p></li>`;
const response = (html: string) => ({ ok: true, text: async () => html }) as Response;
const ids = (list: HTMLElement) => [...list.querySelectorAll(".lzl_single_post")].map(x => JSON.parse(x.getAttribute("data-field")!).spid);

function fixture(html = `${post(1)}<ul class="lzl_post_hidden" style="display:none">${post(2)}</ul>${pager()}`) {
    document.body.innerHTML = `<div id="j_p_postlist"><div class="l_post" data-pid="123"><ul class="j_lzl_m_w">${html}</ul></div></div>`;
    return document.querySelector<HTMLElement>("ul.j_lzl_m_w")!;
}
function clickMore(list: HTMLElement) {
    list.querySelector<HTMLButtonElement>(".tbr-lzl-load-more")!.click();
}

beforeEach(() => {
    vi.mocked(tiebaAPI.commentPage).mockReset();
    vi.stubGlobal("PageData", { thread: { thread_id: 456 }, forum: { id: "789" }, power: {}, user: { user_name: "me" } });
});

describe("parseCommentPage", () => {
    it("解析原生 JSON 回复字段和首屏未引号分页字段", () => {
        const result = parseCommentPage(post(3) + pager(2));
        expect(result).toMatchObject({ current: 2, total: 2 });
        expect(result.posts).toHaveLength(1);
        expect(result.posts[0].querySelector(".lzl_s_r")).not.toBeNull();
    });
    it("解析 AJAX JSON 分页字段", () => {
        expect(parseCommentPage(post(3) + pager(2).replace("{total_page:2}", '{"total_page":2}')).total).toBe(2);
    });
    it("拒绝错误页、空页和无效编号", () => {
        expect(() => parseCommentPage("<html>登录验证</html>")).toThrow();
        expect(() => parseCommentPage(pager())).toThrow();
        expect(() => parseCommentPage(post(3).replace('"spid":3', '"spid":"invalid"') + pager())).toThrow();
    });
});

describe("楼中楼加载更多", () => {
    it("保留已加载节点，追加去重且隐藏回复也参与去重", () => {
        const list = fixture();
        const existing = list.querySelector("li")!;
        appendCommentPosts(list, parseCommentPage(post(1) + post(2) + post(3) + post(3) + pager(2)).posts, list.querySelector(".lzl_li_pager")!);
        expect(ids(list)).toEqual([1, 2, 3]);
        expect(list.querySelector("li")).toBe(existing);
        expect(list.lastElementChild?.classList.contains("lzl_li_pager")).toBe(true);
    });

    it("一次请求展开隐藏回复并跨页建树，完成后控件隐藏", async () => {
        const list = fixture();
        vi.mocked(tiebaAPI.commentPage).mockResolvedValue(response(post(3, "b", "a") + pager(2)));
        renderLzlLoadMore();
        renderLzlLoadMore();
        expect(list.querySelectorAll(".tbr-lzl-load-more")).toHaveLength(1);
        renderLzlFloorControls();
        expect(list.querySelector(".lzl_li_pager")?.classList.contains("tbr-lzl-empty-pager")).toBe(false);
        clickMore(list);
        clickMore(list);
        expect(list.querySelector("button")?.disabled).toBe(true);
        await vi.waitFor(() => expect(ids(list)).toHaveLength(3));
        expect(tiebaAPI.commentPage).toHaveBeenCalledExactlyOnceWith(456, 123, 789, 2);
        renderLzlReplyTrees();
        expect(list.querySelectorAll(":scope > .lzl_single_post")).toHaveLength(3);
        expect(list.querySelectorAll<HTMLElement>(".lzl_single_post")[2].style.getPropertyValue("--tbr-lzl-depth")).toBe("2");
        expect(list.querySelector("button")?.hidden).toBe(true);
        renderLzlFloorControls();
        expect(list.querySelector(".lzl_li_pager")?.classList.contains("tbr-lzl-empty-pager")).toBe(true);
    });

    it("失败可重试，失败不推进页码", async () => {
        const list = fixture();
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        vi.mocked(tiebaAPI.commentPage).mockRejectedValueOnce(new Error("offline"))
            .mockResolvedValueOnce(response(post(3) + pager(2)));
        renderLzlLoadMore();
        clickMore(list);
        await vi.waitFor(() => expect(list.querySelector("button")?.textContent).toContain("重试"));
        expect(ids(list)).toEqual([1, 2]);
        clickMore(list);
        await vi.waitFor(() => expect(ids(list)).toHaveLength(3));
        expect(vi.mocked(tiebaAPI.commentPage).mock.calls.map(call => call[3])).toEqual([2, 2]);
        warn.mockRestore();
    });

    it("原生刷新最后一页后保留前页，刷新页以新内容为准", async () => {
        const list = fixture();
        vi.mocked(tiebaAPI.commentPage).mockResolvedValue(response(post(3) + post(4) + pager(2)));
        renderLzlLoadMore();
        clickMore(list);
        await vi.waitFor(() => expect(ids(list)).toHaveLength(4));
        list.innerHTML = post(4) + post(5) + pager(2);
        renderLzlLoadMore();
        renderLzlReplyTrees();
        expect(ids(list)).toEqual([1, 2, 4, 5]);
        expect(list.querySelector("button")?.hidden).toBe(true);
    });

    it("原生跳到末页时从缺失的第一页开始补齐", async () => {
        const list = fixture(post(3) + pager(3, 3));
        vi.mocked(tiebaAPI.commentPage).mockResolvedValue(response(post(1) + pager(1, 3)));
        renderLzlLoadMore();
        clickMore(list);
        await vi.waitFor(() => expect(ids(list)).toHaveLength(2));
        expect(tiebaAPI.commentPage).toHaveBeenCalledWith(456, 123, 789, 1);
        expect(list.querySelector("button")?.hidden).toBe(false);
    });

    it("单页隐藏回复也由同一按钮展开，原生点击查看与翻页隐藏", () => {
        const list = fixture(post(1) + pager(1, 1));
        renderLzlLoadMore();
        expect(list.querySelector(".tbr-lzl-load-more")).toBeNull();

        const more = '<p class="lzl_more"><a class="j_lzl_m">点击查看</a></p>';
        list.innerHTML = `${post(1)}<ul class="lzl_post_hidden" style="display:none">${post(2)}${post(3)}</ul>${
            pager(1, 1).replace("{total_page:1}", "{total_num:3,total_page:1}").replace('<p class="j_pager">', `${more}<p class="j_pager">`)}`;
        renderLzlLoadMore();
        const button = list.querySelector<HTMLButtonElement>(".tbr-lzl-load-more")!;
        expect(button.textContent).toBe("还有 2 条回复");
        expect(list.querySelector<HTMLElement>(".lzl_more")?.style.display).toBe("none");
        expect(list.querySelector<HTMLElement>(".j_pager")?.hidden).toBe(true);

        clickMore(list);
        expect(tiebaAPI.commentPage).not.toHaveBeenCalled();
        expect([...list.querySelectorAll(":scope > .lzl_single_post")].map(x => JSON.parse(x.getAttribute("data-field")!).spid)).toEqual([1, 2, 3]);
        expect(button.hidden).toBe(true);
    });

    it("按钮文案显示剩余条数且重复刷新不改写 DOM", () => {
        const list = fixture(`${post(1)}<ul class="lzl_post_hidden" style="display:none">${post(2)}</ul>${
            pager().replace("{total_page:2}", "{total_num:12,total_page:2}")}`);
        renderLzlLoadMore();
        const label = list.querySelector(".tbr-lzl-load-more-label")!;
        const text = label.firstChild;
        expect(label.textContent).toBe("还有 11 条回复");
        renderLzlLoadMore();
        expect(label.firstChild).toBe(text);
    });

    it("原生直接删除的回复不会在后续刷新中复活", async () => {
        const list = fixture();
        vi.mocked(tiebaAPI.commentPage).mockResolvedValue(response(post(3) + pager(2)));
        renderLzlLoadMore();
        clickMore(list);
        await vi.waitFor(() => expect(ids(list)).toHaveLength(3));
        list.querySelector(".lzl_single_post")!.remove();
        renderLzlLoadMore();
        list.innerHTML = post(3) + post(4) + pager(2);
        renderLzlLoadMore();
        renderLzlReplyTrees();
        expect(ids(list)).toEqual([2, 3, 4]);
    });

    it("请求期间原生刷新后丢弃旧响应", async () => {
        const list = fixture();
        let resolve!: (value: Response) => void;
        vi.mocked(tiebaAPI.commentPage).mockReturnValue(new Promise(done => { resolve = done; }));
        renderLzlLoadMore();
        clickMore(list);
        list.innerHTML = post(8) + pager();
        renderLzlLoadMore();
        resolve(response(post(3) + pager(2)));
        await new Promise(done => setTimeout(done, 0));
        expect(ids(list)).toEqual([8]);
        expect(list.querySelector("button")?.disabled).toBe(false);
    });

    it("追加的接口回复按原生规则补齐举报/删除入口，已有入口不重复写入", () => {
        const list = fixture();
        const reply = (id: number, name: string) =>
            `<li class="lzl_single_post j_lzl_s_p" data-field='{"spid":${id}}'><a class="j_user_card" username="${name}"></a><div class="lzl_content_reply"><span class="lzl_jb" style="display:none;"></span></div></li>`;
        const anchor = list.querySelector<HTMLElement>(".lzl_li_pager")!;
        appendCommentPosts(list, parseCommentPage(reply(3, "other") + reply(4, "me") + pager(2)).posts, anchor);
        const entries = [...list.querySelectorAll(".lzl_jb")];
        expect(entries[0].querySelector("a.lzl_jb_in")).not.toBeNull();
        expect(entries[1].querySelector("a.lzl_delate_in")?.textContent).toBe("删除");

        list.querySelectorAll(".lzl_single_post").forEach(x => x.remove());
        vi.stubGlobal("PageData", { ...PageData, power: { can_mask_delete: true } });
        appendCommentPosts(list, parseCommentPage(reply(5, "other") + pager(2)).posts, anchor);
        expect(list.querySelector(".lzl_jb")?.childElementCount).toBe(0);
    });

    it("追加节点触发共享楼中楼 observer", async () => {
        const list = fixture();
        const callback = vi.fn();
        threadCommentsObserver.observe();
        threadCommentsObserver.addEvent(callback);
        callback.mockClear();
        appendCommentPosts(list, parseCommentPage(post(3) + pager(2)).posts, list.querySelector(".lzl_li_pager")!);
        await vi.waitFor(() => expect(callback).toHaveBeenCalled());
        threadCommentsObserver.events.splice(threadCommentsObserver.events.indexOf(callback), 1);
    });
});
