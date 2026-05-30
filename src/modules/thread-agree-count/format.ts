export function formatCount(count: number): string {
    if (count < 10_000) return String(count);

    const value = count / 10_000;
    const digits = value >= 10 ? 0 : 1;
    return `${value.toFixed(digits).replace(/\.0$/, "")}万`;
}
