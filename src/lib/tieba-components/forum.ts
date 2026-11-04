export interface ForumInfo {
    name: string;
    // followersDisplay: string;
    // postsDisplay: string;
}

export interface ForumComponents {
    nameAnchor: HTMLAnchorElement;
    iconContainer: HTMLAnchorElement;
    followButton: HTMLAnchorElement;
    signButton: HTMLAnchorElement;
}

export interface TiebaForum {
    info: ForumInfo;
    components: ForumComponents;
}

// 吧页主体由 Bigpipe pagelet 异步渲染，冷缓存时常晚于 DOMContentLoaded；超时视为非标准吧页
export const FORUM_PAGELET_TIMEOUT_MS = 15000;
