import { tiebaAPI } from "./tieba";

export interface ForumThreadImage {
    thumb: string;
    large: string;
    width: number;
    height: number;
}

export interface ForumThreadItem {
    tid: number;
    title: string;
    url: string;
    authorName: string;
    authorAvatar: string;
    authorHome: string;
    authorPortrait: string;
    firstPostId: number;
    createTime: number;
    lastTime: number;
    replyNum: number;
    agreeNum: number;
    abstract: string;
    images: ForumThreadImage[];
    isTop: boolean;
    isGood: boolean;
}

export interface ForumThreadsPage {
    threads: ForumThreadItem[];
    hasMore: boolean;
}

function record(value: unknown): Record<string, unknown> {
    return value !== null && typeof value === "object" && !Array.isArray(value)
        ? value as Record<string, unknown>
        : {};
}

function array(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
}

function text(value: unknown): string {
    return typeof value === "string" ? value : "";
}

function nonNegativeInteger(value: unknown): number {
    const number = typeof value === "number" || (typeof value === "string" && value.trim())
        ? Number(value)
        : NaN;
    return Number.isSafeInteger(number) && number >= 0 ? number : 0;
}

function isOne(value: unknown): boolean {
    return value === 1 || value === "1";
}

function webUrl(value: unknown): string {
    if (typeof value !== "string" || !value.trim()) return "";
    try {
        const url = new URL(value);
        return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
    } catch {
        return "";
    }
}

function authorPortrait(avatar: string, home: string): string {
    const portrait = avatar && new URL(avatar).pathname.match(/\/portrait\/item\/([^/]+)$/)?.[1];
    if (portrait) return portrait;
    return home ? (new URL(home).searchParams.get("id") ?? "").split("?")[0] : "";
}

function parseImages(value: unknown): ForumThreadImage[] {
    return array(value).flatMap(item => {
        const image = record(item);
        if (image.type !== 3 && image.type !== "3") return [];
        const src = webUrl(image.src_pic);
        const big = webUrl(image.big_pic);
        const thumb = src || big;
        const large = webUrl(image.origin_pic) || big || src;
        return thumb && large ? [{
            thumb,
            large,
            width: nonNegativeInteger(image.width),
            height: nonNegativeInteger(image.height),
        }] : [];
    });
}

export function parseForumThreadsResponse(json: unknown): ForumThreadsPage {
    const body = record(json);
    if (body.error_code !== 0 && body.error_code !== "0") {
        throw new Error(text(body.error_msg) || "吧页帖子接口错误");
    }

    const threads = array(body.thread_list).flatMap(item => {
        const thread = record(item);
        const tid = nonNegativeInteger(thread.id) || nonNegativeInteger(thread.tid);
        const title = text(thread.title);
        if (isOne(thread.is_tiebaplus_ad) || !tid || !title.trim()) return [];

        const author = record(thread.author);
        const name = array(author.show_icon_list).map(record).find(icon =>
            icon.type === "name_show" && text(icon.text).trim(),
        );
        const head = record(record(author.user_show_info).feed_head);
        const avatar = webUrl(record(head.image_data).img_url);
        const home = webUrl(head.schema);

        return [{
            tid,
            title,
            url: `/p/${tid}`,
            authorName: text(name?.text),
            authorAvatar: avatar,
            authorHome: home,
            authorPortrait: authorPortrait(avatar, home),
            firstPostId: nonNegativeInteger(thread.first_post_id),
            createTime: nonNegativeInteger(thread.create_time),
            lastTime: nonNegativeInteger(thread.last_time_int),
            replyNum: nonNegativeInteger(thread.reply_num),
            agreeNum: nonNegativeInteger(thread.agree_num ?? record(thread.agree).agree_num),
            abstract: array(thread.abstract).map(record)
                .filter(part => part.type === 0 || part.type === "0")
                .map(part => text(part.text)).join(""),
            images: parseImages(thread.media),
            isTop: isOne(thread.is_top),
            isGood: isOne(thread.is_good),
        }];
    });

    return { threads, hasMore: isOne(record(body.page).has_more) };
}

export async function fetchForumThreads(kw: string, pn: number, sortType: 0 | 1): Promise<ForumThreadsPage> {
    const response = await tiebaAPI.forumThreads(kw, pn, sortType);
    if (!response.ok) throw new Error(`吧页帖子请求失败 (${response.status})`);
    return parseForumThreadsResponse(await response.json());
}
