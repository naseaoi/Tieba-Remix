export type SearchPostType = "thread" | "comment";
export type SearchSort = "time" | "relevance";

export interface SearchQuery {
    word: string;
    forumName?: string;
    type: SearchPostType;
    sort: SearchSort;
    page: number;
    pageSize?: number;
}

export interface SearchAuthor {
    id?: number;
    name: string;
    displayName: string;
    portrait: string;
    avatar: string;
}

export interface SearchImage {
    thumb: string;
    full: string;
    width: number;
    height: number;
}

export interface SearchQuote {
    author: string;
    content: string;
    image?: string;
    url?: string;
}

export interface SearchPost {
    key: string;
    type: SearchPostType;
    tid: number;
    pid: number;
    url: string;
    title: string;
    content: string;
    time: number;
    author: SearchAuthor;
    forum: { id: number; name: string; avatar: string };
    replyCount: number;
    agreeCount: number;
    images: SearchImage[];
    video?: { cover: string };
    quote?: SearchQuote;
}

export interface SearchResultPage {
    posts: SearchPost[];
    hasMore: boolean;
    page: number;
}

export interface ForumSidebar {
    name: string;
    avatar: string;
    intro: string;
    tags: string[];
    memberCount: string;
    postCount: string;
    createdAt: string;
    followed: boolean;
    level?: { index: number; name: string; exp: number; expMax: number };
    managers: { role: string; name: string; avatar: string; homeUrl: string }[];
}

function record(value: unknown): Record<string, unknown> {
    return value !== null && typeof value === "object" && !Array.isArray(value)
        ? value as Record<string, unknown> : {};
}

function array(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
}

function text(value: unknown): string {
    return typeof value === "string" ? value : "";
}

function integer(value: unknown): number {
    const number = typeof value === "number" || (typeof value === "string" && value.trim()) ? Number(value) : NaN;
    return Number.isSafeInteger(number) && number >= 0 ? number : 0;
}

function flag(value: unknown): boolean {
    return value === true || value === 1 || value === "1";
}

function plainText(value: unknown): string {
    const html = text(value);
    if (!/[<&]/.test(html)) return html.trim();
    const template = document.createElement("template");
    template.innerHTML = html;
    template.content.querySelectorAll("script, style").forEach(node => node.remove());
    template.content.querySelectorAll("br").forEach(node => node.replaceWith("\n"));
    return (template.content.textContent ?? "").trim();
}

function webUrl(value: unknown): string {
    const source = text(value).trim();
    if (!source) return "";
    try {
        const url = new URL(source.startsWith("//") ? `https:${source}` : source);
        return ["https:", "http:"].includes(url.protocol) ? url.href : "";
    } catch {
        return "";
    }
}

function portraitToken(value: unknown): string {
    const source = text(value);
    const avatar = webUrl(source);
    const token = avatar ? new URL(avatar).pathname.match(/\/portrait\/item\/([^/]+)$/)?.[1] ?? "" : source.split("?")[0];
    return /^[\w.-]+$/.test(token) ? token : "";
}

function avatarUrl(value: unknown): string {
    const token = portraitToken(value);
    return webUrl(value) || (token ? `https://gss0.baidu.com/7Ls0a8Sm2Q5IlBGlnYG/sys/portrait/item/${token}` : "");
}

function author(value: unknown): SearchAuthor {
    const user = record(value);
    const name = plainText(user.user_name);
    return {
        id: integer(user.user_id) || undefined,
        name,
        displayName: plainText(user.show_nickname) || name,
        portrait: portraitToken(user.portrait),
        avatar: avatarUrl(user.portrait),
    };
}

function images(value: unknown): SearchImage[] {
    return array(value).map(record).flatMap(media => {
        if (media.type !== "pic") return [];
        const full = webUrl(media.big_pic) || webUrl(media.water_pic) || webUrl(media.small_pic);
        const thumb = webUrl(media.small_pic) || full;
        return full ? [{ thumb, full, width: integer(media.width), height: integer(media.height) }] : [];
    });
}

function postUrl(tid: number, pid = 0, cid = 0): string {
    if (!pid) return `/p/${tid}`;
    return `/p/${tid}?pid=${pid}${cid ? `&cid=${cid}` : ""}#${cid || pid}`;
}

