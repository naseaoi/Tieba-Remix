import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
    page: "forum",
    theme: { dark: "#6699cc", light: "#336699" },
}));
const overwriteCSS = vi.hoisted(() => vi.fn((...styles: string[]) => styles.map(css => {
    const element = document.createElement("style");
    element.textContent = css;
    document.head.append(element);
    return element;
})));

vi.mock("@/lib/api/remixed", () => ({
    currentPageType: () => state.page,
    getResource: (path: string) => path,
}));
vi.mock("@/lib/elemental/styles", async importOriginal => ({
    ...await importOriginal<typeof import("@/lib/elemental/styles")>(),
    overwriteCSS,
}));
vi.mock("@/lib/render", () => ({}));
vi.mock("@/lib/user-values", () => ({ themeColor: { get: () => state.theme } }));
vi.mock("@/lib/utils", async importOriginal => {
    const { isLiteralObject } = await importOriginal<typeof import("@/lib/utils")>();
    return { isLiteralObject };
});

vi.mock("@/stylesheets/main/animations.scss?inline", () => ({ default: "animations" }));
vi.mock("@/stylesheets/main/palette.scss?inline", () => ({ default: "palette" }));
vi.mock("@/stylesheets/main/variables.scss?inline", () => ({ default: "variables" }));
vi.mock("@/stylesheets/main/base.scss?inline", () => ({ default: "base" }));
vi.mock("@/stylesheets/main/universal.scss?inline", () => ({ default: "universal" }));
vi.mock("@/stylesheets/tieba/tieba-main.scss?inline", () => ({ default: "tieba-main" }));
vi.mock("@/stylesheets/tieba/tieba-home.scss?inline", () => ({ default: "tieba-home" }));
vi.mock("@/stylesheets/tieba/tieba-forum.scss?inline", () => ({ default: "tieba-forum" }));
vi.mock("@/stylesheets/tieba/tieba-forum-search.scss?inline", () => ({ default: "tieba-forum-search" }));
vi.mock("@/stylesheets/tieba/tieba-thread.scss?inline", () => ({ default: "tieba-thread" }));
vi.mock("@/stylesheets/tieba/tieba-search.scss?inline", () => ({ default: "tieba-search" }));
vi.mock("@/stylesheets/tieba/tieba-error.scss?inline", () => ({ default: "tieba-error" }));
vi.mock("@/stylesheets/tieba-vercel/tieba-main.scss?inline", () => ({ default: "vercel-main" }));
vi.mock("@/stylesheets/tieba-vercel/tieba-home.scss?inline", () => ({ default: "vercel-home" }));
vi.mock("@/stylesheets/tieba-vercel/tieba-forum.scss?inline", () => ({ default: "vercel-forum" }));
vi.mock("@/stylesheets/tieba-vercel/tieba-thread.scss?inline", () => ({ default: "vercel-thread" }));
vi.mock("@/stylesheets/tieba-vercel/tieba-search.scss?inline", () => ({ default: "vercel-search" }));
vi.mock("@/stylesheets/tieba-vercel/tieba-error.scss?inline", () => ({ default: "vercel-error" }));
vi.mock("@/stylesheets/tieba-vercel/settings.scss?inline", () => ({ default: "vercel-settings" }));

const baseStyles = ["animations", "variables", "base", "universal", "palette"];

beforeEach(() => {
    vi.resetModules();
    overwriteCSS.mockClear();
    state.page = "forum";
    state.theme = { dark: "#6699cc", light: "#336699" };
    document.head.innerHTML = "";
});

describe("theme colors", () => {
    it("keeps computed colors and user-view aliases on both theme selectors", async () => {
        const { applyThemeColor } = await import("./index");

        applyThemeColor();

        const style = document.querySelector<HTMLStyleElement>("#remixed-theme-color")!;
        const rules = [...style.sheet!.cssRules] as CSSStyleRule[];
        expect(rules.map(rule => rule.selectorText)).toEqual(["html.dark-theme", "html.light-theme"]);

        const expectedColors = [
            ["#6699cc", "rgb(102 153 204 / 80%)", "hsl(210deg 90% 70%)", "hsl(210deg 100% 80%)", "rgb(102 153 204 / 24%)", "hsl(210deg 100% 75%)"],
            ["#336699", "rgb(51 102 153 / 80%)", "hsl(210deg 10% 30%)", "hsl(210deg 0% 20%)", "rgb(51 102 153 / 24%)", "hsl(210deg 60% 32%)"],
        ];
        const aliases = [
            ["--user-theme", "--tieba-theme-color"],
            ["--user-theme-transp", "--trans-tieba-theme-color"],
            ["--user-theme-hover", "--tieba-theme-hover"],
            ["--user-theme-active", "--tieba-theme-active"],
            ["--user-theme-back", "--tieba-theme-background"],
            ["--user-theme-fore", "--tieba-theme-fore"],
        ];
        rules.forEach((rule, themeIndex) => {
            aliases.forEach(([alias, target], colorIndex) => {
                expect(rule.style.getPropertyValue(target)).toBe(expectedColors[themeIndex][colorIndex]);
                expect(rule.style.getPropertyValue(alias)).toBe(`var(${target})`);
            });
        });

        state.theme = { dark: "#339966", light: "#993366" };
        applyThemeColor();

        expect(document.querySelectorAll("#remixed-theme-color")).toHaveLength(1);
        expect(style.textContent).toContain("--tieba-theme-color: #339966;");
        expect(style.textContent).toContain("--tieba-theme-color: #993366;");
        expect(style.textContent).toContain("--user-theme: var(--tieba-theme-color);");
    });
});

describe("theme CSS loading", () => {
    it.each<[string, string[]]>([
        ["index", ["tieba-main", "tieba-home", "vercel-main", "vercel-home"]],
        ["forum", ["tieba-main", "tieba-forum", "tieba-forum-search", "vercel-main", "vercel-forum"]],
        ["thread", ["tieba-main", "tieba-thread", "vercel-main", "vercel-thread"]],
        ["search", ["tieba-search", "vercel-main", "vercel-search"]],
        ["unknown", ["tieba-error", "vercel-error"]],
    ])("loads base styles before Vercel overrides on %s pages", async (page, pageStyles) => {
        state.page = page;
        const { loadMainCSS } = await import("./index");

        await loadMainCSS();

        expect(overwriteCSS.mock.calls).toEqual([baseStyles, pageStyles]);
        expect([...document.head.querySelectorAll("style")].map(style => style.textContent))
            .toEqual([...baseStyles, ...pageStyles]);
    });

    it("deduplicates concurrent and repeated loads", async () => {
        const { loadMainCSS } = await import("./index");

        await Promise.all([loadMainCSS(), loadMainCSS()]);
        await loadMainCSS();

        expect(overwriteCSS).toHaveBeenCalledTimes(2);
    });

    it("loads settings overrides unconditionally and caches them", async () => {
        const { ensureSettingsCSS } = await import("./index");

        const [first, second] = await Promise.all([ensureSettingsCSS(), ensureSettingsCSS()]);

        expect(first).toBe(second);
        expect(overwriteCSS.mock.calls).toEqual([["vercel-settings"]]);
    });
});
