import { beforeEach, describe, expect, it, vi } from "vitest";
import { installLzlFloorControls, renderLzlFloorControls } from "./lzl-floor-controls";

describe("lzl floor controls", () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div class="l_post">
                <div class="j_lzl_r p_reply">
                    <a class="lzl_link_unfold" style="display: none">回复(2)</a>
                    <span class="lzl_link_fold">收起回复</span>
                </div>
                <div class="core_reply_wrapper">
                    <div class="core_reply_content">
                        <ul class="j_lzl_m_w">
                            <li class="lzl_single_post">楼中楼回复</li>
                            <ul class="lzl_post_hidden" style="display: block">
                                <li class="lzl_single_post">展开后的楼中楼回复</li>
                            </ul>
                            <li class="lzl_li_pager">
                                <a class="j_lzl_p btn-sub">我也说一句</a>
                                <p>&nbsp;</p>
                            </li>
                        </ul>
                        <div class="j_lzl_e_c" style="display: none"></div>
                    </div>
                    <div class="core_reply_border_bottom"></div>
                </div>
            </div>
        `;
    });

    it("separates floor commenting from collapsing", async () => {
        installLzlFloorControls();
        renderLzlFloorControls();

        const unfold = document.querySelector<HTMLElement>(".lzl_link_unfold")!;
        const fold = document.querySelector<HTMLElement>(".lzl_link_fold")!;
        const entry = document.querySelector<HTMLElement>(".j_lzl_p")!;
        const boundary = document.querySelector<HTMLElement>(".core_reply_border_bottom")!;
        const pager = document.querySelector<HTMLElement>(".lzl_li_pager")!;
        const list = document.querySelector<HTMLElement>(".j_lzl_m_w")!;
        const posts = document.querySelectorAll<HTMLElement>(".lzl_single_post");
        const firstPost = posts[0];
        const lastPost = posts[1];
        const collapse = document.querySelector<HTMLButtonElement>(".tbr-lzl-collapse")!;
        const editor = document.querySelector<HTMLElement>(".j_lzl_e_c")!;
        const comment = vi.fn();
        const nativeCollapse = vi.fn();
        entry.addEventListener("click", () => {
            comment();
            editor.style.display = editor.style.display === "none" ? "block" : "none";
        });
        fold.addEventListener("click", nativeCollapse);

        expect(unfold.getAttribute("aria-label")).toBe("评论");
        expect(fold.getAttribute("aria-label")).toBe("评论");
        expect(fold.getAttribute("role")).toBe("button");
        expect(fold.tabIndex).toBe(0);
        expect(entry.classList.contains("tbr-lzl-comment-entry")).toBe(true);
        expect(entry.getAttribute("aria-hidden")).toBe("true");
        expect(entry.tabIndex).toBe(-1);
        expect(pager.classList.contains("tbr-lzl-empty-pager")).toBe(true);
        expect(list.classList.contains("tbr-lzl-list-without-pager")).toBe(true);
        expect(firstPost.classList.contains("tbr-lzl-last-post")).toBe(false);
        expect(lastPost.classList.contains("tbr-lzl-last-post")).toBe(true);
        expect(boundary.classList.contains("tbr-lzl-collapse-boundary")).toBe(true);
        expect(collapse.getAttribute("aria-label")).toBe("收起回复");

        const more = document.createElement("p");
        more.className = "lzl_more";
        pager.appendChild(more);
        renderLzlFloorControls();
        expect(pager.classList.contains("tbr-lzl-pager-with-more")).toBe(true);
        expect(pager.classList.contains("tbr-lzl-empty-pager")).toBe(false);
        expect(list.classList.contains("tbr-lzl-list-without-pager")).toBe(false);
        expect(lastPost.classList.contains("tbr-lzl-last-post")).toBe(false);
        more.remove();
        renderLzlFloorControls();
        expect(pager.classList.contains("tbr-lzl-pager-with-more")).toBe(false);

        fold.click();
        expect(comment).toHaveBeenCalledTimes(1);
        expect(nativeCollapse).not.toHaveBeenCalled();

        collapse.click();
        expect(nativeCollapse).toHaveBeenCalledTimes(1);

        fold.style.display = "none";
        unfold.style.display = "";
        editor.style.display = "none";
        const nativeExpand = vi.fn();
        unfold.addEventListener("click", nativeExpand);
        unfold.click();
        await new Promise(resolve => window.setTimeout(resolve, 350));

        expect(nativeExpand).toHaveBeenCalledTimes(1);
        expect(comment).toHaveBeenCalledTimes(2);
        expect(editor.style.display).toBe("block");

        fold.style.display = "none";
        unfold.style.display = "";
        unfold.click();
        await new Promise(resolve => window.setTimeout(resolve, 350));

        expect(nativeExpand).toHaveBeenCalledTimes(2);
        expect(comment).toHaveBeenCalledTimes(2);
        expect(editor.style.display).toBe("block");
    });
});
