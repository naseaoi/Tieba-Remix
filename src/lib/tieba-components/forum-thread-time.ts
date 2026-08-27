const TIME_ONLY_RE = /^\d{1,2}:\d{2}$/;
const MONTH_DAY_RE = /^(\d{1,2})-(\d{1,2})$/;
const YEAR_MONTH_RE = /^(\d{4})-(\d{1,2})$/;

export type ForumThreadTimeAge = "month" | "year";

/** 吧首页列表时间戳只有三种形态：今日 HH:MM、本年 M-D、往年 YYYY-MM */
export function classifyForumThreadTime(raw: string, now = new Date()): ForumThreadTimeAge | undefined {
    const target = parseForumThreadTime(raw, now);
    if (!target) return undefined;

    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    if (target.getTime() <= oneYearAgo.getTime()) return "year";

    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    if (target.getTime() <= oneMonthAgo.getTime()) return "month";

    return undefined;
}

function parseForumThreadTime(raw: string, now: Date): Date | undefined {
    const value = raw.trim();
    if (!value || TIME_ONLY_RE.test(value)) return undefined;

    const yearMonth = YEAR_MONTH_RE.exec(value);
    if (yearMonth) {
        const month = Number(yearMonth[2]);
        if (month < 1 || month > 12) return undefined;
        return new Date(Number(yearMonth[1]), month - 1, 1);
    }

    const monthDay = MONTH_DAY_RE.exec(value);
    if (!monthDay) return undefined;
    const month = Number(monthDay[1]);
    const day = Number(monthDay[2]);
    if (month < 1 || month > 12 || day < 1 || day > 31) return undefined;

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(now.getFullYear(), month - 1, day);
    // 跨年时贴吧仍可能给出 M-D，落在未来就归到上一年
    if (target.getTime() > today.getTime()) target.setFullYear(now.getFullYear() - 1);
    return target;
}
