const TIEBA_TIME_RE = /^(?:(\d{4})-)?(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{2})$/;

export function humanizeTiebaTime(raw: string): string | undefined {
    const match = TIEBA_TIME_RE.exec(raw.trim());
    if (!match) return undefined;

    const now = new Date();
    const year = match[1] ? Number(match[1]) : now.getFullYear();
    const target = new Date(year, Number(match[2]) - 1, Number(match[3]));
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayDiff = Math.round((today.getTime() - target.getTime()) / 86_400_000);
    const time = `${match[4]}:${match[5]}`;

    if (dayDiff === 0) return `今天 ${time}`;
    if (dayDiff === 1) return `昨天 ${time}`;
    return undefined;
}
