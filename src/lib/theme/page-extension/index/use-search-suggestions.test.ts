import { createApp } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useSearchSuggestions } from "./use-search-suggestions";

const apiMocks = vi.hoisted(() => ({
    suggestions: vi.fn(),
}));

vi.mock("@/lib/api/tieba", () => ({
    tiebaAPI: {
        suggestions: apiMocks.suggestions,
        URL_forum: (name: string) => `/f?kw=${name}`,
    },
}));

describe("useSearchSuggestions", () => {
    it("keeps the latest query when responses resolve out of order", async () => {
        const first = deferred<Response>();
        const second = deferred<Response>();
        apiMocks.suggestions
            .mockReturnValueOnce(first.promise)
            .mockReturnValueOnce(second.promise);

        let suggestionsState: ReturnType<typeof useSearchSuggestions> | undefined;
        const app = createApp({
            setup() {
                suggestionsState = useSearchSuggestions();
                return () => null;
            },
        });
        const host = document.createElement("div");
        app.mount(host);
        const state = suggestionsState!;

        state.searchText.value = "old";
        const oldRequest = state.loadSuggestions("old");
        state.searchText.value = "new";
        const newRequest = state.loadSuggestions("new");

        second.resolve(responseWithMatches("new"));
        await newRequest;
        expect(state.suggestions.value.map(item => item.title)).toEqual(["new"]);

        first.resolve(responseWithMatches("old"));
        await oldRequest;
        expect(state.suggestions.value.map(item => item.title)).toEqual(["new"]);

        app.unmount();
    });
});

function deferred<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>(done => { resolve = done; });
    return { promise, resolve };
}

function responseWithMatches(name: string): Response {
    return {
        ok: true,
        json: async () => ({
            query_match: {
                search_data: [{ fname: name, fpic: "", forum_desc: `${name} desc` }],
            },
        }),
    } as Response;
}
