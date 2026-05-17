import { dom } from "@/lib/elemental";
import { TiebaForum } from "@/lib/tieba-components/forum";

export interface ThreadContent {
    post: HTMLDivElement;
    replyButton: HTMLAnchorElement;
    dataField: string;
    isLouzhu: boolean;

    profile: {
        avatar: HTMLAnchorElement;
        nameAnchor: HTMLAnchorElement;
        level: number;
        badgeTitle: string;
    }

    tail: {
        location: string;
        platform: string;
        floor: string;
        time: string;
    }
}

export interface TiebaThread {
    title: string;
    reply: number;
    pages: number;

    displayWrapper: HTMLDivElement;
    lzOnlyButton: HTMLAnchorElement;
    favorButton: HTMLAnchorElement;

    forum: TiebaForum;
    cotents: ThreadContent[];

    pager: {
        listPager: HTMLLIElement;
        jumper: {
            textbox: HTMLInputElement;
            submitButton: HTMLButtonElement;
        }
    }
}

export interface PostDataField {
    author: {
        portrait: string;
        props: unknown;
        user_id: number;
        user_name: string;
        user_nickname: string;
    }

    content: {
        builderId: number;
        /** 评论数量 */
        comment_num: number;
        /** 待解析的 HTML */
        content: string;
        forum_id: number;
        isPlus: number;
        is_anonym: number;
        is_fold: number;
        pb_tpoint: unknown;
        post_id: number;
        /** 当前楼层在当前页的实际位置 */
        post_index: number;
        /** 一般意义上的楼层数 */
        post_no: number;
        props: unknown;
        thread_id: number;
        type: "0"
    }
}

export function threadParser(): TiebaThread {
    const postWrappers = dom<"div">(".l_post", []);
    const threadContents: ThreadContent[] = [];

    for (let i = 0; i < postWrappers.length; i++) {
        const wrap = postWrappers[i];
        const content = dom<"div">(".d_post_content", wrap);
        if (!content) continue;
        const dAuthor = dom<"div">(".d_author", wrap);
        const avatar = dom<"a">(".p_author_face", wrap);
        const nameAnchor = dom<"a">(".p_author_name", wrap);
        if (!avatar || !nameAnchor) continue;

        const levelEl = dom<"div">(".d_badge_lv", wrap);
        const badgeTitleEl = dom<"div">(".d_badge_title", wrap);
        const replyButton = dom<"a">(".lzl_link_unfold", wrap);
        const locationEl = dom<"span">(".post-tail-wrap span:first-child, .ip-location", wrap);
        const platformEl = dom<"a">(".tail-info a, .p_tail_wap", wrap);
        const floorEl = dom<"span">(".j_jb_ele + .tail-info + .tail-info, .p_tail li:first-child span", wrap);
        const timeEl = dom<"span">(".post-tail-wrap span:nth-last-child(2), .p_tail li:last-child span", wrap);

        content.classList.add("floor-content");
        avatar.classList.add("floor-avatar");
        nameAnchor.classList.add("floor-name");

        threadContents.push({
            post: content,
            replyButton: replyButton as HTMLAnchorElement,
            dataField: wrap.getAttribute("data-field") ?? "",
            isLouzhu: !!(dAuthor && dom(".louzhubiaoshi_wrap", dAuthor)),

            profile: {
                avatar,
                nameAnchor,
                level: parseInt((levelEl?.textContent ?? "").trim()),
                badgeTitle: (badgeTitleEl?.textContent ?? "").trim(),
            },
            tail: {
                location: (locationEl?.textContent ?? "").trim(),
                platform: (platformEl?.textContent ?? "").trim(),
                floor: (floorEl?.textContent ?? "").trim(),
                time: (timeEl?.textContent ?? "").trim(),
            },
        });
    }

    const thread: TiebaThread = {
        displayWrapper: dom<"div">(".wrap2", [])[0],
        title: PageData.thread.title,
        reply: +(dom<"span">(".l_reply_num span:nth-child(1)")?.innerText ?? 0),
        pages: PageData.pager.total_page,
        lzOnlyButton: dom<"a">("#lzonly_cntn", [])[0],
        favorButton: dom<"a">(".j_favor", [])[0],

        cotents: threadContents,
        forum: {
            info: {
                name: PageData.forum.forum_name,
                // followersDisplay: DOMS(true, ".card_menNum", "span").innerText,
                // postsDisplay: DOMS(true, ".card_infoNum", "span").innerText,
            },

            components: {
                nameAnchor: dom<"a">(".card_title_fname", [])[0],
                iconContainer: dom<"a">(".card_head a, .plat_picbox", [])[0],
                followButton: dom<"a">(".card_head .focus_btn", [])[0],
                signButton: dom<"a">(".j_sign_box", [])[0],
            },
        },
        pager: {
            listPager: dom<"li">(".pb_list_pager", [])[0],
            jumper: {
                textbox: dom<"input">(".jump_input_bright", [])[0],
                submitButton: dom<"button">(".jump_btn_bright", [])[0],
            },
        },
    };

    return thread;
}