function quote(post: Record<string, unknown>, tid: number): SearchQuote | undefined {
    const floor = record(post.post_info);
    const main = record(post.main_post);
    const source = Object.keys(floor).length ? floor : main;
    if (!Object.keys(source).length) return;
    const media = array(post.media).map(record);
    // 搜索评论的顶层 media 属于原帖，SPA 将首图放在引用卡片中。
    const image = media.map(item => webUrl(item.water_pic) || webUrl(item.small_pic) || webUrl(item.big_pic) || webUrl(item.vpic)).find(Boolean);
    return {
        author: author(source.user).displayName,
        content: plainText(source === floor ? source.content : source.title) || plainText(source.content),
        image: image || undefined,
        url: postUrl(integer(source.tid) || tid, source === floor ? integer(source.pid) : 0),
    };
}

export function parseSearchResult(raw: unknown): SearchResultPage {
    const data = record(record(raw).data);
    const seen = new Set<string>();
    const posts = array(data.post_list).map(record).flatMap((post): SearchPost[] => {
        const tid = integer(post.tid);
        if (!tid) return [];
        const pid = integer(post.pid);
        const cid = integer(post.cid);
        const type: SearchPostType = [2, 3].includes(integer(post.type)) || post.main_post || post.post_info ? "comment" : "thread";
        const key = `${type}:${tid}:${pid}:${cid}`;
        if (seen.has(key)) return [];
        seen.add(key);
        const forum = record(post.forum_info);
        const video = array(post.media).map(record).find(item => item.type === "flash");
        const cover = webUrl(video?.vpic);
        const milliseconds = integer(post.time) * 1000;
        return [{
            key,
            type,
            tid,
            pid,
            url: postUrl(tid, type === "comment" ? pid : 0, type === "comment" ? cid : 0),
            title: type === "thread" ? plainText(post.title) : "",
            content: plainText(post.content),
            time: Number.isSafeInteger(milliseconds) && milliseconds <= 8640000000000000 ? milliseconds : 0,
            author: author(post.user),
            forum: { id: integer(post.forum_id), name: plainText(forum.forum_name) || plainText(post.forum_name), avatar: webUrl(forum.avatar) },
            replyCount: integer(post.post_num),
            agreeCount: integer(post.like_num),
            images: type === "thread" ? images(post.media) : [],
            video: type === "thread" && video ? { cover } : undefined,
            quote: type === "comment" ? quote(post, tid) : undefined,
        }];
    });
    return { posts, hasMore: flag(data.has_more), page: integer(data.current_page) || 1 };
}

function countText(value: unknown): string {
    return typeof value === "string" ? plainText(value)
        : typeof value === "number" && Number.isFinite(value) && value >= 0 ? String(value) : "";
}

export function parseForumSidebar(raw: unknown): ForumSidebar {
    const body = record(raw);
    const data = record(body.data);
    const brief = record(data.forum_brief);
    // frsSidebarRight 缺少吧名、头像、关注状态和标签；请求层合入 frsBottom_pc 的 forum / area_data。
    const forum = record(body.forum);
    const member = record(data.forum_member_info);
    const level = integer(member.user_level);
    const tags = array(body.area_data).map(record)
        .filter(area => area.area_type === "forum-bang-card")
        .flatMap(area => array(area.card_data).map(record))
        .flatMap(card => array(record(card.data).bang_list).map(record))
        .filter(tag => integer(tag.tab_type) === 1)
        .map(tag => plainText(tag.tab_name)).filter(Boolean);
    const roles: Record<string, string> = { manager: "吧主", assist: "小吧主", voiceadmin: "语音小编", picadmin: "图片小编", videoadmin: "视频小编" };
    return {
        name: plainText(forum.name),
        avatar: webUrl(forum.avatar),
        intro: [plainText(brief.slogan ?? forum.slogan), plainText(brief.desc ?? forum.desc)].filter(Boolean).join("\n"),
        tags: [...new Set(tags)],
        memberCount: countText(brief.member_num ?? forum.member_num),
        postCount: countText(brief.post_num ?? forum.post_num),
        createdAt: plainText(brief.create_day),
        followed: flag(forum.is_like),
        level: level ? { index: level, name: plainText(member.level_name), exp: integer(member.cur_score), expMax: integer(member.levelup_score) } : undefined,
        managers: array(record(data.member_group_info).member_group_list).map(record).flatMap(manager => {
            const name = plainText(manager.name_show);
            if (!name) return [];
            const token = portraitToken(manager.portrait);
            const role = text(manager.role_name);
            return [{
                role: roles[role] || "吧务",
                name,
                avatar: avatarUrl(manager.portrait),
                homeUrl: token ? `/home/main?id=${encodeURIComponent(token)}` : "",
            }];
        }),
    };
}
