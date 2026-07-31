let parser: ((src: string) => string) | null = null;

export async function renderMarkdown(src: string): Promise<string> {
    if (!parser) {
        const [{ marked }, { default: DOMPurify }] = await Promise.all([
            import("marked"),
            import("dompurify"),
        ]);
        parser = (s: string) => DOMPurify.sanitize(
            marked.parse(s, { async: false }) as string,
            {
                USE_PROFILES: { html: true },
                FORBID_TAGS: ["embed", "form", "iframe", "object", "style"],
                FORBID_ATTR: ["style"],
                ALLOW_DATA_ATTR: false,
            },
        );
    }
    return parser(src);
}
