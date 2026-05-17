let parser: ((src: string) => string) | null = null;

export async function renderMarkdown(src: string): Promise<string> {
    if (!parser) {
        const { marked } = await import("marked");
        parser = (s: string) => marked.parse(s, { async: false }) as string;
    }
    return parser(src);
}
